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

const {data, error} = await supabaseServerClient
.from('session_players')
.insert([
  { session_id: Number(id) },
]).select().single();

let { data: names } = await supabaseServerClient
  .from('session_players')
  .select("id,name")
  .eq('session_id', Number(id))

  let { data: spme } = await supabaseServerClient
.from('session_players')
.select("id")
.eq('user_id', user.id).single()

  const resp = {you: spme?.id,id:data?.session_id ,players: names, started: false}

  if (error) {
    res.status(424).json({ error })
    return;
  }

  res.status(200).json({ resp, error })
}