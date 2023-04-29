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

  let { games_id, chain_start, chain_end, or_bool } = req.body;

    if(games_id===undefined || chain_start===undefined || chain_end===undefined || or_bool===undefined){
    res.status(400).json({ error: "Missing requirements" })
    return;
    }

    let { data, error } = await supabaseServerClient
    .from('chains')
    .insert([
        { games_id, chain_start, chain_end, or_bool },
    ]).select().single();

    res.status(200).json({ data, error })

}