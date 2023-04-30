import { Database } from "@/assets/supabase";
import Chainer from "@/components/chainer";
import Rule, { Ruletype } from "@/components/rule";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { ChangeEvent, Fragment, useEffect, useState } from "react";

function rangeArr(min: number, max: number) {
    var len = max - min + 1;
    var arr = new Array(len);
    for (var i=0; i<len; i++) {
      arr[i] = min + i;
    }
    return arr;
  }

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
    setGames((prev)=>{return {...prev, loadedgame: {...prev.loadedgame, games_rules: [...prev.loadedgame.games_rules, {rules: {...rule, id:-2, actions:rule.actions!==null?{...rule.actions, id:-1}:null}}  ]  }}})
    }

    const addChain = (chain: any)=>{
        setGames((prev)=>{return {...prev, loadedgame: {...prev.loadedgame, chains: [...prev.loadedgame?.chains??[], chain]}}})
    }

    const deleteChain = async (id: number)=>{
        setGames((prev)=>{return {...prev, loadedgame: {...prev.loadedgame, chains: prev.loadedgame?.chains?.filter((chain: any)=>chain.id!==id)}}})
        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id})
        }

        await fetch(`api/game/deletechain`, options);

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
            { games.game && games.loadedgame?.games_rules &&
                    <Chainer refresh={()=>loadRules()} newChain={(chain)=>addChain(chain)} games_id={games.game as number} rules={games.loadedgame?.games_rules?.map((x: any)=>x?.rules)}></Chainer>
                    }
                     <div className="text-center [&_span:first-of-type>span]:hidden">
                     <h1 className="text-xl">game logic chains</h1>
                        {
                            games.game && games.loadedgame?.chains?.map((chain: any, i: number)=>{

                            let ids = rangeArr(chain.chain_start, chain.chain_end);
                            let rules = games.loadedgame?.games_rules?.filter((rule: any)=>ids.includes(rule.rules.id)&&rule.rules.required);

                            return (
                                <div onClick={()=>deleteChain(chain.id)} key={i}>
                                    <div>{chain.or_bool?'OR':'AND'}</div>
                                    {rules?.map((rule: any, i: number)=>{
                                        return (
                                            <span key={i}>
                                                {rule.rules.or_bool?<span> OR </span>:<span> AND </span>}
                                                {rule.rules.name}
                                            </span>
                                        )
                                    })}
                                </div>
                            )

                            })
                        }
                     </div>
                {/* <div className="text-center [&_span:first-of-type>span]:hidden">
                    <h1 className="text-xl">required</h1>
            {games.game &&
                games.loadedgame?.games_rules?.filter((rule: {rules: Ruletype})=>rule.rules.required).map((rule: {rules: Ruletype}, i: number)=>{
                    if(rule.rules.or_bool)
                    return <Fragment key={i}><div>OR</div><span>{rule.rules.name}</span></Fragment>

                    return <span key={i}> <span>AND</span> {rule.rules.name}</span>
                })
            }
            </div> */}

            <h1 className="text-xl">-- card is placed --</h1>

            <div className="text-center [&_span:first-of-type>span]:hidden">
                    <h1 className="text-xl">effects WHEN NOT FAIL</h1>
            {games.game &&
                games.loadedgame?.games_rules?.filter((rule: {rules: Ruletype})=>!rule.rules.required && rule?.rules?.exclusive!=1).map((rule: {rules: Ruletype}, i: number)=>{

                    return <div key={i}>{rule.rules.name}</div>
                })
            }
            </div>
            <div className="text-center [&_span:first-of-type>span]:hidden">
                    <h1 className="text-xl">effects ALWAYS</h1>
            {games.game &&
                games.loadedgame?.games_rules?.filter((rule: {rules: Ruletype})=>!rule.rules.required && rule?.rules?.exclusive==1).map((rule: {rules: Ruletype}, i: number)=>{

                    return <div key={i}>{rule.rules.name}</div>
                })
            }
            </div>
            {games.game &&
                games.loadedgame?.games_rules?.map((rule: {rules: Ruletype}, i: number)=>{
                    return <Rule playerfields={games.loadedgame?.playerfields} gamefields={games.loadedgame?.gamefields} key={i} duplicate={duplicateRule} game_id={games.game as number} rules={rule.rules}/>
                })
            }
            {games.game && <button onClick={()=>newRule()}> add new rule</button>}
        </div>

       

        </main>
    )
}