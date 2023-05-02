import { RealtimeChannel, Session, SupabaseClient } from "@supabase/supabase-js";
import { SourceMap } from "module";
import { Fragment, useEffect, useState } from "react";
import Hand from '@/components/hand'

export default function Rooms({ supabase, session }: { supabase: SupabaseClient<any, "public", any>, session: Session | null }) {
    const [room, setRoom] = useState<null | { you: number, id: string, view?: { hand: any, table: { current: number, dir: number, next: number, top: { draw: boolean, tablecount: number, table: any } | any } }, players: { id: number, name: string, hand: any }[], started: boolean }>(null);
    const [sub, setSub] = useState<null | RealtimeChannel>(null);
    const [games, setGames] = useState<{ id: number, name: string }[]>([]);
    const [debugHand, setDebugHand] = useState<any>(null);
    const [fieldOrders, setFieldOrders] = useState<{ playerfields: string[], gamefields: string[] } | null>(null);
    const [dark, setDark] = useState<boolean>(false);

    const test = async () => {
        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ handidx: '+hand', cardidx: 0 })
        };
        const resp = await fetch('api/room/place', options);
        const obj = await resp.json();
        console.log(obj);
    }

    const loadRoom = async () => {

        const resp = await fetch('api/room/presence');
        const obj = await resp.json();
        console.log(obj);
        if (obj?.resp?.id) {
            setRoom(obj.resp);
        }
    }


    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const { session } = e.target.elements;

        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: session.value
            })
        }

        const res = await fetch('api/room/join', options);
        const obj = await res.json();
        if (obj?.resp) {
            setRoom(obj.resp);
        }
    }

    const newRoom = async () => {

        const res = await fetch('api/room/new');
        const obj = await res.json();
        if (obj?.resp)
            setRoom(obj.resp);

    }

    const changeName = async (e: any) => {
        const { value } = e.target;
        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: value
            })
        }

        const resp = await fetch('api/room/name', options);
        const obj = await resp.json();
        //console.log(obj);
    }

    const deleteRoom = async () => {
        const resp = await fetch('api/room/delete');
        const obj = await resp.json();
        console.log(obj);
        setRoom(null);
        supabase.removeAllChannels();
        setSub(null);
    }

    const listGames = async () => {
        const resp = await fetch('api/game/list');
        const obj = await resp.json();
        if (obj?.games)
            setGames(obj.games)
    }

    const setGame = async (e: any) => {
        const { value } = e.target;
        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                game_id: value
            })
        }

        const resp = await fetch('api/room/setgame', options);
        const obj = await resp.json();
        console.log(obj);
    }

    const generateTable = async () => {
        const resp = await fetch('api/room/start');
        const obj = await resp.json();
        console.log(obj);
    }


    const debug = async () => {
        const resp = await fetch('api/room/debughand');
        const obj = await resp.json();
        console.log(obj.resp);
        setDebugHand(obj.resp);
    }

    const getFieldOrders = async () => {
        if (room?.id == null)
            return;

        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: room.id })
        }

        const resp = await fetch('api/room/getfieldorders', options);
        const obj = await resp.json();
        if (obj?.error)
            return;
        console.log(obj?.fields);
        setFieldOrders(obj?.fields);
    }

    useEffect(() => {
        console.log('room changed', room)
        if (fieldOrders == null)
            getFieldOrders();

        // if(room?.view?.table!=null)
        // debug();

        if (room === null)
            loadRoom();
        if (room && !sub && room?.id && room?.you) {
            listGames();
            const sessionPlayers = supabase.channel(String(room.id))
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'session_players', filter: `session_id=eq.${room.id}` },
                    (payload) => {
                        console.log('Change received!', payload)
                        const { eventType, new: newobj, old } = payload as any;
                        const { id, name, started, hand } = newobj as any;
                        if (eventType === 'INSERT') {
                            console.log('insert')
                            setRoom((prev) => {
                                if (prev) {
                                    let players = [...prev.players, { id, name, hand: null }];
                                    players.sort();
                                    return {
                                        ...prev,
                                        players
                                    }
                                }
                                return prev;
                            });
                        }
                        else if (eventType === 'DELETE') {
                            setRoom((prev) => {
                                if (prev) {
                                    return {
                                        ...prev,
                                        players: prev.players.filter((player) => player.id !== old.id)
                                    }
                                }
                                return prev;
                            });
                        }
                        else if (eventType === 'UPDATE') {
                            setRoom((prev) => {
                                if (prev) {
                                    return {
                                        ...prev,
                                        players: prev.players.map((player) => {
                                            if (player.id === id) {
                                                return {
                                                    id,
                                                    name,
                                                    hand
                                                }
                                            }
                                            return player;
                                        })
                                    }
                                }
                                return prev;
                            });
                        }
                    }
                )
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'session', filter: `id=eq.${room.id}` },
                    (payload) => {
                        const { started } = payload?.new;
                        console.log('session', payload);
                        setRoom((prev) => {
                            if (prev) {
                                return {
                                    ...prev,
                                    started,
                                }
                            }
                            return prev;
                        }
                        );
                    }
                )
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'tableview', filter: `session_id=eq.${room.id}` },
                    (payload) => {
                        console.log(payload.new)
                        if (payload?.new)
                            setRoom((prev) => {
                                if (prev) {
                                    return {
                                        ...prev,
                                        view: { ...prev?.view, table: payload.new } as any
                                    }
                                }
                                return prev;
                            }
                            );
                    })
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'tableview', filter: `session_id=eq.${room.id}` },
                    (payload) => {
                        if (payload?.new)
                            setRoom((prev) => {
                                if (prev) {
                                    return {
                                        ...prev,
                                        view: { ...prev?.view, table: payload.new } as any
                                    }
                                }
                                return prev;
                            }
                            );
                    })
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'handview', filter: `session_players_id=eq.${room?.you}` },
                    (payload) => {
                        console.log(payload)
                        if (payload?.new)
                            setRoom((prev) => {
                                if (prev) {
                                    return {
                                        ...prev,
                                        view: { ...prev?.view, hand: payload.new } as any
                                    }
                                }
                                return prev;
                            }
                            );
                    })
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'handview', filter: `session_players_id=eq.${room?.you}` },
                    (payload) => {
                        console.log(payload)
                        if (payload?.new)
                            setRoom((prev) => {
                                if (prev) {
                                    return {
                                        ...prev,
                                        view: { ...prev?.view, hand: payload.new } as any
                                    }
                                }
                                return prev;
                            }
                            );
                    })
                .subscribe();
            setSub(sessionPlayers);
        }
        else if (room && sub && room.players.length === 0) {
            setRoom(null);
            setFieldOrders(null);
            supabase.removeAllChannels();
            setSub(null);
        }
    }, [room])

    if (room?.started)
        return (
            <div className={"flex flex-col gap-2 flex-wrap items-center justify-between w-full h-full "+(dark?'dark':'')} style={!dark ? { backgroundColor: '#e0e0e0' } : { backgroundColor: '#121212' }}>

                {/* <div className="flex flex-wrap justify-between">
                {room.players.filter(player => player.id !== room?.you).map((player) =>
                        <div key={player.id} className="scale-[10%] flex flex-col items-center" style={{ borderColor: room.view?.table?.current === player.id ? 'lime' : '' }}>
                            <div>{player?.name}</div>
                            <Hand idxs={fieldOrders?.playerfields?.filter(x => x != '+buttons')} hand={{ top: player.hand as any }} />
                        </div>
                    )
                    }
                </div> */}

                <div className="flex gap-4 items-center">

                    {room.players.filter(player => player.id !== room?.you).map((player) =>
                        // <div key={player.id} className="scale-75 flex flex-col items-center" style={{ borderColor: room.view?.table?.current === player.id ? 'lime' : '' }}>
                        <div key={player.id} className={"flex-col p-6 [&.darkturn]:shadow-[inset_1px_1px_16px_#21232b_,_inset_-1px_-1px_15px_#0c0c0c] [&.turn]:shadow-[inset_5px_5px_16px_#a4a4a4_,_inset_-12px_-12px_15px_#ffffff] rounded-xl "+((room.view?.table?.current === player?.id)?`${dark?'dark':''}turn`:'')}>
                            <div className="dark:text-slate-300">{player?.name}</div>
                            <div className="w-[12rem] h-32">
                                <Hand dark={dark} idxs={fieldOrders?.playerfields?.filter(x => x != '+buttons' && (player.hand['+handtop'].length > 0 ? (x != '-handbottom') : (x != '+handtop')))} hand={{ top: player.hand as any }} />
                            </div>
                        </div>
                        // </div>
                    )
                    }

                </div>

                <div onClick={() => { setDark(!dark) }} className="w-[20rem] h-20">
                    <Hand dark={dark} idxs={fieldOrders?.gamefields} hand={room.view?.table as any} />
                </div>

                <div className={"flex flex-col items-center justify-between [&.darkturn]:shadow-[inset_1px_1px_16px_#21232b_,_inset_-1px_-1px_15px_#0c0c0c] [&.turn]:shadow-[inset_5px_5px_16px_#a4a4a4_,_inset_-12px_-12px_15px_#ffffff] p-8 rounded-md "+((room.view?.table?.current === room?.you)?`${dark?'dark':''}turn`:'')} >
                    {fieldOrders?.playerfields?.[0] &&
                        <div className="w-[32rem] h-40">

                            <Hand dark={dark} idxs={[fieldOrders.playerfields[0]]} hand={room.view?.hand} />

                        </div>
                    }
                    <div className="w-[26rem] h-36">
                        {
                            // '+handtop'
                            // '+handbottom'
                            fieldOrders?.playerfields?.slice(1, -1)?.filter(x => x != '+buttons' && (room.view?.hand?.top['+handtop'].length > 0 ? (x != '-handbottom') : (x != '+handtop'))).map((field, i) =>

                                <Hand dark={dark} key={i} idxs={[field]} hand={room.view?.hand} />

                            )

                        }
                    </div>
                    <div className="w-[25rem] h-16">
                        <Hand dark={dark} heightPc={50} idxs={fieldOrders?.playerfields?.filter(x => x == '+buttons')} hand={room.view?.hand} />
                    </div>
                </div>
            </div>
        )

    if (room?.started)
        return (
            <div className="w-full h-full flex flex-col gap-4 justify-center items-center bg-[#e0e0e0]">
                <div>game started</div>
                <div className="flex gap-4 items-center">

                    {room.players.filter(player => player.id !== room?.you).map((player) =>
                        <div key={player.id} className="scale-75 flex flex-col items-center" style={{ borderColor: room.view?.table?.current === player.id ? 'lime' : '' }}>
                            <div>{player?.name}</div>
                            <Hand idxs={fieldOrders?.playerfields?.filter(x => x != '+buttons')} hand={{ top: player.hand as any }} />
                        </div>
                    )
                    }

                </div>
                <div className="border-2 border-black flex flex-col items-center w-screen">

                    <Hand idxs={fieldOrders?.gamefields} hand={room.view?.table as any} />
                </div>
                <div className="border-2 border-black flex flex-col items-center" style={{ borderColor: room.view?.table?.current === room.you ? 'lime' : '' }}>
                    <Hand idxs={fieldOrders?.playerfields?.filter(x => x != '+buttons')} hand={room.view?.hand} />

                </div>
                <Hand idxs={fieldOrders?.playerfields?.filter(x => x == '+buttons')} hand={room.view?.hand} />

                {debugHand &&
                    <div className="border-2 border-black flex flex-col items-center">
                        <Hand idxs={fieldOrders?.playerfields} hand={{ top: debugHand.real.hand as any }} />
                    </div>}

                {debugHand &&
                    <div className="border-2 border-black flex flex-col items-center">
                        <Hand idxs={fieldOrders?.gamefields} hand={{ top: debugHand.real.table as any }} />
                    </div>}

                <button onClick={deleteRoom}>
                    Delete room
                </button>
                <button onClick={test}>
                    test
                </button>
            </div>
        )


    if (room)
        return (
            <>
                <div className="flex gap-2 justify-center items-center">
                    <div>
                        Room - {room.id}
                    </div>
                    <div>
                        Name:
                        <input className="border-2 ml-2" type="text" name="name" id="name" onInput={changeName} />
                    </div>
                </div>
                <div className="flex flex-col justify-center items-center mt-4">
                    Players:
                    <ul>
                        {room.players.map((player, i) => {
                            return (
                                <li key={i}>
                                    {player.name} - {player.id}
                                </li>
                            )
                        })
                        }
                    </ul>
                    <button onClick={deleteRoom}>
                        Delete room
                    </button>

                    <select name="games" id="games" onChange={setGame} defaultValue={""}>
                        <option value="" disabled>Select Game</option>
                        {
                            games.map((game) => {
                                return (
                                    <option key={game.id} value={game.id}>{game.name}</option>
                                )
                            })
                        }
                    </select>

                    <button onClick={generateTable}>
                        Start Game
                    </button>
                </div>
            </>
        )

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">

            <form className="flex flex-col items-center justify-center" onSubmit={handleSubmit}>
                <input type="text" name="session" id="session" className="border-2 border-black" />
                <button type="submit">
                    Join Session
                </button>
            </form>

            <button onClick={newRoom}>
                Create Session
            </button>
        </div>
    )
}