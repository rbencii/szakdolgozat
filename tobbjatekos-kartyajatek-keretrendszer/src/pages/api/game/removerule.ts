// Creating a new supabase server client object (e.g. in API route):
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

  let { game_id, rule_id } = req.body;

    if(game_id===undefined || rule_id===undefined){
    res.status(400).json({ error: "Missing requirements" })
    return;
    }

    let { data, error } = await supabaseServerClient
    .from('games_rules')
    .delete()
    .eq('game_id', game_id)
    .eq('rule_id', rule_id);

    res.status(200).json({ data, error })

}