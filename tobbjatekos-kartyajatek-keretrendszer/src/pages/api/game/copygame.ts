import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Database } from '../../../assets/supabase'
import { createClient } from '@supabase/supabase-js'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseServerClient = createServerSupabaseClient<Database>({
    req,
    res,
  })
  const {
    data: { user },
  } = await supabaseServerClient.auth.getUser()


  const { game_id } = req.body;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.PRIVATE_SERVICE_KEY;

  if(!url || !key){
    res.status(500).json({ error: "Missing environment variables" })
    return;
    }

  const service = createClient(url, key);

   if( user && game_id!=null && !isNaN(game_id) ){
   
    const { data, error } = await supabaseServerClient
    .from('games')
    .select(`*,
        games_rules (
            *,
            rules(
                *,
                actions(
                    *
                )
            )
        ),
        chains(
            *
        )
    `)
    .eq('id', game_id).single();

    if(data==null || data.games_rules==null || data.chains==null || error){
        res.status(424).json({ error: "Failed Dependency" })
        return;
    }

    const { data: newgame, error: error2 } = await supabaseServerClient
    .from('games')
    .insert([
        {name: data.name+' Copy', playercount: data.playercount, gamefields: data.gamefields, playerfields: data.playerfields, init: data.init, deckcount: data.deckcount}
        ]).select().single();


    if(error2 || newgame==null){
        res.status(424).json({ error2 })
        return;
    }



    const { data: actions, error: error3 } = await supabaseServerClient
    .from('actions')
    .insert(
        (data.games_rules as any).map((gr:any)=>gr.rules).map((rule:any)=>rule.actions)
        .filter((action:any)=>action!=null)
        .map((action:any)=>({
            operator: action.operator,
            action: action.action, 
            left_player: action.left_player, 
            left_field: action.left_field, 
            left_value: action.left_value,
            right_player: action.right_player, 
            right_field: action.right_field, 
            right_value: action.right_value,
            number: action.number,
            action_type: action.action_type,
            left: action.left,
            right: action.right
        }))
    ).select();

    if(error3 || actions==null){
        res.status(424).json({ error3 })
        return;
    }

    let counter=0;
    const action_ids = (data.games_rules as any).map((gr:any)=>gr.rules).map((rule:any)=>rule.actions!=null?(actions?.[counter++].id):null);




    let cnt=0;
    const { data: rules, error: error4 } = await supabaseServerClient
    .from('rules')
    .insert(
        (data.games_rules as any).map((gr:any)=>gr.rules).map((rule:any)=>({
            operator: rule.operator, 
            left_player: rule.left_player, 
            left_field: rule.left_field, 
            left_value: rule.left_value,
            right_player: rule.right_player, 
            right_field: rule.right_field, 
            right_value: rule.right_value,
            name: rule.name,
            required: rule.required,
            or_bool: rule.or_bool,
            exclusive: rule.exclusive,
            left: rule.left,
            right: rule.right,
            action_id: action_ids[cnt++],
        }))
        ).select();

    if(error4 || rules==null){
        res.status(424).json({ error4 })
        return;
    }

    let ruleMap = new Map();
    (data.games_rules as any).map((gr:any)=>gr.rules).forEach((rule:any, index:number)=>{
        ruleMap.set(rule.id, rules[index].id);
    })

    const { data: games_rules, error: error6 } = await service
    .from('games_rules')
    .insert(
        rules.map((rule:any)=>({
            game_id: newgame.id,
            rule_id: rule.id
        }))
        ).select();

    if(games_rules==null || error6){
        res.status(424).json({ error6 })
        return;
    }

    const { data: chains, error: error5 } = await supabaseServerClient
    .from('chains')
    .insert(
        (data.chains as any).map((chain:any)=>({
            games_id: newgame.id,
            chain_start: ruleMap.get(chain.chain_start),
            chain_end: ruleMap.get(chain.chain_end),
            or_bool: chain.or_bool
        }))
        ).select();

    if(chains==null || error5){
        res.status(424).json({ error5, ruleMap })
        return;
    }

    


    res.status(200).json({ newgame, rules, actions, chains, games_rules, error });
    return;
    }

    res.status(401).json({ error: "Unauthorized or missing data" })
}