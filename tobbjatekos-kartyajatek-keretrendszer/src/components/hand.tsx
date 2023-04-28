import Card from "@/components/card";

export interface CardData {
    suit: string,
    value: string,
}

export default function Hand({hand}: {hand: {top: any}}){
    //let idxs = Object.keys(hand.top);
    let top = {...hand.top};
    let draw=false;
    let tablecount=top?.tablecount;
    if(tablecount!==undefined)
        delete top.tablecount;
        
    if(top?.draw!==undefined){
        draw=top.draw?true:false;
        delete top.draw;
    }
    const idxs = Object.keys(top);

    const place = async (h:string, i:number) => {
        const options : RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ handidx:h, cardidx:i })
        };
        const resp = await fetch('api/room/place',options);
        const obj = await resp.json();
        console.log(obj);
    }


    return(
        <>
            {draw && tablecount && <div className="flex gap-2.5">{tablecount}<Card card={{suit: 'hidden', value: 'hidden'}}/></div>}
            {idxs.map((idx)=>
            <div className="flex gap-2.5" key={idx}>
                
                {top[idx].map((card: CardData, i: number)=>
                <div key={i} onClick={()=>place(idx,i)}>
                <Card card={card}/>
                </div>
                )}
            </div>
            )}
        </>
    )
}