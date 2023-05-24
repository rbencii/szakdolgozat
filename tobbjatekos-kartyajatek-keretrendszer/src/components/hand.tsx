import Card from "@/components/card";
import Card2 from "./card2";
import { Fragment, use, useEffect, useRef } from "react";

export interface CardData {
    suit: string,
    value: string,
    sorter: number
}

export default function Hand({ hand, idxs: indexes, cols, heightPc, gap, dark, keepright }: { hand: { top: any }, idxs: string[] | null | undefined, cols?: number, heightPc?: number, gap?: number, dark?: boolean, keepright?: boolean }) {

    const overflowing = useRef<any>();
    const canClick = useRef<boolean>(true);

    if (!indexes)
        return (<div>loading</div>)

    //let idxs = Object.keys(hand.top);
    let top = { ...hand.top };
    let draw = false;
    let tablecount = top?.tablecount;
    if (tablecount !== undefined)
        delete top.tablecount;

    let isTable = false;
    if (top?.draw !== undefined) {
        draw = top.draw ? true : false;
        delete top.draw;
        isTable = true;
    }


    const idxs = indexes.length == 0 ? Object.keys(top) : indexes;
    for (let idx of idxs) {
        top[idx].sort((a: CardData, b: CardData) => a.sorter - b.sorter);
    }

    const place = async (h: string, i: number) => {
        if (canClick.current == false)
            return;

        canClick.current = false;
        console.log('Started placing.');
        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ handidx: h, cardidx: i })
        };
        const resp = await fetch('api/room/place', options);
        const obj = await resp.json();
        if(obj){
            canClick.current = true;
        }
        console.log(obj);
    }

    //console.log(top?.['-variable']);
    //if(top?.['-variable']!==undefined)
    //return (<div>{top?.['-variable'][0].value}</div>)



    // idxs.splice(1,10);
    // top[idxs[0]]=top[idxs[0]].slice(0,1);

    if(keepright)
    useEffect(() => {
        console.log('rerender');
        overflowing.current.scrollLeft = overflowing.current.scrollWidth;
    }, [top])



    return (
        <div className="flex relative flex-col w-full h-full">
            {
                idxs.filter((x: any)=>top?.[x]!=null && top?.[x]?.length>0 ).map((idx) => <div key={idx} style={{ gap: `${gap??2}%`}} ref={overflowing} className="flex w-full min-h-[calc(100%+2rem)] pt-[1rem] -mb-[1rem] relative -top-[1rem] hand overflow-x-auto">
                    {top[idx].map((card: CardData, i: number) =>
                        <div className="h-0 first:ml-auto last:mr-auto" key={i} style={{minWidth: `${100/(cols??5)}%`}} onClick={() => place(idx, i)}>
                            <div style={{paddingTop: `${heightPc??160}%`}} className="relative flex w-full">
                                <div className="w-full h-full absolute left-0 top-0">
                                    <Card2 dark={dark} card={card} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>)

            }
        </div>
    )

    return (
        <>
            {draw && tablecount && <div className="flex gap-2.5">{tablecount}<Card card={{ suit: 'hidden', value: 'hidden' } as any} /></div>}
            {idxs.map((idx) =>
                <div className="flex flex-wrap gap-6 my-2 relative" style={isTable ? { transform: 'translateX(-50%)', left: '1rem' } : {}} key={idx}>

                    {top[idx].map((card: CardData, i: number) =>
                        <div key={i} onClick={() => place(idx, i)}>
                            {/* <Card2 style={isTable?{opacity: `${70-(((top[idx].length-2)-i)*20)}%`}:{}} card={card}/> */}
                            <div className="w-24 h-36 block">
                                <Card2 card={card} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}