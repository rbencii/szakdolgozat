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
            actions(
                id,
                left_field,
                action,
                right_field,
                number,
                left_player,
                right_player,
                round_attr,
                operator,
                left_value,
                right_value
            )
        )
    )
`).eq('id', id).single();

  res.status(200).json({ games, error });
}