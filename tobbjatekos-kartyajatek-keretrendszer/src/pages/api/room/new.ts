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

  if(!user){
    res.status(401).json({ error: "Unauthorized" })
    return;
  }

  const { data, error } = await supabaseServerClient
  .from('session')
  .insert([
    {  },
  ]).select().single();

  let names=[] as any;
if(data){
await supabaseServerClient
.from('session_players')
.insert([
  { session_id: data.id },
])

let { data: names2 } = await supabaseServerClient
  .from('session_players')
  .select("id,name")
  .eq('session_id', data.id)
  names=names2;
}

let { data: spme } = await supabaseServerClient
.from('session_players')
.select("id")
.eq('user_id', user.id).single()

const resp = {you:spme?.id ,id:data?.id ,players: names, started: false}

  res.status(200).json({ resp, error })
}