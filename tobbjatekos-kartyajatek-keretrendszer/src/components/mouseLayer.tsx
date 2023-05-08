import { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

export default function MouseLayer({mouses, id}: {mouses: { [key: number|string]: {x:number, y:number, text: string} }, id:number}){
    const pos = mouses[id]
    const colorRef = useRef(`rgb(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)})`)
    const colorRef2 = useRef(`rgb(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)})`)
    if(!pos)
    return <></>
// useEffect(()=>{
//     if(!isSubscribed.current && ownHandRef.current){

//     ownHandRef.current.addEventListener('mousemove', (e) => {

//         if(!ownHandRef.current)
//         return;

//         const boundingClientRect = ownHandRef.current.getBoundingClientRect();
//         const left = boundingClientRect.left;
//         const top = boundingClientRect.top;
//         const width = boundingClientRect.width;
//         const height = boundingClientRect.height;

//         ownMouse.current = { from: id, x: (e.clientX-left)/width, y: (e.clientY-top)/height };
//         //console.log(ownMouse.current)
//     });



//     channel.on('broadcast', {event: 'cursor'}, (payload) => {
//             //console.log(payload.payload);
//             console.log(ownMouse.current)
//         if(ownMouse.current.y>0.5)
//         setMouse(payload.payload);
//     }).subscribe((status) => {
//         if (status === 'SUBSCRIBED') {
//             setInterval(() => {
//                 channel.send({
//                   type: 'broadcast',
//                   event: 'cursor',
//                   payload: { x: ownMouse.current.x, y: ownMouse.current.y },
//                 })
//               }, 100)
//         }
//     })



//     console.log('subscribed');
//     isSubscribed.current = true;
// }

// },[])

return (
    <>
    <div className="w-2 h-2 rounded-full block absolute transition-all ease-linear" style={{right: `${pos.x*100}%`, bottom: `${pos.y*100}%`, background: `radial-gradient(${colorRef.current}, ${colorRef2.current})`}}></div>
    <div className="absolute transition-all ease-linear" style={{right: `${pos.x*100}%`, bottom: `${pos.y*100}%`}}>{pos.text}</div>
    </>
)

}