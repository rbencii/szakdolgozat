import { CardData } from "./hand";

export default function Card({card, style}: {card: CardData, style?: any}){
    
        if(card.value==='hidden')
        return(<div className="w-6 text-center">#</div>)

    let icon;
    const suits = ["Clubs", "Diamonds", "Hearts", "Spades"];
    if(!suits.includes(card.suit))
        return(<div className="cursor-pointer text-center">{card.suit}</div>)

    card.suit === "Diamonds" ? (icon = "&diams;") : (icon = "&" + card.suit.toLowerCase() + ";");

    return(<div className="w-6 text-center select-none cursor-pointer hover:scale-125 active:duration-0 hover:duration-300 hover:text-green-500 active:text-green-200 transition-all duration-700" style={style}>
        {card.value}<span dangerouslySetInnerHTML={{__html:icon}}></span>
        </div>)
    
}