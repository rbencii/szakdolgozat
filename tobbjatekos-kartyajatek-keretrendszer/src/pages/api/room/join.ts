
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
  .select("id, name, user_id")
  .eq('session_id', Number(id))

  let { data: spme } = await supabaseServerClient
.from('session_players')
.select("id")
.eq('user_id', user.id).single()

  names?.sort((a,b) => a.id - b.id);

  let { data: session, error: error2 } = await supabaseServerClient
  .from('session')
  .select("game")
  .eq('id', Number(id)).single();

  if(session==null || error2){
    res.status(424).json({ error: "Session not found." })
    return;
  }

  if(session.game!=null && names!=null){
    let { data: data2, error: error2 } = await supabaseServerClient
    .from('leaderboard')
    .select("user_id, wins")
    .eq('game_id', session.game);

    names?.forEach((element: any) => {
      element['wins']=((data2 as any).find((x: any) => x.user_id==element.user_id) as any)?.['wins']??null;
  });
}



  const resp = {you: spme?.id,id:data?.session_id ,players: names?.map((x: any)=>{return {id: x?.id, name: x?.name, wins: (x as any)?.wins??null}}), started: false}

  if (error) {
    res.status(424).json({ error })
    return;
  }

  res.status(200).json({ resp, error })
}