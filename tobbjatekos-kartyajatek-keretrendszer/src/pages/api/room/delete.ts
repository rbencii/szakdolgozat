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

  if(user){
    const { data, error } = await supabaseServerClient
    .from('session')
    .delete()
    .eq('owner', user.id)

    res.status(200).json({ data, error });
    return;
  }

  res.status(401).json({ error: "Unauthorized" })
}