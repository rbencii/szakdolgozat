
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

  let { rules, game_id } = req.body;
  const actions = rules.actions;
  delete rules.actions;
  if(rules===undefined || game_id===undefined || isNaN(game_id)){
    res.status(400).json({ error: "Missing rules or game_id" })
    return;
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.PRIVATE_SERVICE_KEY;

  if(!url || !key){
    res.status(500).json({ error: "Missing environment variables" })
    return;
    }

  const service = createClient(url, key);

let action_id:any=null;
  if(actions!==null){
    if(Number(actions.id)===-1){
        delete actions.id;
        let { data: actions3, error: error2 } = await supabaseServerClient
        .from('actions')
        .insert([
            actions
        ]).select().single();

        if(error2 || actions3===null){
            res.status(500).json({ error2 })
            return;
        }

        action_id=(actions3 as any).id;
    
    }else{

    let { data: actions2, error } = await supabaseServerClient
    .from('actions')
    .update(actions)
    .eq('id', actions.id).select().single();

    if(error || actions2===null){
        res.status(500).json({ error })
        return;
    }

    action_id=(actions2 as any).id;

    }

}

let newid;
    if(action_id!==null)
        rules.action_id=action_id;

    if(rules.id==-1 || rules.id===-2)
    {
        delete rules.id;

        let { data: rules2, error } = await supabaseServerClient
        .from('rules')
  .insert([
    rules,
  ]).select().single();

    if(error    || rules2===null){
        res.status(500).json({ error })
        return;
    }
    newid=(rules2 as any).id;
    let { data: data2, error: error2 } =
    await supabaseServerClient
    .from('games')
    .select(`
        creator
    `).eq('id', game_id).single();

    if(error2 || data2===null){
        res.status(500).json({ error })
        return;
    }

    if((data2 as any).creator!==user?.id){
        res.status(403).json({ error: "Not your game" })
        return;
    }

    await service
    .from('games_rules')
    .insert([
        { game_id: game_id, rule_id: newid },
    ]);

    res.status(200).json({ rules: rules2, error });
    return;
}

let { data: rules2, error } = await supabaseServerClient
  .from('rules')
  .update(rules)
  .eq('id', rules.id).select().single();

    if(error || rules2===null){
        res.status(500).json({ error })
        return;
    }

    newid=(rules2 as any).id;


    res.status(200).json({ rules: rules2, error });


}