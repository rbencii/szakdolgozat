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
let { data, error: error2 } = await supabaseServerClient
  .from('session_players')
  .select("session_id, id")
  .eq('user_id', user.id).single()

if(data===undefined || data===null){
    res.status(424).json({ error: "User not in session" })
return;
}

const { session_id:id, id: spid } = data;

let { data: names, error } = await supabaseServerClient
.from('session_players')
.select(`id,name,hand,
handview(
  top
)
`)
.eq('session_id', Number(id))

let { data: session, error: error3 } = await supabaseServerClient
.from('session')
.select(`started,
tableview(
  top,
  current,
  next,
  dir
)`)
.eq('id', Number(id)).single()

const { started } = session as any;

  const resp = {you:spid, id:id ,players: names?.map(x=>(x as any)={id:x?.id, name: x?.name, hand: x?.hand}), started, view:{hand:names?.find(x=>x?.id===spid)?.handview, table:session?.tableview}}

  res.status(200).json({ resp, error, error2 })
}