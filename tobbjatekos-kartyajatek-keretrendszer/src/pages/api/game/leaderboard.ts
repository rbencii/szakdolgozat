// Creating a new supabase server client object (e.g. in API route):
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

  const { game_id, room_id } = req.body;

    if(game_id==null || room_id==null){
    res.status(424).json({ error: "Missing requirements" })
    return;
    }

    let { data: user_ids, error } = await supabaseServerClient
    .from('session_players')
    .select('user_id')
    .eq('session_id', room_id);

    if(error){
        res.status(424).json({ error: "Missing requirements" })
        return;
    }

    let { data: wins, error: error2 } = await supabaseServerClient
    .from('leaderboard')
    .select('user_id, name, wins')
    .eq('game_id', game_id);

    if(error2){
        res.status(424).json({ error: "Missing requirements" })
        return;
    }

    let resp = wins?.filter((x:any) => user_ids?.some((y:any) => y.user_id===x.user_id)).map((x:any) => ({name: x.name, wins: x.wins}))??[];

  res.status(200).json({ scores:resp, error });
}