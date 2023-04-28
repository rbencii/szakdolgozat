// Creating a new supabase server client object (e.g. in API route):
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Database } from '../../../assets/supabase'
import { createClient } from '@supabase/supabase-js'
import { CardData } from '@/components/hand'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const supabaseServerClient = createServerSupabaseClient<Database>({
        req,
        res,
    })
    const {
        data: { user },
    } = await supabaseServerClient.auth.getUser()

    const { handidx, cardidx } = req.body

    if (!user) {
        res.status(401).json({ error: "Unauthorized" })
        return;
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.PRIVATE_SERVICE_KEY;

    if (!url || !key) {
        res.status(500).json({ error: "Missing environment variables" })
        return;
    }

    //console.log(handidx, cardidx)

    if (handidx === undefined || cardidx === undefined) {
        res.status(400).json({ error: "Missing parameters" })
        return;
    }



    //check if player's in started game
    const { data } = await supabaseServerClient
        .from('session_players')
        .select(`
    id,
    session(
        id,
        started,
        games(
            gamefields,
            playerfields,
            init,
            games_rules(
                rules(
                    id,
                    name,
                    operator,
                    left_field,
                    right_field,
                    left_player,
                    right_player,
                    right_value,
                    left_value,
                    required,
                    or_bool,
                    actions(
                        left_field,
                        right_field,
                        action,
                        number,
                        left_player,
                        right_player,
                        right_value,
                        left_value,
                        operator,
                        round_attr
                    )
                )
            )
        )
        
    )
    `).eq('user_id', user.id).single();

    const { id: session_id, started } = data?.session as any;
    const { id: session_players_id } = data as any;
    if (started === undefined || session_id === undefined) {
        res.status(400).json({ error: "Game hasn't started or doesn't exist" })
        return;
    }

    //check if player's turn

    const { data: data2 } = await supabaseServerClient
        .from('tableview')
        .select(`
    current,
    next,
    dir,
    top
    `).eq('session_id', session_id).single();

    let { current, next, dir, top } = data2 as any;

    if (current === undefined || session_players_id === undefined || current != session_players_id) {
        res.status(400).json({ error: "Not your turn" })
        return;
    }

    //check if card is in hand

    const service = createClient(url, key);
    const { data: data3 } = await service
        .from('hands')
        .select(`
    hand
    `).eq('session_players_id', session_players_id).single();

    const { hand } = data3 as any;

    const card = hand?.[handidx]?.[cardidx];

    if (card === undefined) {
        res.status(400).json({ error: "Card not found" })
        return;
    }

    //check if card is playable

    const table = top;

    

    const rules = (data as any)?.session?.games?.games_rules as any ?? [];
    const gamefields = (data as any)?.session?.games?.gamefields as any;
    const playerfields = (data as any)?.session?.games?.playerfields as any;
    const init = (data as any)?.session?.games?.init as any;

    const strength = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];


    const { data: data5 } = await service
        .from('session_players')
        .select(`
    id
    `).eq('session_id', session_id);

    let spids = data5?.map((sp: any) => sp.id) as any;

    let playable = !(rules.filter((rule: any) => rule?.rules?.required)?.[0]?.rules?.or_bool);

    for(let rule of rules.filter((rule: any) => rule?.rules?.required)){

        const { operator, left_field, right_field, left_player, right_player, right_value, left_value, actions, or_bool } = rule?.rules;
        let left, right;
        //console.log(rule.rules.id)
        //exclusive cases

        //left is card value
        if (left_field === null)
            left = strength.indexOf(card?.value);

        //right is from init
        if (right_field === null && right_player === null && right_value === null)
            right = init['playerfields'][playerfields?.[left_field]];

        //right is value
        if (right_field === null && right_player === null && right_value !== null)
            right = right_value;

        //nonexclusive cases

        //left is playerfield count
        if (left_field !== null && left_value === null)
            left = hand?.[playerfields?.[left_field]]?.length;

        //left is playerfield card value
        if (left_field !== null && left_value !== null)
            left = strength.indexOf(hand?.[playerfields?.[left_field]]?.[left_value]?.value);

        //right is playerfield count
        if (right_field !== null && right_value === null && right_player !== null) {

            const { data: data4 } = await service
                .from('hands')
                .select(`
            hand
            `).eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]).single();

            const { hand: righthand } = data4 as any;

            right = righthand?.[playerfields?.[right_field]]?.length;

        }

        //right is playerfield card value
        if (right_field !== null && right_value !== null && right_player !== null) {

            const { data: data5 } = await service
                .from('hands')
                .select(`
            hand
            `).eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]).single();

            const { hand: righthand } = data5 as any;

            right = strength.indexOf(righthand?.[playerfields?.[right_field]]?.[right_value]?.value);
        }

        //right is gamefield count
        if (right_field !== null && right_player === null && right_value === null)
            right = table?.[gamefields?.[right_field]]?.length;

        //right is gamefield card value from top
        if (right_field !== null && right_player === null && right_value !== null)
            right = strength.indexOf(table?.[gamefields?.[right_field]]?.slice(-1 * right_value)?.[0]?.value);


    //left is card origin and right is playerfield
    if(left_player === null){
    left = handidx;
    right = playerfields?.[right_field];
    }


    //console.log(rule.rules.name,playable)
        if(playable && or_bool)
            break;

        if (left !== undefined && right !== undefined)
            switch (operator) {
                case '>=':
                    if(or_bool)
                    playable = playable || (left >= right);
                    else
                    playable = playable && (left >= right);
                    break;
                case '<=':
                    if(or_bool)
                    playable = playable || (left <= right);
                    else
                    playable = playable && (left <= right);
                    break;
                case '==':
                    if(or_bool)
                    playable = playable || (left === right);
                    else
                    playable = playable && (left === right);
                    break;
                case '!=':
                    if(or_bool)
                    playable = playable || (left !== right);
                    else
                    playable = playable && (left !== right);
                    break;
                case '>':
                    if(or_bool)
                    playable = playable || (left > right);
                    else
                    playable = playable && (left > right);
                    break;
                case '<':
                    if(or_bool)
                    playable = playable || (left < right);
                    else
                    playable = playable && (left < right);
                    break;

            }

            


    }
    

    if (!playable) {
        res.status(400).json({ error: "Card not playable" })
        return;
    }



    //remove card from hand, add to table
    hand[handidx].splice(cardidx, 1);
    await service
        .from('hands')
        .update({ hand: hand })
        .eq('session_players_id', session_players_id);
    
    top.table.push(card);

    //do card actions for nonrequired rules
    for(let rule of rules.filter((rule: any) => !rule?.rules?.required)) {

        const { operator, left_field, right_field, left_player, right_player, right_value, left_value, actions } = rule?.rules;
        let left, right;
        let initnumber;
        //exclusive cases

        //left is card value
        if (left_field === null)
            left = strength.indexOf(card?.value);

        //right is from init
        if (right_field === null && right_player === null && right_value === null){
            right = init['playerfields'][playerfields?.[left_field]];
            initnumber=right;
        }

        //right is value
        if (right_field === null && right_player === null && right_value !== null)
            right = right_value;

        //nonexclusive cases

        //left is playerfield count
        if (left_field !== null && left_value === null)
            left = hand?.[playerfields?.[left_field]]?.length;

        //left is playerfield card value
        if (left_field !== null && left_value !== null)
            left = strength.indexOf(hand?.[playerfields?.[left_field]]?.[left_value]?.value);

        //right is playerfield count
        if (right_field !== null && right_value === null && right_player !== null) {

            const { data: data4 } = await service
                .from('hands')
                .select(`
            hand
            `).eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]).single();

            const { hand: righthand } = data4 as any;

            right = righthand?.[playerfields?.[right_field]]?.length;

        }

        //right is playerfield card value
        if (right_field !== null && right_value !== null && right_player !== null) {

            const { data: data5 } = await service
                .from('hands')
                .select(`
            hand
            `).eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]).single();

            const { hand: righthand } = data5 as any;

            right = strength.indexOf(righthand?.[playerfields?.[right_field]]?.[right_value]?.value);
        }

        //right is gamefield count
        if (right_field !== null && right_player === null && right_value === null)
            right = table?.[gamefields?.[right_field]]?.length;

        //right is gamefield card value from top
        if (right_field !== null && right_player === null && right_value !== null)
            right = strength.indexOf(table?.[gamefields?.[right_field]]?.slice(-1 * right_value)?.[0]?.value);


        //left is card origin and right is playerfield
    if(left_player === null){
        left = handidx;
        right = playerfields?.[right_field];
        }

        let doAction = false;

        if (left !== undefined && right !== undefined)
            switch (operator) {
                case '>=':
                    doAction = (left >= right);
                    break;
                case '<=':
                    doAction = (left <= right);
                    break;
                case '==':
                    doAction = (left === right);
                    break;
                case '!=':
                    doAction = (left !== right);
                    break;
                case '>':
                    doAction = (left > right);
                    break;
                case '<':
                    doAction = (left < right);
                    break;

            }
            console.log(left,doAction, rule?.rules?.actions?.action)
        if (doAction) {
            const { action, left_field, right_field, number, round_attr, operator, left_player, right_player, left_value, right_value } = actions;
            let left, right;

            //get Table
            const { data: tabledata } = await service
                .from('tables')
                .select(`
            table
            `).eq('session_id', session_id).single();
            const { table: table3 } = tabledata as any;
            let table2 = (number!==null && number === 0) ? table:table3;

            //new rule or round attr

            //nonexclusive cases

            //left is playerfield
            if (left_field !== null && left_player !== null)
                left = hand?.[playerfields?.[left_field]];

            //left is gamefield
            if (left_field !== null && left_player === null)
                left = table2?.[gamefields?.[left_field]];

            //right is playerfield
            let righthandRef = null;
            if (right_field !== null && right_player !== null) {

                const { data: data5 } = await service
                    .from('hands')
                    .select(`
        hand
        `).eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]).single();

                const { hand: righthand } = data5 as any;
                righthandRef = righthand;
                right = righthand?.[playerfields?.[right_field]];
            }

            //right is gamefield
            if (right_field !== null && right_player === null)
                right = table2?.[gamefields?.[right_field]];

                let update = false;
                switch(action) {
                    case 'fill':
                        left?.splice(0, 0, ...right.splice(-1*Math.max(initnumber-left.length, 0),Math.max(initnumber-left.length, 0)));
                        update = true;
                    break;
                    case 'move':
                        const lv = left_value===-1?left.length:left_value;
                        console.log(left_field,right_field)
                        console.log('lv',lv)
                        console.log('bal',left,'jobb',right)
                        right.push(...left.splice(-1*lv,lv))
                        console.log('ujbal',left,'ujjobb',right)
                        update = true;
                    break;
                    case 'next':
                        next = spids[(spids.indexOf(current) + (right_value??0) * dir) % spids.length];
                    break;
                }
                
                if(update){
                    console.log('update');
                    if(number===null || number !== 0){
                    await service
                        .from('tables')
                        .update({ table: table2 })
                        .eq('session_id', session_id);

                    top.tablecount=table2?.table?.length;
                    }
                    
                    await service
                    .from('hands')
                    .update({ hand: hand })
                    .eq('session_players_id', session_players_id);


                    //right is playerfield
                    if (right_field !== null && right_player !== null) {

                        await service
                        .from('hands')
                        .update({ hand: righthandRef })
                        .eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]);
                    
                        let topview={...righthandRef};
                        let outerview={...righthandRef};
                        for(let field of playerfields) {
                            const hidden: CardData = {suit: 'hidden', value: 'hidden'};
                            topview[field]=topview[field].map((card: CardData) => field[0]==='-'?hidden:card);
                            outerview[field]=outerview[field].map((card: CardData) => field==='+hand'||field[0]==='-'?hidden:card);
                    
                        }
                        await service.from('handview')
                            .update({ top: topview })
                            .eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]);
                    
                        await service.from('session_players')
                            .update({ hand: outerview })
                            .eq('id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]);
                    

                    }

                    }



                    

        }

    }

    //next player's turn


    await service.
        from('tableview')
        .update({ current: next, next: spids[(spids.indexOf(next) + dir) % spids.length], top: { ...top, table: top.table } })
        .eq('session_id', session_id);

    //update view

    // build handview, third person view of hand
    let topview={...hand};
    let outerview={...hand};
    for(let field of playerfields) {
        const hidden: CardData = {suit: 'hidden', value: 'hidden'};
        topview[field]=topview[field].map((card: CardData) => field[0]==='-'?hidden:card);
        outerview[field]=outerview[field].map((card: CardData) => field==='+hand'||field[0]==='-'?hidden:card);

    }
    await service.from('handview')
        .update({ top: topview })
        .eq('session_players_id', session_players_id);

    await service.from('session_players')
        .update({ hand: outerview })
        .eq('id', session_players_id);





    res.status(200).json({ message: "Card played" })

}