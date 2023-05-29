
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

  const { id } = req.body;

  if(id===undefined){
    res.status(400).json({ error: "Missing id" })
    return;
    }

let { data: games, error } = await supabaseServerClient
.from('games')
.select(`
    id,
    name,
    playerfields,
    gamefields,
    chains(
        id,
        games_id,
        chain_start,
        chain_end,
        or_bool
    ),
    games_rules (
        rules(
            id,
            name,
            operator,
            left_player,
            left_value,
            left_field,
            right_player,
            right_value,
            right_field,
            required,
            or_bool,
            exclusive,
            left,
            right,
            actions(
                id,
                left_field,
                action,
                right_field,
                number,
                left_player,
                right_player,
                action_type,
                operator,
                left_value,
                right_value,
                left,
                right
            )
        )
    )
`).eq('id', id).single();

if((games?.chains as any[]).length!=undefined && (games?.chains as any[]).length>0)
(games?.chains as any[]).sort((a, b) => a?.id - b?.id);

  res.status(200).json({ games, error });
}