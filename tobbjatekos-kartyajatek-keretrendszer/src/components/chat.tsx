import { useState } from "react";

export default function Chat({chat, sendMessage}: {chat: {name: string, text: string}[], sendMessage: (msg: string)=>void}){

    const [input, setInput] = useState("");
    
    const handleInput = (e: InputEvent)=>{
        if(e.target==null) return;
        setInput((e.target as any).value??'');
    }

    const send = (e: KeyboardEvent)=>{

        if(e.key == 'Enter')
        {
            sendMessage(input);
            setInput("");
        }

    }


    return(
        <div className="absolute bottom-4 opacity-20 hover:opacity-100 transition-all duration-1000 delay-[5000ms] hover:delay-0 right-4 bg-slate-100 rounded-xl px-2 py-0.5 text-slate-600 z-50">
            <details>
    <summary className="cursor-pointer">Chat</summary>
        <div className="scroller">
  <div className="scroller-content" id="scrollerContent">
    {
        chat.map((msg, i)=>{
            return(
                <div key={i} className="item">{msg.name}: {msg.text}</div>
            )
        })
    }
  <input value={input} onInput={(e: any)=>handleInput(e)} onKeyUp={(e:any)=>send(e)} className="absolute w-full left-0 rounded-b-xl px-2 h-6" type="text" name="" id="" />
  </div>
</div>
</details>
</div>
    )
}