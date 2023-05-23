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


  const { session_id } = req.body

if(user){


    const { data, error } = await supabaseServerClient
    .from('session')
    .update({ public: true })
    .eq('id', session_id).select();

    res.status(200).json({ data, error });
    return;
}
  res.status(401).json({ error: "Unauthorized" })
  return;
}