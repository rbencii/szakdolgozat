import { useEffect, useState } from "react"

export default function Leaderboard({game_id, room_id}: {game_id: number, room_id: number}){

    const [scores, setScores] = useState<{name: string, wins: number}[]>([])

    const getScores = async () => {
        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({game_id, room_id})
        }

        const resp = await fetch('api/game/leaderboard', options);
        const obj = await resp.json();
        if(obj?.scores)
        setScores(obj.scores);
    }

    useEffect(()=>{
        if(scores.length==0)
        getScores();
    }
    ,[scores])


    return(
        <div>
            {scores.map((x,i)=><div key={i}>{x.name} {x.wins}</div>)}
        </div>
    )
}