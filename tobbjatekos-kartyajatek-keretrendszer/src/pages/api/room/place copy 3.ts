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

async function evaluateRule({ sorter, prevname, fail, cardidx, playable, rule, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top }: { sorter:number, prevname: string|null, fail: boolean, cardidx: number, playable: boolean, rule: any, strength: any, card: any, init: any, playerfields: any, hand: any, service: any, spids: any, session_players_id: any, dir: any, table: any, gamefields: any, handidx: any, session_id: any, current: any, next: any, top: any }) {



    const { operator, left_field, right_field, left_player, right_player, right_value, left_value, actions, or_bool, exclusive } = rule?.rules;
    let left: any, right: any;
    let initnumber;
    
    //get table
    const { data: tabledata } = await service
                .from('tables')
                .select(`
        table
        `).eq('session_id', session_id).single();
            const { table: table3 } = tabledata as any;

            for(let field of gamefields){
                table3?.[field]?.sort((a: CardData, b: CardData) => a.sorter - b.sorter);
            }
            

            let tableAbove = (exclusive !== null && exclusive === 0) ? table : table3;
            
    //exclusive cases

    //left is card value
    if (left_field === null && left_value === -1 && left_player === 0)
        left = strength.indexOf(card?.value);

    //left is card suit
    if (left_field === null && left_value === null && left_player === 0)
        left = card?.suit;

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

        righthand?.[playerfields?.[right_field]]?.sort((a: CardData, b: CardData) => a.sorter - b.sorter);

        right = strength.indexOf(righthand?.[playerfields?.[right_field]]?.[right_value]?.value);
    }

    //right is gamefield count
    if (right_field !== null && right_player === null && right_value === null)
        right = tableAbove?.[gamefields?.[right_field]]?.length;

    //right is gamefield card value from top
    if (right_field !== null && right_player === null && right_value !== null)
        right = strength.indexOf(tableAbove?.[gamefields?.[right_field]]?.slice(-1 * right_value)?.[0]?.value);

    //right is placed card value
    if((right_field === -1 && right_player === 0 && right_value === -1))
        right = strength.indexOf(card?.value);

    //right is placed card suit
    if((right_field === -1 && right_player === 0 && right_value === null))
        right = card?.suit;

    //left is card origin and right is playerfield
    if (left_player === null && right_field !== null && right_player === null && right_value === null) {
        left = handidx;
        right = playerfields?.[right_field];
    }

    //left is card origin as playerfield
    if (left_player === null && operator == 'count') {
        left = hand[handidx].map((x: CardData)=>left_value===null?x.suit:strength.indexOf(x.value));
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
            case 'count':
                if (or_bool)
                    playable = playable || (left.filter((x:any)=>x==right).length).length==left_field;
                else
                    playable = playable && (left.filter((x:any)=>x==right).length).length==left_field;

        }
        
       

        if (actions !== null && actions.action_type === -1) {
            fail=(prevplayable===true&&playable===false);
            playable = prevplayable;

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
                case 'count':
                    switch(exclusive){
                        case 2:
                    doAction = (left.filter((x:any)=>x==right).length)>=left_field;
                        break;
                        case 3:
                    doAction = (left.filter((x:any)=>x==right).length)==left_field;
                        break;
                        case 4:
                    doAction = (left.filter((x:any)=>x==right).length)<=left_field;
                        break;
                    }
                    console.log(exclusive,left,right);
                    break;
            }
        

        if (actions !== null && actions.action_type === -1 && fail)
            doAction = true;

        if (actions !== null && actions.action_type === -1 && !fail)
            doAction = false;

        if(actions !== null && prevname===rule?.rules?.name && playable){
            doAction=true;
            playable=prevplayable;
        }

        if (actions !== null && actions.action_type === 0)
            fail=true;

        
        if(actions !== null && actions.action_type===null && rule?.rules?.required===false)
            playable=doAction;

        if (actions !== null && actions.action_type === 1)
            doAction = playable;

        if (actions !== null && actions.action_type === 2){
            doAction = playable;
            fail = doAction;
        }
        
            if (rule?.rules?.name.includes('top'))
            console.log(rule?.rules?.name,': ',left, operator, right)
            console.log('doaction', doAction);
        if (doAction) {
            const { action, left_field, right_field, number, action_type, operator, left_player, right_player, left_value, right_value } = actions;
            let left, right;

            //get Table
        //     const { data: tabledata } = await service
        //         .from('tables')
        //         .select(`
        // table
        // `).eq('session_id', session_id).single();
        //     const { table: table3 } = tabledata as any;

        //     if(!(number !== null && number === 0)){
        //         for(let field of gamefields){
        //             table3?.[field]?.sort((a: CardData, b: CardData) => a.sorter - b.sorter);
        //         }
        //     }

        //     let table2 = (number !== null && number === 0) ? table : table3;
            let table2 = (number !== null && number === 0) ? table : table3;
        
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

                    for(let field of playerfields){
                        righthand?.[field]?.sort((a: CardData, b: CardData) => a.sorter - b.sorter);
                    }

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
                    const start = Math.max(left.length-1,0);
                    left?.splice(start, 0, ...right.splice(-1 * Math.max(initnumber - left.length, 0), Math.max(initnumber - left.length, 0)));
                    for(let i=start;i<left.length;i++){
                        left[i].sorter=sorter++;
                    }
                    update = true;
                    break;
                case 'move':
                    if (left_field === null) {
                        const start = Math.max(right.length-1,0);
                        right.push(hand[handidx]?.splice(cardidx, 1)[0])
                        for(let i=start;i<right.length;i++){
                            right[i].sorter=sorter++;
                        }
                        if(right)
                        update = true;
                        break;
                    }

                    const lv = left_value === -1 ? left.length : left_value;
                    const start2 = Math.max(right.length-1,0);
                    //console.log(start2);
                    right.push(...left.splice(-1 * lv, lv))
                    //console.log(right.length-1);
                    for(let i=start2;i<right.length;i++){
                        right[i].sorter=sorter++;
                    }

                    update = true;



                    break;
                case 'next':
                    next = spids[(spids.indexOf(current) + (right_value ?? 0) * dir) % spids.length];
                    break;
                case 'setcard':
                    left[left_value]={suit:right.slice(right_value)[0]?.suit, value:right.slice(right_value)[0]?.value, sorter:sorter++};
                    update = true;
                    break;
            }

            if (update) {

                if (number === null || number !== 0) {
                    await service
                        .from('tables')
                        .update({ table: table2 })
                        .eq('session_id', session_id);

                    top.tablecount = table2?.table?.length;
                }

                // if(left_player===0 || right_player===0)
                // await service
                //     .from('hands')
                //     .update({ hand: hand })
                //     .eq('session_players_id', session_players_id);


                //right is playerfield
                if (right_field !== null && right_player !== null && right_player !== 0) {

                    const { data: newdata } = await service
                        .from('hands')
                        .update({ hand: righthandRef })
                        .eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]);//.select().single();

                    //const { hand: newhand } = newdata as any;

                    let topview = { ...righthandRef };
                    let outerview = { ...righthandRef };
                    for (let field of playerfields) {
                        const hidden: CardData = { suit: 'hidden', value: 'hidden' } as any;
                        topview[field] = topview[field].map((card: CardData) => field[0] === '-' ? hidden : card);
                        outerview[field] = outerview[field].map((card: CardData) => field === '+hand' || field[0] === '-' ? hidden : card);

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
    prevname = rule?.rules?.name;
    
    return { sorter, prevname, fail, cardidx, playable, rule, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };

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
    sorter,
    top
    `).eq('session_id', session_id).single();

    let { current, next, dir, top, sorter } = data2 as any;

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

    const gamefields = (data as any)?.session?.games?.gamefields as any;
    const playerfields = (data as any)?.session?.games?.playerfields as any;
    const init = (data as any)?.session?.games?.init as any;


    for(let field of playerfields){
    hand?.[field]?.sort((a: CardData, b: CardData) => {
        return a.sorter - b.sorter;
    });
    }

    

    const card = hand?.[handidx]?.[cardidx];

    if (card === undefined) {
        res.status(400).json({ error: "Card not found" })
        return;
    }

    //check if card is playable
    const table = top;

    for(let field of gamefields){
    table?.[field]?.sort((a: CardData, b: CardData) => {
        return a.sorter - b.sorter;
    });
    }




    const rules = (data as any)?.session?.games?.games_rules as any ?? [];
    const chains = (data as any)?.session?.games?.chains as any ?? [];

    chains.sort((a: any, b: any) => {
        return a?.id - b?.id;
    });

    //console.log(chains)

    rules.sort((a: any, b: any) => {
        return a?.rules?.id - b?.rules?.id;
    });



    const strength = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const suits = ["Hearts", "Diamonds", "Spades", "Clubs"];

    const { data: data5 } = await service
        .from('session_players')
        .select(`
    id
    `).eq('session_id', session_id);

    let spids = data5?.map((sp: any) => sp.id) as any;

    spids.sort();


    let playable = !(chains[0]?.or_bool ?? true)
    let fail=false;
    let prevname:string|null=null;

    let globalfail=false;
    let prevfail=false;
    let broken = false;
    let outercnt=0;
    for (let chain of chains) {
        let ids = rangeArr(chain.chain_start, chain.chain_end);
        let localplayable = !(rules.find((rule: any) => Number(rule?.rules?.id) === chain.chain_start)?.rules?.or_bool ?? true);
        let chaingroup = rules.filter((rule: any) => ids.includes(Number(rule?.rules?.id)) && rule?.rules?.required);
        if(chain.or_bool && playable && !broken){
            console.log("break")
            //break;
            broken=true;
            globalfail=fail;
            console.log("fail:",globalfail)
        }
        else if(chain.or_bool && !playable && !broken){
            console.log("reset fail");
            fail=prevfail;
        }
        prevfail=fail;
        console.log('prevfail',prevfail);
        if(outercnt++!=0){
        console.log('(('+playable+'))');
        console.log(chain.or_bool?'[OR]':'[AND]')
        }
        let cnt=0;

        let props = { sorter, prevname, fail ,cardidx, playable: localplayable, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };

        for (let rule of chaingroup) {
            if(cnt++!=0){
            console.log('('+localplayable+')');
            console.log(rule?.rules?.or_bool?'OR':'AND')
            }
            let result = await evaluateRule({ ...props, rule });
            console.log(rule?.rules?.name, result.fail?'fail':'');
            localplayable = result.playable;

            dir = result.dir;
            current = result.current;
            next = result.next;
            fail = fail || result.fail;
            prevname = result.prevname;
            sorter = result.sorter;
            props = { sorter, prevname, fail ,cardidx, playable: localplayable, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };
            
        }
        if (chain.or_bool)
            playable = playable || localplayable;
        else
            playable = playable && localplayable;


    }

    fail = globalfail || (playable && fail);
    playable = broken || playable;
    console.log('fail', fail);
    console.log('playable', playable);

    if (!playable) {
        res.status(400).json({ error: "Card not playable" })
        return;
    }



    //remove card from hand, add to table


    if(!fail){
    hand[handidx].splice(cardidx, 1);
    top.table.push({...card, sorter});
    }

    
    //do card actions for nonrequired rules
    
    let playable2 = false;
    for(let rule of rules.filter((rule: any) => !rule?.rules?.required)){
        
        let props = { sorter, prevname, fail,cardidx, playable: playable2, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };
        let result = await evaluateRule({ ...props, rule });
            dir = result.dir;
            current = result.current;
            next = result.next;
            fail = fail || result.fail;
            prevname = result.prevname;
            sorter = result.sorter;
            playable2 = result.playable;
            props = { sorter, prevname, fail,cardidx, playable: playable2, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };
         
    }

    //update hand
    //next player's turn

    const {data: newdata } =await service
    .from('hands')
    .update({ hand: hand })
    .eq('session_players_id', session_players_id)//.select().single();
    //const { hand: newhand} = newdata as any;

    await service.
        from('tableview')
        .update({ current: next, next: spids[(spids.indexOf(next) + dir) % spids.length], top: { ...top, table: top.table }, sorter })
        .eq('session_id', session_id);

    //update view

    // build handview, third person view of hand
    let topview = { ...hand };//{ ...newhand };
    let outerview = { ...hand };//{ ...newhand };
    for (let field of playerfields) {
        const hidden: CardData = { suit: 'hidden', value: 'hidden' } as any;
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