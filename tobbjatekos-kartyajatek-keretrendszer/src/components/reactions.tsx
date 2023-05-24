import { use, useEffect, useRef, useState } from "react";

export default function Reactions({reactionQueue, selfReact}: {reactionQueue: {name: string, emoji: string}[], selfReact: (emoji: string)=>void}){

    

    return(
        <div className="absolute left-1/2 bottom-4 -translate-x-1/2 flex gap-2 text-2xl cursor-pointer select-none pointer-events-auto z-20">
            <div className="animate-wiggle opacity-20 hover:opacity-100 transition-all duration-500 active:scale-150 active:duration-0" onClick={()=>selfReact('&#129315;')}>&#129315;</div>
            <div className="opacity-20 hover:opacity-100 transition-all duration-500 active:scale-150 active:duration-0" onClick={()=>selfReact('&#128578;') } >&#128578;</div>
            <div className="opacity-20 hover:opacity-100 transition-all duration-500 active:scale-150 active:duration-0" onClick={()=>selfReact('&#129299;') }  >&#129299;</div>
            <div className="opacity-20 hover:opacity-100 transition-all duration-500 active:scale-150 active:duration-0" onClick={()=>selfReact('&#128545;') }  >&#128545;</div>
            <div className="opacity-20 hover:opacity-100 transition-all duration-500 active:scale-150 active:duration-0" onClick={()=>selfReact('&#129313;') }  >&#129313;</div>
            {reactionQueue.map((reaction, i)=>
            <div key={i} className="absolute w-full flex justify-center top-0 h-screen select-none pointer-events-none">
            <div className="relative transition-all text-yellow-700 animate-float duration-[3000ms] w-fit">
                <span className="text-sm">{reaction.name}</span><span dangerouslySetInnerHTML={{__html:reaction.emoji}}></span>
            </div>
            
            </div>)}
        </div>
    )
}