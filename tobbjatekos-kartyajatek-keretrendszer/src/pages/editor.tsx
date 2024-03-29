import { Database } from "@/assets/supabase";
import Chainer from "@/components/chainer";
import MenuButton from "@/components/menubutton";
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

    const copyGame = async () => {
        if(games.game!==null){
            const options: RequestInit = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({game_id:games.game})
            }

            const resp = await fetch(`api/game/copygame`, options);
            const obj = await resp.json();
            if(obj.newgame!=null){
                await listGames();
                setGames((prev)=>{return {...prev, game:obj.newgame.id}});
                await loadRules();
            }
        }
    }

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

    if(!session) return (
        <div className='w-full h-full p-8 flex flex-col items-center justify-center'>
            <a href="/" className="w-[40vw] h-[30vh]">
            <MenuButton text='Log in' />
            </a>
        </div>
    );
    if(!supabase) return; 

    return (
        <main>
        <div className="w-full h-full flex flex-col items-center gap-y-16 my-32">
            <a className="border p-0.5" href="/newgame">
                New Game
            </a>
            <select className="border" name="games" id="games" onChange={setGame} value={games.game??""}>
                <option value="" disabled>Select Game</option>
                {
                    games.games?.map((game)=>{
                        return(
                            <option key={game.id} value={game.id}>{game.name}</option>
                        )
                    })
                }
            </select>
            <button className="border p-0.5" onClick={copyGame}>
                Copy Game
            </button>
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
                                <div key={i}>
                                    <div>{chain.or_bool?'OR':'AND'} ({chain.id})</div>
                                    {rules?.map((rule: any, i: number)=>{
                                        return (
                                            <span key={i}>
                                                {rule.rules.or_bool?<span> OR </span>:<span> AND </span>}
                                                {rule.rules.name} ({rule.rules.id})
                                            </span>
                                        )
                                    })}
                                    <span onClick={()=>deleteChain(chain.id)} className="border p-0.5 cursor-pointer">X</span>
                                </div>
                            )

                            })
                        }
                     </div>
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
                    return <div className="flex overflow-auto max-w-screen w-full" key={i}>
                    <Rule playerfields={games.loadedgame?.playerfields} gamefields={games.loadedgame?.gamefields} duplicate={duplicateRule} game_id={games.game as number} rules={rule.rules}/>
                    </div>
                })
            }
            {games.game && <button className="mb-16" onClick={()=>newRule()}> add new rule</button>}
        </div>

       

        </main>
    )
}