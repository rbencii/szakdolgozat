import { Database } from "@/assets/supabase";
import Rule, { Ruletype } from "@/components/rule";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { ChangeEvent, Fragment, useEffect, useState } from "react";

export default function Editor() {
    const [games, setGames] = useState<{game:number|null, games:{id:number, name:string}[], loadedgame: any}>({game:null, games:[], loadedgame: null}); 

    const listGames = async () => {
        const resp = await fetch('api/game/list');
        const obj = await resp.json();
        if(obj?.games)
        setGames({game:null, games:obj.games, loadedgame: null})
    }

    useEffect
    (()=>{
        if(games.games?.length==0)
        listGames();
        if(games.game!==null && games.loadedgame==null)
        loadRules();

        console.log(games)
    },[games])

    const setGame = (e: ChangeEvent<HTMLSelectElement>) => {
        const game = parseInt(e.target.value);
        if(!isNaN(game))
        setGames((prev)=>{return {...prev, game}});
    }

    const loadRules = async () => {
        if(games.game!==null){
            const options: RequestInit = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id:games.game})
            }

            const resp = await fetch(`api/game/rules`, options);
            const obj = await resp.json();
            if(obj?.games)
            setGames((prev)=>{return {...prev, loadedgame:obj.games}});
        }
    }

    const newRule = () => {
     
    setGames((prev)=>{return {...prev, loadedgame: {...prev.loadedgame, games_rules: [...prev.loadedgame.games_rules, {rules: {id:-1, operator:'<', name: 'New Rule', required: true, or_bool: false, actions: null}}  ]  }}})
    }

    const duplicateRule = (rule: any) => {
    setGames((prev)=>{return {...prev, loadedgame: {...prev.loadedgame, games_rules: [...prev.loadedgame.games_rules, {rules: {...rule, id:-2}}  ]  }}})
    }

    const supabase = useSupabaseClient();
    const session = useSession();

    if(!session) return;
    if(!supabase) return; 

    return (
        <main className="absolute left-1/2 -translate-x-1/2 top-0">
        <div className="w-full h-full flex flex-col items-center gap-y-16 my-32">
            <select name="games" id="games" onChange={setGame} defaultValue={""}>
                <option value="" disabled>Select Game</option>
                {
                    games.games?.map((game)=>{
                        return(
                            <option key={game.id} value={game.id}>{game.name}</option>
                        )
                    })
                }
            </select>
                <div className="text-center [&_span:first-of-type>span]:hidden">
                    <h1 className="text-xl">required</h1>
            {games.game &&
                games.loadedgame?.games_rules?.filter((rule: {rules: Ruletype})=>rule.rules.required).map((rule: {rules: Ruletype}, i: number)=>{
                    if(rule.rules.or_bool)
                    return <Fragment key={i}><div>OR</div><span>{rule.rules.name}</span></Fragment>

                    return <span key={i}> <span>AND</span> {rule.rules.name}</span>
                })
            }
            </div>
            <div className="text-center [&_span:first-of-type>span]:hidden">
                    <h1 className="text-xl">effects</h1>
            {games.game &&
                games.loadedgame?.games_rules?.filter((rule: {rules: Ruletype})=>!rule.rules.required).map((rule: {rules: Ruletype}, i: number)=>{

                    return <div key={i}>{rule.rules.name}</div>
                })
            }
            </div>
            {games.game &&
                games.loadedgame?.games_rules?.map((rule: {rules: Ruletype}, i: number)=>{
                    return <Rule key={i+'b'+rule.rules.id} duplicate={duplicateRule} game_id={games.game as number} rules={rule.rules}/>
                })
            }
            {games.game && <button onClick={()=>newRule()}> add new rule</button>}
        </div>
        </main>
    )
}