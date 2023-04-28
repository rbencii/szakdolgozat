// Creating a new supabase server client object (e.g. in API route):
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Database } from '../../../assets/supabase'
import { createClient } from '@supabase/supabase-js'


function shuffle(arr: any[]) {
    let i = arr.length, j, temp;
    while(--i > 0){
      j = Math.floor(Math.random()*(i+1));
      temp = arr[j];
      arr[j] = arr[i];
      arr[i] = temp;
    }
  }

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseServerClient = createServerSupabaseClient<Database>({
    req,
    res,
  })
  const {
    data: { user },
  } = await supabaseServerClient.auth.getUser()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.PRIVATE_SERVICE_KEY;

  if(!url || !key){
    res.status(500).json({ error: "Missing environment variables" })
    return;
    }

  const service = createClient(url, key);

  if(user){
    const { data, error } = await supabaseServerClient
    .from('session')
    .select('id')
    .eq('owner', user.id).single();

    if(!data){
        res.status(424).json({ error: "Failed Dependency" })
        return;
    }

    const { id } = data;
   
    const values = [ "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", ];
    const suits = ["Hearts", "Diamonds", "Spades", "Clubs"];
    const cards:{value:string, suit:string}[] = [];
    for (let s = 0; s < suits.length; s++) {
      for (let v = 0; v < values.length; v++) {
        const value = values[v];
        const suit = suits[s];
        cards.push({ value, suit });
      }
    }

    for(let i = 0; i < 6; i++)
    shuffle(cards);


    const { data: data3, error: error3 } = await service
    .from('session')
    .select(`
    session_players (id),
    games (playercount, gamefields, playerfields, init)
    `).eq('id', id).single();

    if(!data3 || !data3?.session_players || !data3?.games){
        res.status(424).json({ error: "Failed Dependency" })
        return;
    }

    const spIDs = (data3.session_players as {id:any}[]).map((sp:{id:any}) => sp.id);
    const { playercount, playerfields, gamefields, init} = data3.games as any;

    if(spIDs.length < 2 || spIDs.length > playercount){
        res.status(400).json({ error: "Too many or too few players" })
        return;
    }

    for(let spID of spIDs){
    const hand: any = {};
    const top: any = {};
    const outer: any = {};
        for(let idx of playerfields){
            hand[idx] = cards.splice(0, init.playerfields[idx]);
            top[idx] = idx[0]==='-'?Array(init.playerfields[idx]).fill({value:'hidden', suit:'hidden'}):hand[idx];
            outer[idx] = idx==='+hand'?Array(top[idx].length).fill({value:'hidden', suit:'hidden'}):top[idx];
            console.log(hand[idx])
        }

    const { error: handerror } = await service
    .from('hands')
    .insert([
    { session_players_id: spID, hand: hand},
    ]);

    const { error: sphanderror } = await service
    .from('session_players')
    .update({ hand: outer })
    .eq('id', spID);

    const { error: handerror2 } = await service
    .from('handview')
    .insert([
    { session_players_id: spID, top: top},
    ]);

    if(handerror || handerror2 || sphanderror ){
        res.status(424).json({ error: "Failed Dependency" })
        return;
    }

    }

    const table: any = {};
    for(let idx of gamefields){
        table[idx] = cards.splice(0, init.gamefields[idx]);
    }

    const top: any = {};
    for(let idx of gamefields){
      if(idx!=='table')
      top[idx] = table[idx];
    }

    top['table'] = table['table'].slice(-1);
    top['draw'] = true;
    top['tablecount'] = table['table'].length;

    const { data: data2, error: error2 } = await service
    .from('tables')
    .insert([
        { session_id: id, table: table },
    ]).select().single();

    const { data: data4, error: error4 } = await service
    .from('tableview')
    .insert([
        { session_id: id, top: top, current: spIDs[0], next: spIDs[1], dir: 1 },
    ]).select().single();

    const { data:session, error: sessionerror } = await service.
    from('session')
    .update({ started: true })
    .eq('id', id).select().single();

    res.status(200).json({ data2, error2, data3, error3, session, sessionerror, data4, error4 });
    return;
  }

  res.status(401).json({ error: "Unauthorized" })
}