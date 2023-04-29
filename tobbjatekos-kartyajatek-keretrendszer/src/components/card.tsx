import { CardData } from "./hand";

export default function Card({card}: {card: CardData}){
    
        if(card.value==='hidden')
        return(<div className="w-6 text-center">#</div>)

    let icon;
    const suits = ["Clubs", "Diamonds", "Hearts", "Spades"];
    if(!suits.includes(card.suit))
        return(<div className="cursor-pointer text-center">{card.suit}</div>)

    card.suit === "Diamonds" ? (icon = "&diams;") : (icon = "&" + card.suit.toLowerCase() + ";");

    return(<div className="w-6 text-center">
        {card.value}<span dangerouslySetInnerHTML={{__html:icon}}></span>
        </div>)
    
}