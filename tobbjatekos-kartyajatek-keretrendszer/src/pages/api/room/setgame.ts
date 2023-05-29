
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Database } from '../../../assets/supabase'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseServerClient = createServerSupabaseClient<Database>({
    req,
    res,
  })
  const {
    data: { user },
  } = await supabaseServerClient.auth.getUser()

  const { game_id } = req.body

if(user && game_id){

    const { data, error } = await supabaseServerClient
    .from('session')
    .update({ game: Number(game_id) })
    .eq('owner', user.id).select();

    res.status(200).json({ data, error });
    return;
}
  
  res.status(401).json({ error: "Unauthorized" })
}