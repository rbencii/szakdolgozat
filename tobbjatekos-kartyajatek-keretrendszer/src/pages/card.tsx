import Card2 from "@/components/card2";
import { useState } from "react";

export default function CardO() {
    //const [bgc, setBgc] = useState('#e0e0e0');
    //const [bgc, setBgc] = useState('#272932');
    const [dark, setDark] = useState(false);

    if(!dark)
    return (<div>
        <div onClick={()=>setDark(!dark)} className="w-full h-full" style={{backgroundColor: '#e0e0e0'}}>
            <div className="flex w-full gap-8 h-full items-center justify-center">
            <Card2 card={{value:"A", suit:"Spades", sorter: 3}} />
            <Card2 card={{value:"4", suit:"Diamonds", sorter: 3}} />
            <Card2 card={{value:"8", suit:"Clubs", sorter: 3}} />
            <Card2 card={{value:"2", suit:"Hearts", sorter: 3}} />
            <Card2 card={{value:"5", suit:"Spades", sorter: 3}} />
            </div>
        </div>
        </div>
    )
    
    return (<div>
        <div onClick={()=>setDark(!dark)} className="flex w-full gap-8 h-full items-center justify-center" style={{backgroundColor: '#121212'}}>
            <Card2 card={{value:"A", suit:"Spades", sorter: 2}} />
            <Card2 card={{value:"4", suit:"Diamonds", sorter: 2}} />
            <Card2 card={{value:"8", suit:"Clubs", sorter: 2}} />
            <Card2 card={{value:"2", suit:"Hearts", sorter: 2}} />
            <Card2 card={{value:"5", suit:"Spades", sorter: 2}} />
        </div>
        </div>
    )
}