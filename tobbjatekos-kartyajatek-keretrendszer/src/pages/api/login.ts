// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'


import { AuthError, Session, User, createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabase = createClient(supabaseUrl, supabaseKey)

type Data = {
  data: {
    user: User | null;
    session: Session | null;
} | {
    user: null;
    session: null;
},
  error: AuthError | null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {email, password} = req.body;

  
let { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
})

  res.status(200).json({ data, error })
}
