// Creating a new supabase server client object (e.g. in API route):
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Database } from '../../../assets/supabase'
import { createClient } from '@supabase/supabase-js'
import { CardData } from '@/components/hand'

function rangeArr(min: number, max: number) {
    var len = max - min + 1;
    var arr = new Array(len);
    for (var i = 0; i < len; i++) {
        arr[i] = min + i;
    }
    return arr;
}

async function evaluateRule({ prevname, fail, cardidx, playable, rule, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top }: { prevname: string|null, fail: boolean, cardidx: number, playable: boolean, rule: any, strength: any, card: any, init: any, playerfields: any, hand: any, service: any, spids: any, session_players_id: any, dir: any, table: any, gamefields: any, handidx: any, session_id: any, current: any, next: any, top: any }) {

    //let { playable, rule, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, next, current, top } = props;
    //return { playable, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };
    const { operator, left_field, right_field, left_player, right_player, right_value, left_value, actions, or_bool, exclusive } = rule?.rules;
    let left, right;
    let initnumber;
    //console.log('exclusive', exclusive);
    //get table

    //exclusive cases

    //left is card value
    if (left_field === null)
        left = strength.indexOf(card?.value);

    //right is from init
    if (right_field === null && right_player === null && right_value === null) {
        right = init['playerfields'][playerfields?.[left_field]];
        initnumber = right;
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
    if (left_player === null) {
        left = handidx;
        right = playerfields?.[right_field];
    }

    let doAction = false;

    if (left !== undefined && right !== undefined) {
        let prevplayable = playable;
        if(rule?.rules?.name !== prevname)
        switch (operator) {
            case '>=':
                if (or_bool)
                    playable = playable || (left >= right);
                else
                    playable = playable && (left >= right);

                 if(rule.rules.name==='>=topfail')
                 console.log(left,'>=',right,playable,prevplayable);
                break;
            case '<=':
                if (or_bool)
                    playable = playable || (left <= right);
                else
                    playable = playable && (left <= right);
                break;
            case '==':
                if (or_bool)
                    playable = playable || (left === right);
                else
                    playable = playable && (left === right);
                break;
            case '!=':
                if (or_bool)
                    playable = playable || (left !== right);
                else
                    playable = playable && (left !== right);
                break;
            case '>':
                if (or_bool)
                    playable = playable || (left > right);
                else
                    playable = playable && (left > right);
                break;
            case '<':
                if (or_bool)
                    playable = playable || (left < right);
                else
                    playable = playable && (left < right);
                break;

        }
        
        if (actions !== null && actions.action_type !== null) {
            fail=(prevplayable===true&&playable===false);
            playable = prevplayable;
            // console.log('FAILOL FAILOL FAILOL!!!! ITTTT',fail);
        }

        if (actions !== null && rule?.rules?.name !== prevname)
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

        if (actions !== null && actions.action_type === -1 && fail)
            doAction = true;

        if (actions !== null && actions.action_type === -1 && !fail)
            doAction = false;

        if(actions !== null && prevname===rule?.rules?.name)
            doAction=true;

        // console.log('NEVEK',prevname,rule?.rules?.name)

        if (doAction) {
            const { action, left_field, right_field, number, action_type, operator, left_player, right_player, left_value, right_value } = actions;
            let left, right;

            //get Table
            const { data: tabledata } = await service
                .from('tables')
                .select(`
        table
        `).eq('session_id', session_id).single();
            const { table: table3 } = tabledata as any;
            let table2 = (exclusive !== null && exclusive === 0) ? table : table3;

            //new rule or round attr

            //nonexclusive cases

            //left is card
            if (left_field === null && left_player !== null && left_value === null)
                left = card;

            //left is playerfield
            if (left_field !== null && left_player !== null)
                left = hand?.[playerfields?.[left_field]];

            //left is gamefield
            if (left_field !== null && left_player === null)
                left = table2?.[gamefields?.[left_field]];

            //right is playerfield
            let righthandRef = null;
            if (right_field !== null && right_player !== null) {

                if(right_player===0){
                    right = hand?.[playerfields?.[right_field]];
                }
                else{
                const { data: data5 } = await service
                    .from('hands')
                    .select(`
        hand
        `).eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]).single();

                const { hand: righthand } = data5 as any;
                righthandRef = righthand;
                right = righthand?.[playerfields?.[right_field]];
                }
            }

            //right is gamefield
            if (right_field !== null && right_player === null)
                right = table2?.[gamefields?.[right_field]];

            let update = false;
            switch (action) {
                case 'fill':
                    left?.splice(0, 0, ...right.splice(-1 * Math.max(initnumber - left.length, 0), Math.max(initnumber - left.length, 0)));
                    update = true;
                    break;
                case 'move':
                    if (left_field === null) {
                        right.push(hand[handidx]?.splice(cardidx, 1)[0])
                        update = true;
                        break;
                    }
                    const lv = left_value === -1 ? left.length : left_value;
                    //console.log(left_field, right_field)
                    //console.log('lv', lv)
                    //console.log('bal', left, 'jobb', right)
                    right.push(...left.splice(-1 * lv, lv))
                    //console.log('ujbal', left, 'ujjobb', right)
                    update = true;
                    //right.push({suit: 'Clubs', value: 'A'});
                    //console.log(rule?.rules?.name,hand['+hand'],'move utan')

                    break;
                case 'next':
                    next = spids[(spids.indexOf(current) + (right_value ?? 0) * dir) % spids.length];
                    break;
            }

            if (update) {
                //console.log('update');
                if (exclusive === null || exclusive !== 0) {
                    await service
                        .from('tables')
                        .update({ table: table2 })
                        .eq('session_id', session_id);

                    top.tablecount = table2?.table?.length;
                }

                if(left_player===0 || right_player===0)
                await service
                    .from('hands')
                    .update({ hand: hand })
                    .eq('session_players_id', session_players_id);


                //right is playerfield
                if (right_field !== null && right_player !== null && right_player !== 0) {

                    await service
                        .from('hands')
                        .update({ hand: righthandRef })
                        .eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]);

                    let topview = { ...righthandRef };
                    let outerview = { ...righthandRef };
                    for (let field of playerfields) {
                        const hidden: CardData = { suit: 'hidden', value: 'hidden' };
                        topview[field] = topview[field].map((card: CardData) => field[0] === '-' ? hidden : card);
                        outerview[field] = outerview[field].map((card: CardData) => field === '+hand' || field[0] === '-' ? hidden : card);

                    }
                    await service.from('handview')
                        .update({ top: topview })
                        .eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]);

                    await service.from('session_players')
                        .update({ hand: outerview })
                        .eq('id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]);

                        //console.log(rule?.rules?.name,hand,'update utan')

                }

            }





        }
    }
    prevname = rule?.rules?.name;
    // console.log('ujprevname',prevname)
    return { prevname, fail, cardidx, playable, rule, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };

}

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
            chains(
                id,
                games_id,
                chain_start,
                chain_end,
                or_bool
            ),
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
                    exclusive,
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
                        action_type
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
    const chains = (data as any)?.session?.games?.chains as any ?? [];

    const strength = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const suits = ["Hearts", "Diamonds", "Spades", "Clubs"];

    const { data: data5 } = await service
        .from('session_players')
        .select(`
    id
    `).eq('session_id', session_id);

    let spids = data5?.map((sp: any) => sp.id) as any;

    // let playable = !(rules.filter((rule: any) => rule?.rules?.required)?.[0]?.rules?.or_bool);
    let playable = !(chains[0]?.or_bool ?? true)
    let fail=false;
    let prevname:string|null=null;
    //let localplayable = false;

    //console.log('before chain',hand)
    for (let chain of chains) {
        let ids = rangeArr(chain.chain_start, chain.chain_end);
        let localplayable = !(rules.find((rule: any) => Number(rule?.rules?.id) === chain.chain_start)?.rules?.or_bool ?? true);
        let chaingroup = rules.filter((rule: any) => ids.includes(Number(rule?.rules?.id)) && rule?.rules?.required);
        let props = {  prevname, fail,cardidx, playable: localplayable, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };
        // console.log('--------------')
        // console.log(chain.or_bool ? 'CHAIN VAGY' : 'CHAIN ES');
        // console.log('(')
       // console.log('hossz',chaingroup.length)
        for (let rule of chaingroup) {
            //console.log(rule?.rules?.name)
            // let result = await evaluateRule({ ...props, rule});
            // console.log('elotte local',localplayable)
            // console.log('ELOTTE PREVNAME',prevname)
            let result = await evaluateRule({ ...props, rule });
            // console.log('UTANA PREVNAME',result.prevname)

            localplayable = result.playable;
            // console.log('utana local',localplayable)
            dir = result.dir;
            current = result.current;
            next = result.next;
            fail = fail || result.fail;
            prevname = result.prevname;
            props = {  prevname, fail,cardidx, playable: localplayable, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };
            // console.log('FAILOL',fail)
            // console.log(rule.rules.or_bool ? 'VAGY' : 'ES', rule.rules.name)
        }
        // console.log(')')
        if (chain.or_bool)
            playable = playable || localplayable;
        else
            playable = playable && localplayable;
        // console.log('CHAIN playable', playable);
        // console.log('--------------')

    }

    // res.status(200).json({ playable: playable })
    // return;

    if (!playable) {
        res.status(400).json({ error: "Card not playable" })
        return;
    }



    //remove card from hand, add to table
    //console.log('after playable',hand)
    //console.log(!fail);
    if(!fail){
    hand[handidx].splice(cardidx, 1);

    await service
        .from('hands')
        .update({ hand: hand })
        .eq('session_players_id', session_players_id);


    top.table.push(card);
    }
    
    //do card actions for nonrequired rules

    for(let rule of rules.filter((rule: any) => !rule?.rules?.required)){
        
        let props = {  prevname, fail,cardidx, playable: true, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };
        let result = await evaluateRule({ ...props, rule });
            dir = result.dir;
            current = result.current;
            next = result.next;
            fail = fail || result.fail;
            prevname = result.prevname;
            props = {  prevname, fail,cardidx, playable: true, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };
         
    }

    // for (let rule of rules.filter((rule: any) => !rule?.rules?.required)) {

    //     const { operator, left_field, right_field, left_player, right_player, right_value, left_value, actions } = rule?.rules;
    //     let left, right;
    //     let initnumber;
    //     //exclusive cases

    //     //left is card value
    //     if (left_field === null)
    //         left = strength.indexOf(card?.value);

    //     //right is from init
    //     if (right_field === null && right_player === null && right_value === null) {
    //         right = init['playerfields'][playerfields?.[left_field]];
    //         initnumber = right;
    //     }

    //     //right is value
    //     if (right_field === null && right_player === null && right_value !== null)
    //         right = right_value;

    //     //nonexclusive cases

    //     //left is playerfield count
    //     if (left_field !== null && left_value === null)
    //         left = hand?.[playerfields?.[left_field]]?.length;

    //     //left is playerfield card value
    //     if (left_field !== null && left_value !== null)
    //         left = strength.indexOf(hand?.[playerfields?.[left_field]]?.[left_value]?.value);

    //     //right is playerfield count
    //     if (right_field !== null && right_value === null && right_player !== null) {

    //         const { data: data4 } = await service
    //             .from('hands')
    //             .select(`
    //         hand
    //         `).eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]).single();

    //         const { hand: righthand } = data4 as any;

    //         right = righthand?.[playerfields?.[right_field]]?.length;

    //     }

    //     //right is playerfield card value
    //     if (right_field !== null && right_value !== null && right_player !== null) {

    //         const { data: data5 } = await service
    //             .from('hands')
    //             .select(`
    //         hand
    //         `).eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]).single();

    //         const { hand: righthand } = data5 as any;

    //         right = strength.indexOf(righthand?.[playerfields?.[right_field]]?.[right_value]?.value);
    //     }

    //     //right is gamefield count
    //     if (right_field !== null && right_player === null && right_value === null)
    //         right = table?.[gamefields?.[right_field]]?.length;

    //     //right is gamefield card value from top
    //     if (right_field !== null && right_player === null && right_value !== null)
    //         right = strength.indexOf(table?.[gamefields?.[right_field]]?.slice(-1 * right_value)?.[0]?.value);


    //     //left is card origin and right is playerfield
    //     if (left_player === null) {
    //         left = handidx;
    //         right = playerfields?.[right_field];
    //     }

    //     let doAction = false;

    //     if (left !== undefined && right !== undefined)
    //         switch (operator) {
    //             case '>=':
    //                 doAction = (left >= right);
    //                 break;
    //             case '<=':
    //                 doAction = (left <= right);
    //                 break;
    //             case '==':
    //                 doAction = (left === right);
    //                 break;
    //             case '!=':
    //                 doAction = (left !== right);
    //                 break;
    //             case '>':
    //                 doAction = (left > right);
    //                 break;
    //             case '<':
    //                 doAction = (left < right);
    //                 break;

    //         }
    //     console.log(left, doAction, rule?.rules?.actions?.action)
    //     if (doAction) {
    //         const { action, left_field, right_field, number, action_type, operator, left_player, right_player, left_value, right_value } = actions;
    //         let left, right;

    //         //get Table
    //         const { data: tabledata } = await service
    //             .from('tables')
    //             .select(`
    //         table
    //         `).eq('session_id', session_id).single();
    //         const { table: table3 } = tabledata as any;
    //         let table2 = (number !== null && number === 0) ? table : table3;

    //         //new rule or round attr

    //         //nonexclusive cases

    //         //left is playerfield
    //         if (left_field !== null && left_player !== null)
    //             left = hand?.[playerfields?.[left_field]];

    //         //left is gamefield
    //         if (left_field !== null && left_player === null)
    //             left = table2?.[gamefields?.[left_field]];

    //         //right is playerfield
    //         let righthandRef = null;
    //         if (right_field !== null && right_player !== null) {

    //             const { data: data5 } = await service
    //                 .from('hands')
    //                 .select(`
    //     hand
    //     `).eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]).single();

    //             const { hand: righthand } = data5 as any;
    //             righthandRef = righthand;
    //             right = righthand?.[playerfields?.[right_field]];
    //         }

    //         //right is gamefield
    //         if (right_field !== null && right_player === null)
    //             right = table2?.[gamefields?.[right_field]];

    //         let update = false;
    //         switch (action) {
    //             case 'fill':
    //                 left?.splice(0, 0, ...right.splice(-1 * Math.max(initnumber - left.length, 0), Math.max(initnumber - left.length, 0)));
    //                 update = true;
    //                 break;
    //             case 'move':
    //                 const lv = left_value === -1 ? left.length : left_value;
    //                 console.log(left_field, right_field)
    //                 console.log('lv', lv)
    //                 console.log('bal', left, 'jobb', right)
    //                 right.push(...left.splice(-1 * lv, lv))
    //                 console.log('ujbal', left, 'ujjobb', right)
    //                 update = true;
    //                 break;
    //             case 'next':
    //                 next = spids[(spids.indexOf(current) + (right_value ?? 0) * dir) % spids.length];
    //                 break;
    //         }

    //         if (update) {
    //             console.log('update');
    //             if (number === null || number !== 0) {
    //                 await service
    //                     .from('tables')
    //                     .update({ table: table2 })
    //                     .eq('session_id', session_id);

    //                 top.tablecount = table2?.table?.length;
    //             }

    //             await service
    //                 .from('hands')
    //                 .update({ hand: hand })
    //                 .eq('session_players_id', session_players_id);


    //             //right is playerfield
    //             if (right_field !== null && right_player !== null) {

    //                 await service
    //                     .from('hands')
    //                     .update({ hand: righthandRef })
    //                     .eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]);

    //                 let topview = { ...righthandRef };
    //                 let outerview = { ...righthandRef };
    //                 for (let field of playerfields) {
    //                     const hidden: CardData = { suit: 'hidden', value: 'hidden' };
    //                     topview[field] = topview[field].map((card: CardData) => field[0] === '-' ? hidden : card);
    //                     outerview[field] = outerview[field].map((card: CardData) => field === '+hand' || field[0] === '-' ? hidden : card);

    //                 }
    //                 await service.from('handview')
    //                     .update({ top: topview })
    //                     .eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]);

    //                 await service.from('session_players')
    //                     .update({ hand: outerview })
    //                     .eq('id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]);


    //             }

    //         }





    //     }

    // }

    //next player's turn


    await service.
        from('tableview')
        .update({ current: next, next: spids[(spids.indexOf(next) + dir) % spids.length], top: { ...top, table: top.table } })
        .eq('session_id', session_id);

    //update view

    // build handview, third person view of hand
    let topview = { ...hand };
    let outerview = { ...hand };
    for (let field of playerfields) {
        const hidden: CardData = { suit: 'hidden', value: 'hidden' };
        topview[field] = topview[field].map((card: CardData) => field[0] === '-' ? hidden : card);
        outerview[field] = outerview[field].map((card: CardData) => field === '+hand' || field[0] === '-' ? hidden : card);

    }
    await service.from('handview')
        .update({ top: topview })
        .eq('session_players_id', session_players_id);

    await service.from('session_players')
        .update({ hand: outerview })
        .eq('id', session_players_id);





    res.status(200).json({ message: "Card played" })

}