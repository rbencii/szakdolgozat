
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

  const { name } = req.body

if(user && name){
let { data } = await supabaseServerClient
  .from('session_players')
  .select("id")
  .eq('user_id', user.id).single()

    if(data){

        const { data:data2, error } = await supabaseServerClient
        .from('session_players')
        .update({ name: name })
        .eq('id', data.id)
        .single()

        res.status(200).json({ data2, error });
        return;
    }
}
  res.status(401).json({ error: "Unauthorized" })
}