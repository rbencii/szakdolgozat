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
    const eventListenerSet = useRef<boolean>(false);

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

    const idxs = indexes?.length == 0 ? Object.keys(top) : indexes;
    if(idxs)
    for (let idx of idxs) {
        if(top[idx] != null && top[idx]?.length && top[idx]?.length>0)
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

    useEffect(() => {
        if(overflowing.current && keepright)
        overflowing.current.scrollLeft = overflowing.current.scrollWidth;
    }, [top])

    useEffect(() => {
        const horizontalScroll = (e: any) => {
           let touchscreen = (navigator.maxTouchPoints || 'ontouchstart' in document.documentElement);
            if(e.deltaX != 0 || touchscreen) return;
            e.preventDefault();
            if(e.deltaY > 0) overflowing.current.scrollLeft += 3;
            else overflowing.current.scrollLeft -= 3;
        }
        if(overflowing.current && !eventListenerSet.current){
        eventListenerSet.current = true;
        overflowing.current.addEventListener('wheel', horizontalScroll);
        }
        return()=>{
            eventListenerSet.current = false;
            if(overflowing.current)
            overflowing.current.removeEventListener('wheel', horizontalScroll);
        }
    }, [])

    if (!indexes && idxs==null)
        return (<div>loading</div>)


    return (
        <div className="flex relative flex-col w-full h-full">
            {
                idxs?.filter((x: any)=>top?.[x]!=null && top?.[x]?.length>0 ).map((idx) => <div key={idx} style={{ gap: `${gap??2}%`}} ref={overflowing} className="flex w-full min-h-[calc(100%+2rem)] pt-[1rem] -mb-[1rem] relative -top-[1rem] hand overflow-x-auto">
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
}