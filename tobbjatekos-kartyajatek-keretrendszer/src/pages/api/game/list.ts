
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

if(!user){
    res.status(401).json({ error: "Unauthorized" })
    return;
}

let { data: games, error } = await supabaseServerClient
.from('games')
.select('id, name').or('official.eq.true, creator.eq.'+user.id)

  res.status(200).json({ games, error });
}