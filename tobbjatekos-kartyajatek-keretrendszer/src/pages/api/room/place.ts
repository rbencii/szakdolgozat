// Creating a new supabase server client object (e.g. in API route):
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Database } from '../../../assets/supabase'
import { createClient } from '@supabase/supabase-js'
import { CardData } from '@/components/hand'

var win = false;
var winner = 0;

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
        owner,
        games(
            id,
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
                    left,
                    right,
                    actions(
                        id,
                        left_field,
                        right_field,
                        action,
                        number,
                        left_player,
                        right_player,
                        right_value,
                        left_value,
                        operator,
                        action_type,
                        left,
                        right
                    )
                )
            )
        )
        
    )
    `).eq('user_id', user.id).single();



    const { id: session_id, started, owner } = data?.session as any;
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

    const game_id = (data as any)?.session?.games?.id as any;
    const gamefields = (data as any)?.session?.games?.gamefields as any;
    const playerfields = (data as any)?.session?.games?.playerfields as any;
    const init = (data as any)?.session?.games?.init as any;


    for (let field of playerfields) {
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

    for (let field of gamefields) {
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
    let fail = false;
    let prevname: string | null = null;
    let prevDoAction: boolean = false;
    let globalfail = false;
    let prevfail = false;
    let broken = false;
    let outercnt = 0;
    let breakout: boolean = false;
    let continueout: boolean = false;

    let localplayable = !(rules.find((rule: any) => Number(rule?.rules?.id) === chains?.[0]?.chain_start)?.rules?.or_bool ?? true);
    for (let chain of chains) {
        let ids = rangeArr(chain.chain_start, chain.chain_end);
        if(outercnt>0)
        localplayable = playable;
        let chaingroup = rules.filter((rule: any) => ids.includes(Number(rule?.rules?.id)) && rule?.rules?.required);
        if (chain.or_bool && playable && !broken) {
            console.log("break")
            //break;
            broken = true;
            globalfail = fail;
            console.log("fail:", globalfail)
        }
        else if (chain.or_bool && !playable && !broken) {
            console.log("reset fail");
            fail = prevfail;
        }


        prevfail = fail;
        console.log('prevfail', prevfail);
        if (outercnt++ != 0) {
            console.log('((' + playable + '))');
            console.log(chain.or_bool ? '[OR]' : '[AND]')
        }
        let cnt = 0;
        let props = { prevDoAction , continueout, breakout:(breakout as boolean), sorter, prevname, fail, cardidx, playable: localplayable, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };

        if(breakout)
            break;

        if(continueout){
            console.log('!!!!!!!!!!!!!!!!!!!!continued!!!!!!!!!!!!!!!!!!!')
            continueout=false;
            continue;
        }

        for (let rule of chaingroup) {
            if (cnt++ != 0) {
                console.log('(' + localplayable + ')');
                console.log(rule?.rules?.or_bool ? 'OR' : 'AND')
            }
            let result = await evaluateRule({ ...props, rule });
            console.log(rule?.rules?.name, result.playable , result.fail ? 'fail' : '');
            localplayable = result.playable;

            dir = result.dir;
            current = result.current;
            next = result.next;
            fail = fail || result.fail;
            prevname = result.prevname;
            prevDoAction = result.prevDoAction;
            sorter = result.sorter;
            breakout = result.breakout;
            continueout = result.continueout;

            props = { prevDoAction, continueout, breakout:(breakout as boolean), sorter, prevname, fail, cardidx, playable: localplayable, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };    
            
            if(breakout)
                break;

            if(continueout)
                break;
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


    if (!fail) {
        hand[handidx].splice(cardidx, 1);
        top.table.push({ ...card, sorter });
    }


    //do card actions for nonrequired rules
    console.log('check table',table)
    console.log('ACTIONS')
    let acnt = 0;
    let playable2 = false;

    breakout = false;
    continueout = false;
    prevDoAction=false;

    for (let rule of rules.filter((rule: any) => !rule?.rules?.required && (rule?.rules?.exclusive==1 || !fail))) {

        let props = { prevDoAction , continueout, breakout: (breakout as boolean) ,sorter, prevname, fail, cardidx, playable: playable2, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };
        if (acnt++ > 0) {
            console.log('(' + playable2 + ')');
            console.log(rule.rules.or_bool ? 'OR' : 'AND');
        }
        let result = await evaluateRule({ ...props, rule });
        console.log(rule?.rules?.name);
        dir = result.dir;
        current = result.current;
        next = result.next;
        fail = fail || result.fail;
        prevname = result.prevname;
        prevDoAction = result.prevDoAction;
        sorter = result.sorter;
        playable2 = result.playable;
        breakout = result.breakout;

        props = { prevDoAction , continueout, breakout: (breakout as boolean) ,sorter, prevname, fail, cardidx, playable: playable2, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };

        if(breakout)
            break;

    }

    //update hand
    //next player's turn

    const { data: newdata } = await service
        .from('hands')
        .update({ hand: hand })
        .eq('session_players_id', session_players_id)//.select().single();
    //const { hand: newhand} = newdata as any;

    await service.
        from('tableview')
        .update({ current: next, next: spids[(spids.indexOf(next) + dir) % spids.length], top: { ...top, table: top.table }, sorter, dir: dir })
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




        console.log('---------------------------------------------------------------------------------------------------------------------')
    
        //win
        if(win && winner!=null){


            const { data: data5, error: error5 } = await service
        .from('session_players')
        .select(`
    id,
    user_id,
    name
    `).eq('session_id', session_id);


        if(data5==null || error5){
            res.status(500).json({ error: "Failed Dependency" })
            return;
        }

        const winner_obj = data5.find((sp:any) => sp.id==winner);

        const { data: data6, error: error6 } = await service
        .from('leaderboard')
        .select(`
        id,
        wins
        `).eq('user_id', winner_obj?.user_id).eq('game_id', game_id).single();

        const wins = data6?.wins ?? 0;
        const leaderboard_id = data6?.id??null;

        if(leaderboard_id==null){
        const { data: data4, error: error4 } = await service
        .from('leaderboard')
        .insert([
            {user_id:winner_obj?.user_id, name:winner_obj?.name, game_id: game_id, wins: wins+1 }
        ]).select().single();


            if (error4 || data4 == null) {
                res.status(424).json({ error: "Failed Dependency" })
                return;
            }
        }
        else {
            const { data: data4, error: error4 } = await service
                .from('leaderboard')
                .update({ wins: wins + 1, name: winner_obj?.name })
                .eq('id', leaderboard_id).select().single();


            if (error4 || data4 == null) {
                res.status(424).json({ error: "Failed Dependency" })
                return;
            }

        }

        await service
        .from('session')
        .delete()
        .eq('id', session_id);

        const { data: data7, error: error7 } = await service
        .from('session')
        .insert
        ([
            {owner: owner, game: game_id}
        ]).select().single();

        if(error7 || data7==null){
            res.status(424).json({ error: "Failed Dependency" })
            return;
        }

        const { id: new_session_id } = data7 as any;

        const { data: data8, error: error8 } = await service
        .from('session_players')
        .insert(
            data5.map((sp:any) => ({user_id: sp.user_id, session_id: new_session_id, name: sp.name}))
            )
        .select();

        if(error8 || data8==null){
            res.status(424).json({ error: "Failed Dependency" })
            return;
        }

        res.status(200).json({ message: "Game ended" })
        return;


        }

        
    
        res.status(200).json({ message: "Card played" })

}


function rangeArr(min: number, max: number) {
    var len = max - min + 1;
    var arr = new Array(len);
    for (var i = 0; i < len; i++) {
        arr[i] = min + i;
    }
    return arr;
}

async function evaluateRule({ prevDoAction, continueout, breakout, sorter, prevname, fail, cardidx, playable, rule, strength, card, init, playerfields, hand: handRef, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top }: { prevDoAction: boolean, continueout: boolean, breakout: boolean, sorter: number, prevname: string | null, fail: boolean, cardidx: number, playable: boolean, rule: any, strength: any, card: any, init: any, playerfields: any, hand: any, service: any, spids: any, session_players_id: any, dir: any, table: any, gamefields: any, handidx: any, session_id: any, current: any, next: any, top: any }) {



    const { left: leftSwitch, right: rightSwitch, operator, left_field, right_field, left_player, right_player, right_value, left_value, actions, or_bool, exclusive } = rule?.rules;
    let left: any, right: any;
    let tableAbove, rtable;
    //get table
    if ((left_player != null && left_player != 0 && leftSwitch.includes('gf'))) {
        const { data: tabledata } = await service
            .from('tables')
            .select(`
        table
        `).eq('session_id', session_id).single();
        const { table: table3 } = tabledata as any;

        for (let field of gamefields) {
            table3?.[field]?.sort((a: CardData, b: CardData) => a.sorter - b.sorter);
        }


        tableAbove = table3;
        //rtable = (right_player == 0 ) ? table : table3;
    }
    else
        tableAbove = table;

    if ((right_player != null && right_player != 0 && rightSwitch.includes('gf'))) {
        const { data: tabledata } = await service
            .from('tables')
            .select(`
                table
                `).eq('session_id', session_id).single();
        const { table: table3 } = tabledata as any;

        for (let field of gamefields) {
            table3?.[field]?.sort((a: CardData, b: CardData) => a.sorter - b.sorter);
        }


        //tableAbove = table3;
        rtable = table3;
    }
    else
        rtable = table;

    //get hand
    let hand = null;
    let rhand = null;

    if (left_player !== 0 && left_player != null && leftSwitch.includes('pf')) {

        const { data: data4 } = await service
            .from('hands')
            .select(`
        hand
        `).eq('session_players_id', spids[(spids.indexOf(session_players_id) + left_player * dir) % spids.length]).single();

        const { hand: lefthand } = data4 as any;
        hand = lefthand;
        hand?.[playerfields?.[left_field]]?.sort((a: CardData, b: CardData) => a.sorter - b.sorter);
    }
    else
        hand = handRef;

    if (right_player !== 0 && right_player != null && rightSwitch.includes('pf')) {

        const { data: data4 } = await service
            .from('hands')
            .select(`
        hand
        `).eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]).single();

        const { hand: righthand } = data4 as any;
        rhand = righthand;
        rhand?.[playerfields?.[right_field]]?.sort((a: CardData, b: CardData) => a.sorter - b.sorter);
    }
    else
        rhand = handRef;

    //text cases
    switch (leftSwitch) {
        case 'pfi': //playerfield index
            left = playerfields?.[left_field];
            break;
        case 'gfi': //gamefield index
            left = gamefields?.[left_field];
            break;
        case 'cardidx': //placed card index
            left = cardidx;
            break;
        case 'cv': //placed card value
            left = strength.indexOf(card?.value);
            break;
        case 'cs': //placed card suit
            left = card?.suit;
            break;
        case 'initpf': //init playerfield
            left = init['playerfields'][playerfields?.[left_field]];
            break;
        case 'initgf': //init gamefield
            left = init['gamefields'][gamefields?.[left_field]];
            break;
        case 'origin': //card origin index
            left = handidx;
            break;
        case 'originpf': //card origin field
            left = hand?.[handidx];
            break;
        case 'pfcv': //playerfield card value
            left = strength.indexOf(hand?.[playerfields?.[left_field]]?.[left_value]?.value);
            break;
        case 'pfcs': //playerfield card suit
            left = hand?.[playerfields?.[left_field]]?.[left_value]?.suit;
            break;
        case 'pfc': //playerfield card count
            left = hand?.[playerfields?.[left_field]]?.length;
            break;
        case 'gfcv': //gamefield card value FROM TOP
            left = strength.indexOf(tableAbove?.[gamefields?.[left_field]]?.slice(left_value * -1)?.[0]?.value);
            break;
        case 'gfcs': //gamefield card suit
            left = tableAbove?.[gamefields?.[left_field]]?.slice(left_value * -1)?.[0]?.suit;
            break;
        case 'gfc': //gamefield card count
            left = tableAbove?.[gamefields?.[left_field]]?.length;
            //console.log('gfc', tableAbove)
            break;
        case 'pf': //playerfield
            left = hand?.[playerfields?.[left_field]];
            break;
        case 'gf': //gamefield
            left = tableAbove?.[gamefields?.[left_field]];
            break;
        case 'value': //value
            left = left_value;
            break;
        case 'next':
            left = spids[next];
        break;

    }

    switch (rightSwitch) {
        case 'pfi': //playerfield index
            right = playerfields?.[right_field];
            break;
        case 'gfi': //gamefield index
            right = gamefields?.[right_field];
            break;
        case 'cardidx': //placed card index
            right = cardidx;
            break;
        case 'cv': //placed card value
            right = strength.indexOf(card?.value);
            break;
        case 'cs': //placed card suit
            right = card?.suit;
            break;
        case 'initpf': //init playerfield
            right = init['playerfields'][playerfields?.[right_field]];
            break;
        case 'initgf': //init gamefield
            right = init['gamefields'][gamefields?.[right_field]];
            break;
        case 'origin': //card origin index
            right = handidx;
            break;
        case 'originpf': //card origin field
            right = hand?.[handidx];
            break;
        case 'pfcv': //playerfield card value
            right = strength.indexOf(rhand?.[playerfields?.[right_field]]?.[right_value]?.value);
            break;
        case 'pfcs': //playerfield card suit
            right = rhand?.[playerfields?.[right_field]]?.[right_value]?.suit;
            break;
        case 'pfc': //playerfield card count
            right = rhand?.[playerfields?.[right_field]]?.length;
            break;
        case 'gfcv': //gamefield card value FROM TOP
            right = strength.indexOf(rtable?.[gamefields?.[right_field]]?.slice(right_value * -1)?.[0]?.value);
            break;
        case 'gfcs': //gamefield card suit
            right = rtable?.[gamefields?.[right_field]]?.slice(right_value * -1)?.[0]?.suit;
            break;
        case 'gfc': //gamefield card count
            right = rtable?.[gamefields?.[right_field]]?.length;
            break;
        case 'pf': //playerfield
            right = rhand?.[playerfields?.[right_field]];
            break;
        case 'gf': //gamefield
            right = rtable?.[gamefields?.[right_field]];
            break;
        case 'value': //value
            right = leftSwitch=='next'?spids[(spids.indexOf(session_players_id) + right_value * dir) % spids.length]:right_value;
            break;

    }

    let doAction = false;
    if (left !== undefined && right !== undefined) {
        let prevplayable = playable;
        if (rule?.rules?.name !== prevname)
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
                    if(leftSwitch=='gfc' && rightSwitch=='value' && right==0){
                        console.log('!!!left',left,'==','!!!right',right)
                    }

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
                case 'r_count_in_l':
                    if (['value', 'gfcv', 'pfcv', 'cv'].includes(rightSwitch)) {
                        if (or_bool)
                            playable = playable || (left?.map((x: any) => strength.indexOf(x?.value))?.filter((x: any) => x == right)?.length == left_value);
                        else
                            playable = playable && (left?.map((x: any) => strength.indexOf(x?.value))?.filter((x: any) => x == right)?.length == left_value);
                    } else if (['cs', 'gfcs', 'pfcs'].includes(rightSwitch)) {
                        if (or_bool)
                            playable = playable || (left?.map((x: any) => x?.suit)?.filter((x: any) => x == right)?.length == left_value);
                        else
                            playable = playable && (left?.map((x: any) => x?.suit)?.filter((x: any) => x == right)?.length == left_value);
                    }
                    break;

                case 'r_count_in_l_ge':
                    //console.log('number of ',right,' in ', left , '>= 1 playable')
                    if (['value', 'gfcv', 'pfcv', 'cv'].includes(rightSwitch)) {
                        if (or_bool)
                            playable = playable || (left?.map((x: any) => strength.indexOf(x?.value))?.filter((x: any) => x == right)?.length >= left_value);
                        else
                            playable = playable && (left?.map((x: any) => strength.indexOf(x?.value))?.filter((x: any) => x == right)?.length >= left_value);
                    } else if (['cs', 'gfcs', 'pfcs'].includes(rightSwitch)) {
                        if (or_bool)
                            playable = playable || (left?.map((x: any) => x?.suit)?.filter((x: any) => x == right)?.length >= left_value);
                        else
                            playable = playable && (left?.map((x: any) => x?.suit)?.filter((x: any) => x == right)?.length >= left_value);
                    }
                    break;

                case 'r_count_in_l_le':
                    if (['value', 'gfcv', 'pfcv', 'cv'].includes(rightSwitch)) {
                        if (or_bool)
                            playable = playable || (left?.map((x: any) => strength.indexOf(x?.value))?.filter((x: any) => x == right)?.length <= left_value);
                        else
                            playable = playable && (left?.map((x: any) => strength.indexOf(x?.value))?.filter((x: any) => x == right)?.length <= left_value);
                    } else if (['cs', 'gfcs', 'pfcs'].includes(rightSwitch)) {
                        if (or_bool)
                            playable = playable || (left?.map((x: any) => x?.suit)?.filter((x: any) => x == right)?.length <= left_value);
                        else
                            playable = playable && (left?.map((x: any) => x?.suit)?.filter((x: any) => x == right)?.length <= left_value);
                    }
                    break;

                case 'l_f_has_r':
                    if (['value', 'gfcv', 'pfcv', 'cv'].includes(rightSwitch)) {
                        if (or_bool)
                            playable = playable || (left?.map((x: any) => strength.indexOf(x?.value))?.includes(right));
                        else
                            playable = playable && (left?.map((x: any) => strength.indexOf(x?.value))?.includes(right));
                    } else if (['cs', 'gfcs', 'pfcs'].includes(rightSwitch)) {
                        if (or_bool)
                            playable = playable || (left?.map((x: any) => x?.suit)?.includes(right));
                        else
                            playable = playable && (left?.map((x: any) => x?.suit)?.includes(right));
                    }
                    break;
            }



        if (actions !== null && actions.action_type === -1) {
            fail = (prevplayable === true && playable === false);
            playable = prevplayable;

        }

        if (actions !== null && rule?.rules?.name !== prevname && !(actions.action_type === -1 && fail) && !(actions.action_type === -1 && !fail))
            switch (operator) {
                case '>=':
                    doAction = (left >= right);
                    break;
                case '<=':
                    doAction = (left <= right);
                    break;
                case '==':
                    console.log('left', left, '==', 'right', right)
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
                case 'r_count_in_l':
                    if (['value', 'gfcv', 'pfcv', 'cv'].includes(rightSwitch)) {
                        doAction = (left?.map((x: any) => strength.indexOf(x?.value))?.filter((x: any) => x == right)?.length == left_value);
                    } else if (['cs', 'gfcs', 'pfcs'].includes(rightSwitch)) {
                        doAction = (left?.map((x: any) => x?.suit)?.filter((x: any) => x == right)?.length == left_value);
                    }
                    break;
                case 'r_count_in_l_ge':
                    //console.log('number of ',right,' in ', left , 'action')

                    if (['value', 'gfcv', 'pfcv', 'cv'].includes(rightSwitch)) {
                        doAction = (left?.map((x: any) => strength.indexOf(x?.value))?.filter((x: any) => x == right)?.length >= left_value);
                    } else if (['cs', 'gfcs', 'pfcs'].includes(rightSwitch)) {
                        doAction = (left?.map((x: any) => x?.suit)?.filter((x: any) => x == right)?.length >= left_value);
                    }
                    break;
                case 'r_count_in_l_le':
                    if (['value', 'gfcv', 'pfcv', 'cv'].includes(rightSwitch)) {
                        doAction = (left?.map((x: any) => strength.indexOf(x?.value))?.filter((x: any) => x == right)?.length <= left_value);
                    } else if (['cs', 'gfcs', 'pfcs'].includes(rightSwitch)) {
                        doAction = (left?.map((x: any) => x?.suit)?.filter((x: any) => x == right)?.length <= left_value);
                    }
                    break;
                case 'l_f_has_r':
                    if (['value', 'gfcv', 'pfcv', 'cv'].includes(rightSwitch)) {
                        doAction = (left?.map((x: any) => strength.indexOf(x?.value))?.includes(right));
                    } else if (['cs', 'gfcs', 'pfcs'].includes(rightSwitch)) {
                        doAction = (left?.map((x: any) => x?.suit)?.includes(right));
                    }
                    break;
            }

        if (actions !== null && prevname === rule?.rules?.name && playable) {
            doAction = true;
            playable = prevplayable;
        }

        if (actions !== null)
            switch (actions.action_type) {
                case null:
                    if (rule?.rules?.required === false)
                        playable = doAction;
                    break;
                case -1:
                    doAction = fail;
                    break;
                case 0:
                    fail = true;
                    break;
                case 1:
                    doAction = playable;
                    break;
                case 2:
                    doAction = playable;
                    fail = doAction;
                    break;
            }

            if(rule?.rules?.required && prevname == rule?.rules?.name && actions!==null){
                playable = prevplayable;
                doAction = prevDoAction;
            }

        // if (rule?.rules?.name.includes('top'))
        // console.log(rule?.rules?.name,': ',left, operator, right)
        // console.log('doaction', doAction);
        console.log('                                                                                 left',left)
        console.log('                                                                                 ',operator)
        console.log('                                                                                 right',right)
        if (doAction) {
            console.log('DOING ------>', actions?.action);
            const { left: leftSw, right: rightSw, action, left_field, right_field, number, action_type, operator, left_player, right_player, left_value, right_value } = actions;
            console.log('leftsw', leftSw, 'rightsw', rightSw, 'rule id', rule?.rules?.id, 'action id', actions?.id)
            let left, right;


            let tableAbove, rtable;
            //get table
            if ((left_player != null && left_player != 0 && leftSw.includes('gf'))) {
                const { data: tabledata } = await service
                    .from('tables')
                    .select(`
                table
                `).eq('session_id', session_id).single();
                const { table: table3 } = tabledata as any;

                for (let field of gamefields) {
                    table3?.[field]?.sort((a: CardData, b: CardData) => a.sorter - b.sorter);
                }


                tableAbove = table3;
                //rtable = (right_player == 0 ) ? table : table3;
            }
            else
                tableAbove = table;

            if ((right_player != null && right_player != 0 && rightSw.includes('gf'))) {
                const { data: tabledata } = await service
                    .from('tables')
                    .select(`
                        table
                        `).eq('session_id', session_id).single();
                const { table: table3 } = tabledata as any;

                for (let field of gamefields) {
                    table3?.[field]?.sort((a: CardData, b: CardData) => a.sorter - b.sorter);
                }


                //tableAbove = table3;
                rtable = table3;

                //console.log('RTABLE', rtable);
                //console.log('rightSw', rightSw);
                //console.log('rule',rule?.rules?.name)
                //console.log('dir',dir,'next', next)
            }
            else
                rtable = table;


            //get hand
            let hand = null;
            let rhand = null;

            if (left_player !== 0 && left_player != null && leftSw.includes('pf')) {

                const { data: data4 } = await service
                    .from('hands')
                    .select(`
            hand
            `).eq('session_players_id', spids[(spids.indexOf(session_players_id) + left_player * dir) % spids.length]).single();

                const { hand: lefthand } = data4 as any;
                hand = lefthand;
                hand?.[playerfields?.[left_field]]?.sort((a: CardData, b: CardData) => a.sorter - b.sorter);
            }
            else
                hand = handRef;

            if (right_player !== 0 && right_player != null && rightSw.includes('pf')) {

                const { data: data4 } = await service
                    .from('hands')
                    .select(`
            hand
            `).eq('session_players_id', spids[(spids.indexOf(session_players_id) + right_player * dir) % spids.length]).single();

                const { hand: righthand } = data4 as any;
                rhand = righthand;
                rhand?.[playerfields?.[right_field]]?.sort((a: CardData, b: CardData) => a.sorter - b.sorter);
            }
            else
                rhand = handRef;


            switch (leftSw) {
                case 'pfi': //playerfield index
                    left = playerfields?.[left_field];
                    break;
                case 'gfi': //gamefield index
                    left = gamefields?.[left_field];
                    break;
                case 'cardidx': //placed card index
                    left = cardidx;
                    break;
                case 'cv': //placed card value
                    left = strength.indexOf(card?.value);
                    break;
                case 'cs': //placed card suit
                    left = card?.suit;
                    break;
                case 'initpf': //init playerfield
                    left = init['playerfields'][playerfields?.[left_field]];
                    break;
                case 'initgf': //init gamefield
                    left = init['gamefields'][gamefields?.[left_field]];
                    break;
                case 'origin': //card origin index
                    left = handidx;
                    break;
                case 'originpf': //card origin field
                    left = hand?.[handidx];
                    break;
                case 'pfcv': //playerfield card value
                    left = strength.indexOf(hand?.[playerfields?.[left_field]]?.[left_value]?.value);
                    break;
                case 'pfcs': //playerfield card suit
                    left = hand?.[playerfields?.[left_field]]?.[left_value]?.suit;
                    break;
                case 'pfc': //playerfield card count
                    left = hand?.[playerfields?.[left_field]]?.length;
                    break;
                case 'gfcv': //gamefield card value FROM TOP
                    left = strength.indexOf(tableAbove?.[gamefields?.[left_field]]?.slice(left_value * -1)?.[0]?.value);
                    break;
                case 'gfcs': //gamefield card suit
                    left = tableAbove?.[gamefields?.[left_field]]?.slice(left_value * -1)?.[0]?.suit;
                    break;
                case 'gfc': //gamefield card count
                    left = tableAbove?.[gamefields?.[left_field]]?.length;
                    break;
                case 'pf': //playerfield
                    left = hand?.[playerfields?.[left_field]];
                    break;
                case 'gf': //gamefield
                    left = tableAbove?.[gamefields?.[left_field]];
                    break;
                case 'value': //value
                    left = left_value;
                    break;
                case 'next':
                    left = spids[next];
                break;
            }

            switch (rightSw) {
                case 'pfi': //playerfield index
                    right = playerfields?.[right_field];
                    break;
                case 'gfi': //gamefield index
                    right = gamefields?.[right_field];
                    break;
                case 'cardidx': //placed card index
                    right = cardidx;
                    break;
                case 'cv': //placed card value
                    right = strength.indexOf(card?.value);
                    break;
                case 'cs': //placed card suit
                    right = card?.suit;
                    break;
                case 'initpf': //init playerfield
                    right = init['playerfields'][playerfields?.[right_field]];
                    break;
                case 'initgf': //init gamefield
                    right = init['gamefields'][gamefields?.[right_field]];
                    break;
                case 'origin': //card origin index
                    right = handidx;
                    break;
                case 'originpf': //card origin field
                    right = hand?.[handidx];
                    break;
                case 'pfcv': //playerfield card value
                    right = strength.indexOf(rhand?.[playerfields?.[right_field]]?.[right_value]?.value);
                    break;
                case 'pfcs': //playerfield card suit
                    right = rhand?.[playerfields?.[right_field]]?.[right_value]?.suit;
                    break;
                case 'pfc': //playerfield card count
                    right = rhand?.[playerfields?.[right_field]]?.length;
                    break;
                case 'gfcv': //gamefield card value FROM TOP
                    right = strength.indexOf(rtable?.[gamefields?.[right_field]]?.slice(right_value * -1)?.[0]?.value);
                    break;
                case 'gfcs': //gamefield card suit
                    right = rtable?.[gamefields?.[right_field]]?.slice(right_value * -1)?.[0]?.suit;
                    break;
                case 'gfc': //gamefield card count
                    right = rtable?.[gamefields?.[right_field]]?.length;
                    break;
                case 'pf': //playerfield
                    right = rhand?.[playerfields?.[right_field]];
                    break;
                case 'gf': //gamefield
                    right = rtable?.[gamefields?.[right_field]];
                    break;
                case 'value': //value
                    right = leftSw=='next'?spids[(spids.indexOf(session_players_id) + right_value * dir) % spids.length]:right_value;
                    break;

            }
            console.log('action left:', left);
            console.log('action right:', right);
            let update = false;
            switch (action) {
                case 'fill_l_from_r':
                    const initnumber = leftSw.slice(-2) == 'gf' ? init['gamefields'][gamefields?.[right_field]] : init['playerfields'][playerfields?.[right_field]];
                    const start = Math.max(left.length - 1, 0);
                    left?.splice(start, 0, ...right.splice(-1 * Math.max(initnumber - left.length, 0), Math.max(initnumber - left.length, 0)));
                    for (let i = start; i < left.length; i++) {
                        left[i].sorter = sorter++;
                    }
                    update = true;
                    break;
                case 'move_lv_l_to_r':
                    console.log('LEFTSW',leftSw)
                    if (leftSw == 'cv') {
                        const start = Math.max(right.length - 1, 0);
                        right.push(hand[handidx]?.splice(cardidx, 1)[0])
                        for (let i = start; i < right.length; i++) {
                            right[i].sorter = sorter++;
                        }
                        console.log('right MOVE', right);
                        if (right)
                            update = true;
                        break;
                    }

                    const lv = left_value === -1 ? left.length : left_value;
                    const start2 = Math.max(right.length - 1, 0);
                    //console.log(start2);
                    //console.log('left',left);
                    //console.log('right',right);
                    right.push(...left.splice(-1 * lv, lv))
                    //console.log('left',left);
                    //console.log('right',right);

                    //console.log(right.length-1);
                    for (let i = start2; i < right.length; i++) {
                        right[i].sorter = sorter++;
                    }

                    update = true;



                    break;
                case 'next':
                    next = spids[(spids.indexOf(current) + (right_value ?? 0) * dir) % spids.length];

                    //if(next == session_players_id)
                    //console.log('ITT LESZ NEXT 0',rule?.rules?.name)
                    break;
                case 'setcard':
                    const sorter2 = left?.[left_value]?.sorter;
                    if(rightSw=='cv')
                    left[left_value] = { suit: card?.suit, value: card?.value, sorter: sorter2 ?? sorter++ };
                    else if(rightSw=='value'){
                    left[left_value]={suit: ['Diamonds', 'Hearts', 'Spades', 'Clubs'][right_player % 4], value: strength[right_value % strength.length], sorter: left?.[left_value]??sorter++}
                    }
                    else
                    left[left_value] = { suit: right.slice(right_value)[0]?.suit, value: right.slice(right_value)[0]?.value, sorter: sorter2 ?? sorter++ };
                    update = true;
                    break;
                case 'setvalue':
                    if(left[left_value]?.value){
                    left[left_value]['value'] = right;
                    update = true;
                    }
                    break;
                case 'setsuit':
                    if(left[left_value]?.suit){
                    left[left_value]['suit'] = ['Diamonds', 'Hearts', 'Spades', 'Clubs'][right % 4];
                    update = true;
                    }
                    break;
                case 'dir':
                    dir = right;
                    break;
                case 'breakchain':
                    breakout = true;
                    break;
                case 'continuechain':
                    continueout = true;
                    break;
                case 'win':
                    win=true;
                    winner=spids[(spids.indexOf(current) + (right_value ?? 0) * dir) % spids.length];
                    break;
                default:
                    break;
            }

            if (update) {

                if ((left_player != null && left_player !== 0 && leftSw.includes('gf')) || (right_player != null && right_player !== 0 && rightSw.includes('gf'))) {
                    const tbl2 = (leftSw.includes('gf') && left_player !== 0) ? tableAbove : rtable;
                    await service
                        .from('tables')
                        .update({ table: tbl2 })
                        .eq('session_id', session_id);

                    top.tablecount = tbl2?.table?.length;
                }

                // if(left_player===0 || right_player===0)
                // await service
                //     .from('hands')
                //     .update({ hand: hand })
                //     .eq('session_players_id', session_players_id);


                //left or right is distant playerfield something
                if ((leftSw.includes('pf') && left_player !== 0 && left_player != null) || (rightSw.includes('pf') && right_player !== 0 && right_player != null)) {

                    const hnd = (leftSw.includes('pf') && left_player !== 0) ? hand : rhand;

                    const { data: newdata } = await service
                        .from('hands')
                        .update({ hand: hnd })
                        .eq('session_players_id', spids[(spids.indexOf(session_players_id) + ((leftSw.includes('pf') && left_player !== 0) ? left_player : right_player) * dir) % spids.length]);//.select().single();

                    //const { hand: newhand } = newdata as any;

                    let topview = { ...hnd };
                    let outerview = { ...hnd };
                    for (let field of playerfields) {
                        const hidden: CardData = { suit: 'hidden', value: 'hidden' } as any;
                        topview[field] = topview[field].map((card: CardData) => field[0] === '-' ? hidden : card);
                        outerview[field] = outerview[field].map((card: CardData) => field === '+hand' || field[0] === '-' ? hidden : card);

                    }
                    await service.from('handview')
                        .update({ top: topview })
                        .eq('session_players_id', spids[(spids.indexOf(session_players_id) + ((leftSw.includes('pf') && left_player !== 0) ? left_player : right_player) * dir) % spids.length]);

                    await service.from('session_players')
                        .update({ hand: outerview })
                        .eq('id', spids[(spids.indexOf(session_players_id) + ((leftSw.includes('pf') && left_player !== 0) ? left_player : right_player) * dir) % spids.length]);



                }

            }





        }
    }
    prevname = rule?.rules?.name;
    prevDoAction = doAction;
    return {prevDoAction, continueout, breakout, sorter, prevname, fail, cardidx, playable, rule, strength, card, init, playerfields, hand, service, spids, session_players_id, dir, table, gamefields, handidx, session_id, current, next, top };

}
