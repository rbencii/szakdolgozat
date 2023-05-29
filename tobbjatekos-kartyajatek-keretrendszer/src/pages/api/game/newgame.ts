
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


  const { name, playercount, gamefields, playerfields, init, deckcount } = req.body;

   if( user && name!=null && playercount!=null && gamefields!=null && playerfields!=null && init!=null && deckcount!=null){
    const { data, error } = await supabaseServerClient
    .from('games')
    .insert([
      { name: name, playercount: Number(playercount), gamefields: JSON.parse(gamefields), playerfields: JSON.parse(playerfields), init: JSON.parse(init), deckcount: Number(deckcount) },
    ])

    res.status(200).json({ data, error });
    return;
    }

    res.status(401).json({ error: "Unauthorized or missing data" })
}