import Card from "@/components/card";

export interface CardData {
    suit: string,
    value: string,
    sorter: number
}

export default function Hand({hand, idxs: indexes}: {hand: {top: any}, idxs: string[]|null|undefined}){

    if(!indexes)
        return(<div>loading</div>)

    //let idxs = Object.keys(hand.top);
    let top = {...hand.top};
    let draw=false;
    let tablecount=top?.tablecount;
    if(tablecount!==undefined)
        delete top.tablecount;
        
        let isTable = false;
    if(top?.draw!==undefined){
        draw=top.draw?true:false;
        delete top.draw;
        isTable=true;
    }


    const idxs = indexes.length==0?Object.keys(top):indexes;
    for(let idx of idxs){
        top[idx].sort((a: CardData, b: CardData) => a.sorter - b.sorter);
    }

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

    //console.log(top?.['-variable']);
    //if(top?.['-variable']!==undefined)
    //return (<div>{top?.['-variable'][0].value}</div>)
    return(
        <>
            {draw && tablecount && <div className="flex gap-2.5">{tablecount}<Card card={{suit: 'hidden', value: 'hidden'} as any}/></div>}
            {idxs.map((idx)=>
            <div className="flex flex-wrap gap-2.5 relative" style={isTable ? {transform: 'translateX(-50%)', left: '1rem'}: {}} key={idx}>
                
                {top[idx].map((card: CardData, i: number)=>
                <div key={i} onClick={()=>place(idx,i)}>
                <Card style={isTable?{opacity: `${70-(((top[idx].length-2)-i)*20)}%`}:{}} card={card}/>
                </div>
                )}
            </div>
            )}
        </>
    )
}