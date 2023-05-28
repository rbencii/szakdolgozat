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

  const { id } = req.body

  if(!user){
    res.status(401).json({ error: "Unauthorized" })
    return;
  }


let { data, error } = await supabaseServerClient
  .from('session')
  .select("game")
  .eq('id', Number(id)).single();

  if(error){
    res.status(424).json({fields:[], error })
    return;
  }

  const { game } = data as any;

  if(game!==null){

    let { data: data2, error: error2 } = await supabaseServerClient
    .from('games')
    .select("gamefields, playerfields")
    .eq('id', game).single();

    if(error2){
        res.status(424).json({fields:[], error2 })
        return;
    }

    res.status(200).json({ fields: data2, error })
    
  }else
    res.status(424).json({fields:[], error:'Game id is null.' })
}