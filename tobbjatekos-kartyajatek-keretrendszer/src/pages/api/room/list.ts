
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

 
  const {data, error} = await supabaseServerClient
  .from('session')
  .select(`
  id,
  owner,
  session_players(
    user_id,
    name
  )
  `)
  .eq('public',true).eq('started',false);

    const list = data?.map(x=>String(x.id)+' - '+((x.session_players as any[]).find(y=>y.user_id==x.owner))?.name??'Unnamed')??[]
    res.status(200).json({ list });
    return;

}