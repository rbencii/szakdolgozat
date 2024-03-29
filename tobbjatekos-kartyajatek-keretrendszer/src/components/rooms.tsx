import { RealtimeChannel, Session, SupabaseClient } from "@supabase/supabase-js";
import { SourceMap } from "module";
import { Fragment, useEffect, useRef, useState } from "react";
import Hand from '@/components/hand'
import { createSolutionBuilderWithWatchHost } from "typescript";
import Chat from "./chat";
import Reactions from "./reactions";
import MenuButton from "./menubutton";

export default function Rooms({ supabase, session }: { supabase: SupabaseClient<any, "public", any>, session: Session | null }) {
    const [room, setRoom] = useState<null | { owner: boolean | null, you: number, id: number, game_id: number | null, view?: { hand: any, table: { current: number, dir: number, next: number, top: { draw: boolean, tablecount: number, table: any } | any } }, players: { id: number, name: string, hand: any, wins: number | null }[], started: boolean }>(null);
    const [sub, setSub] = useState<null | RealtimeChannel>(null);
    const [games, setGames] = useState<{ id: number, name: string }[]>([]);
    const [debugHand, setDebugHand] = useState<any>(null);
    const [fieldOrders, setFieldOrders] = useState<{ playerfields: string[], gamefields: string[] } | null>(null);
    const [dark, setDark] = useState<boolean>(false);
    const [publicMode, setPublicMode] = useState<boolean>(false);

    const [roomList, setRoomList] = useState<string[]>([])

    const [chat, setChat] = useState<{ name: string, text: string }[]>(JSON.parse(sessionStorage.getItem('chat') || '[]'));
    const refreshRoomList = useRef<any>(null);


    const [reactionQueue, setReactionQueue] = useState<{ name: string, emoji: string }[]>([]);
    const clearReactions = useRef<any>(null);

    const players = useRef<any>(room?.players);
    players.current = room?.players;

    const addReaction = (name: string, emoji: string) => {
        setReactionQueue((prev) => { return [...prev, { name, emoji }] });
        clearInterval(clearReactions.current);
        clearReactions.current = setInterval(() => {
            setReactionQueue([]);
        }
            , 5000);

    }

    const sendReaction = (emoji: string) => {
        if (sub && reactionQueue.length < 30) {
            sub.send({
                type: 'broadcast',
                event: 'reaction',
                payload: { name: room?.players.find(p => p.id === Number(room?.you))?.name, emoji },
            })
            addReaction('', emoji);
        }
    }







    const sendMessage = (msg: string) => {
        if (sub) {
            sub.send({
                type: 'broadcast',
                event: 'text',
                payload: { [Number(room?.you)]: msg },
            })
            const name = room?.players.find(p => p.id === Number(room?.you))?.name;

            setChat((prev) => {
                sessionStorage.setItem('chat', JSON.stringify([...prev, { name: name || "unknown", text: msg }]));
                return [...prev, { name: name || "unknown", text: msg }];
            });
        }
    }

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
    }


    const makePublic = async () => {

        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: room?.id
            })
        }

        const resp = await fetch('api/room/makepublic', options);
        const obj = await resp.json();
        console.log(obj);
    }

    const deleteRoom = async () => {
        const resp = await fetch('api/room/delete');
        const obj = await resp.json();
        console.log(obj);
        sessionStorage.removeItem('chat');
        setChat([]);
        setRoom(null);
        supabase.removeAllChannels();
        setSub(null);
    }

    const leaveRoom = async () => {
        const resp = await fetch('api/room/leave');
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


    const listRooms = async () => {
        const resp = await fetch('api/room/list');
        const obj = await resp.json();
        if (obj.list)
            setRoomList(obj?.list)

        console.log(obj.list)
    }


    useEffect(() => {

        if (room === null && refreshRoomList.current == null)
            refreshRoomList.current = setInterval(listRooms, 2000);

        if (fieldOrders == null)
            getFieldOrders();



        if (room === null)
            loadRoom();
        if (room && !sub && room?.id && room?.you) {
            clearInterval(refreshRoomList.current);
            refreshRoomList.current = null;
            listGames();
            const sessionPlayers = supabase.channel(String(room.id))
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'session_players', filter: `session_id=eq.${room.id}` },
                    (payload) => {
                        const { eventType, new: newobj, old } = payload as any;
                        const { id, name, started, hand } = newobj as any;
                        if (eventType === 'INSERT') {
                            setRoom((prev) => {
                                if (prev) {
                                    let players = [...prev.players, { id, name, hand: null, wins: null }];
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
                            if (room?.started == true)
                                setTimeout(() =>
                                    setRoom((prev) => {
                                        if (prev) {
                                            return {
                                                ...prev,
                                                players: prev.players.filter((player) => player.id !== old.id)
                                            }
                                        }
                                        return prev;
                                    }), 2000);
                            else
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
                                                    hand,
                                                    wins: player?.wins
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
                        const { started, public: pb } = payload?.new;
                        setPublicMode(pb ?? false);
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
                .on('broadcast', { event: 'text' }, (payload) => {
                    const key = Number(Object.keys(payload?.payload)?.[0]);
                    const player = players.current?.find((player: any) => player.id == key);
                    if (key != undefined && player != undefined)
                        setChat((prev) => {
                            sessionStorage.setItem('chat', JSON.stringify([...prev, { name: player?.name, text: String(Object.values(payload?.payload)?.[0]) }]));
                            return [...prev, { name: player?.name, text: String(Object.values(payload?.payload)?.[0]) }];
                        })
                })
                .on('broadcast', { event: 'reaction' }, (payload) => {
                    const { name, emoji } = payload?.payload;
                    addReaction(name, emoji);
                })
                .subscribe((status) => {
                })

            setSub(sessionPlayers);
        }
        else if (room && sub && room.players.length === 0) {
            if (room?.started == false) {
                sessionStorage.removeItem('chat');
                setChat([]);
                setRoom(null);
                setFieldOrders(null);
                supabase.removeAllChannels();
                setSub(null);
            }
            else
                setTimeout(
                    () => {
                        sessionStorage.removeItem('chat');
                        setChat([]);
                        setRoom(null);
                        setFieldOrders(null);
                        supabase.removeAllChannels();
                        setSub(null);
                    }, 2000
                )
        }

    }, [room])

    //IN ROOM STARTED
    if (room?.started)
        return (
            <div className={"flex flex-col items-center justify-between w-full h-full " + (dark ? 'dark' : '')} style={!dark ? { backgroundColor: '#e0e0e0' } : { backgroundColor: '#121212' }}>
                <div className="w-full h-full flex flex-col overflow-x-auto">
                    <div className="flex gap-4 items-center">

                        {room.players.filter(player => player.id !== room?.you).map((player) =>
                            <div key={player.id} className={"flex-col first:ml-auto last:mr-auto relative p-4 [&.darkturn]:shadow-[inset_1px_1px_16px_#21232b_,_inset_-1px_-1px_15px_#0c0c0c] [&.turn]:shadow-[inset_5px_5px_16px_#a4a4a4_,_inset_-12px_-12px_15px_#ffffff] rounded-xl " + ((room.view?.table?.current === player?.id) ? `${dark ? 'dark' : ''}turn` : '')}>

                                <div className="dark:text-slate-300">{player?.name} ({Object.entries(player.hand)?.filter(x => x?.includes('buttons') == false)?.map(x => x?.slice(-1)?.[0]).reduce((p, c) => p + (c as any)?.length ?? 0, 0) as number})</div>
                                {
                                    fieldOrders?.playerfields?.filter(x => !x?.includes('buttons')).filter(x => player?.hand?.[x]?.length != 0).slice(0, 2).reverse().map((field, i) =>
                                        <div key={i} className="w-[min(25vh,25svh)] w-[min(25vh,25svh,60vw)] h-[min(9vh,9svh)] h-[min(9vh,9svh)]">
                                            <Hand dark={dark} idxs={[field]} hand={{ top: player.hand }} />
                                        </div>)
                                }
                            </div>
                        )
                        }

                    </div>
                </div>
                <div className="flex flex-col h-full overflow-y-auto">
                    <div className="my-auto flex flex-col">
                        {
                            fieldOrders?.gamefields?.filter((x: any) => room.view?.table?.top?.[x]?.length > 0)?.map((field, i) =>
                                <div key={i} className="w-[min(29vh,29svh,700vw)] min-h-[min(10vh,10svh)] h-[min(10vh,10svh)]">
                                    <Hand keepright={true} dark={dark} idxs={[field]} hand={room.view?.table as any} />
                                </div>)
                        }
                    </div>
                </div>
                <div className={"flex flex-col items-center justify-between [&.darkturn]:shadow-[inset_1px_1px_16px_#21232b_,_inset_-1px_-1px_15px_#0c0c0c] [&.turn]:shadow-[inset_5px_5px_16px_#a4a4a4_,_inset_-12px_-12px_15px_#ffffff] p-8 rounded-md " + ((room.view?.table?.current === room?.you) ? `${dark ? 'dark' : ''}turn` : '')} >
                    {fieldOrders?.playerfields?.filter(x => !x?.includes('buttons')).filter(x => room.view?.hand?.top?.[x]?.length != 0).slice(0, 1).map((field, i) =>
                        <div key={i} className="w-[min(52vh,52svh,80vw)] h-[min(18vh,18svh,28vw)]">
                            <Hand dark={dark} idxs={[field]} hand={room.view?.hand} />
                        </div>
                    )}

                    {Object.keys(room?.view?.hand?.top).length > 1 &&
                        <div className="w-[min(50vh,50svh,60vw)] h-[min(18vh,18svh,22vw)]">
                            {
                                fieldOrders?.playerfields?.filter(x => !x?.includes('buttons')).filter(x => room.view?.hand?.top?.[x]?.length != 0).slice(1, 2).map((field, i) =>

                                    <Hand dark={dark} key={i} idxs={[field]} hand={room.view?.hand} />

                                )
                            }
                        </div>}
                    {fieldOrders?.playerfields?.filter(x => x?.includes('buttons'))?.length !== 0 && <div className="w-[min(50vh,50svh,80vw)] h-[min(7vh,7svh,11vw)]">
                        <Hand dark={dark} heightPc={50} idxs={fieldOrders?.playerfields?.filter(x => x?.includes('buttons'))} hand={room.view?.hand} />
                    </div>}
                </div>
                <div className="absolute w-full h-full top-0 left-0 overflow-hidden pointer-events-none select-none">
                    <Reactions reactionQueue={reactionQueue} selfReact={(emoji: string) => sendReaction(emoji)}></Reactions>
                </div>
                <Chat chat={chat} sendMessage={sendMessage}></Chat>

                {
                    room?.owner &&
                    <button onClick={deleteRoom} className="w-20 h-10 absolute left-2 bottom-2 scale-75">
                        <MenuButton text='Delete' />
                    </button>
                }

                <button className="absolute -left-4 top-0.5 scale-50" onClick={() => { setDark(!dark) }}>
                    <MenuButton text='Dark Mode' />
                </button>
            </div>
        )

    if (room)
        return (
            <div className="w-full h-full flex items-center justify-center text-blue-950 px-6">

                <div className="w-full h-full max-w-2xl max-h-96 grid grid-cols-2 md:grid-cols-4 md:grid-rows-3 gap-6">
                    <div className="row-span-2 col-span-2 w-full h-full flex flex-col">
                        <div className="text-xl">Room - {room.id} {publicMode && '(Public)'}</div>
                        <div className="flex flex-col text-sm items-center justify-start row-span-2 w-full h-full text-blue-950 overflow-y-auto border-2 rounded-md border-white/80 bg-cyan-50/60 p-2">
                            {
                                room.players.map((player, i) => <div key={i}>{player.name}#{player.id} {player?.wins && <span className="bg-white border-2 border-amber-200 rounded-full p-0.5 px-1.5">{player.wins}&#127942;</span>}</div>)
                            }
                        </div>
                    </div>
                    <div className="w-full h-full col-span-2 flex flex-col">
                        <div className="text-xl">Name</div>
                        <input placeholder={'New Player'} type="text" name="name" id="name" onInput={changeName} className="rounded-xl px-2 h-full w-full text-center placeholder:text-blue-950/60 text-blue-950 border-2 border-white/80 bg-gray-100 bg-[linear-gradient(90deg,rgba(165,243,252,0.2)_0%,rgba(251,207,232,0.2)_100%)]" />
                    </div>

                    {room?.owner && <div className="w-full h-full col-span-2 flex flex-col">
                        <div className="text-xl">Select Game</div>

                        <select name="games" id="games" onChange={setGame} defaultValue={""} className="px-2 h-full w-full text-center placeholder:text-blue-950/60 text-blue-950 border-2 border-white/80 bg-gray-100 bg-[linear-gradient(90deg,rgba(165,243,252,0.2)_0%,rgba(251,207,232,0.2)_100%)]">
                            <option value="" disabled>Select Game</option>
                            {
                                games.map((game) => {
                                    return (
                                        <option key={game.id} value={game.id}>{game.name}</option>
                                    )
                                })
                            }
                        </select>
                    </div>}

                    {
                        room?.owner ?
                            <button onClick={deleteRoom} className="w-full h-full md:h-1/2">
                                <MenuButton text='Delete' />
                            </button>
                            :
                            <button onClick={leaveRoom} className="w-full h-full col-span-2">
                                <MenuButton text='Leave' />
                            </button>
                    }

                    {room?.owner && <button onClick={makePublic} className="w-full h-full md:h-1/2" style={{ pointerEvents: publicMode ? 'none' : 'auto' }}>
                        <MenuButton text='Make Public' />
                    </button>}

                    {room?.owner && <button onClick={generateTable} className="w-full h-full md:h-1/2 col-span-2">
                        <MenuButton text='Start Game' />
                    </button>}

                </div>

            </div>
        )

    //NOT IN ROOM
    return (
        <form onSubmit={handleSubmit} className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">

            <a href="/" className="w-20 opacity-50 absolute left-4 top-4">
                <MenuButton text=
                    {'<<<'} />
            </a>

            <input placeholder={'Enter code'} type="text" name="session" id="session" className="rounded-xl px-2 w-full max-w-[10rem] text-center placeholder:text-blue-950/60 text-blue-950 border-2 border-white/80 bg-gray-100 bg-[linear-gradient(90deg,rgba(165,243,252,0.2)_0%,rgba(251,207,232,0.2)_100%)]" />

            <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full max-w-[48rem] max-h-64 gap-4">

                <button type="submit" className="w-full h-full">
                    <MenuButton text='Join Room' />
                </button>

                <div className="flex flex-col order-last text-sm md:order-none items-center justify-start row-span-2 h-full text-blue-950 overflow-y-auto border-2 rounded-md border-white/20 bg-pink-100/50 p-2">
                    <div className="text-lg mb-2 sticky top-0 backdrop-blur-[1px]">Public Rooms</div>
                    {
                        roomList.map(x => <div key={x}>{x}</div>)
                    }
                </div>

                <button onClick={newRoom} className="w-full h-full">
                    <MenuButton text='Create Room' />
                </button>


            </div>


        </form>
    )
}