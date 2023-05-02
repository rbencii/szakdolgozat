import { CardData } from "./hand";

export default function Card2({ card }: { card: CardData }) {

    if (card.value === 'hidden')
        return (<div className="w-6 text-center">#</div>)

    let icon;
    const suits = ["Clubs", "Diamonds", "Hearts", "Spades"];
    if (!suits.includes(card.suit))
        return (<div className="cursor-pointer text-center">{card.suit}</div>)

    card.suit === "Diamonds" ? (icon = "&diams;") : (icon = "&" + card.suit.toLowerCase() + ";");

    if(card.sorter==2)
    return (
        <div className="relative group">                                                                                    {/* #21232b      #2d2f3a   (Xa4a4a4, Xffffff) */}
            <div className="w-24 h-36 text-white/50 relative rounded-md flex flex-col overflow-hidden transition-all shadow-[0px_0px_0px_#21232b,_0px_0px_0px_#2d2f3a] duration-500  hover:shadow-[5px_5px_16px_#21232b_,_-4px_-4px_15px_#2d2f3a]">

                <div style={['Clubs','Spades'].includes(card.suit)?{display: 'block'}:{display: 'none'}}>
                <div className="block group-hover:w-32 w-8 duration-0 h-8 absolute left-0 top-0 rounded-full bg-cyan-300 transition-all duration-500"></div>
                <div className="block w-8 duration-0 h-12 absolute left-0 bottom-0 rounded-full bg-green-200 transition-all duration-500"></div>
                <div className="block group-hover:h-32 group-hover:w-32 w-12 duration-0 h-16 top-12 -right-8 absolute rounded-full bg-green-100 transition-all duration-500"></div>
                </div>
                
                <div style={['Diamonds','Hearts'].includes(card.suit)?{display: 'block'}:{display: 'none'}}>
                <div className="block group-hover:w-32 w-12 duration-0 h-8 absolute left-0 top-0 rounded-full bg-pink-300 transition-all duration-500"></div>
                <div className="block w-8 duration-0 h-12 absolute left-0 bottom-0 rounded-full bg-red-200 transition-all duration-500"></div>
                <div className="block group-hover:h-32 group-hover:w-32 w-12 duration-0 h-16 top-12 -right-2 absolute rounded-full bg-purple-200 transition-all duration-500"></div>
                </div>
                
                <div className="w-full shadow-[inset_5px_5px_16px_#21232b_,_inset_-6px_-6px_15px_#2d2f3a] group-hover:shadow-[inset_0px_0px_0px_#2d2f3a_,_inset_0px_0px_0px_#2d2f3a] group-hover:duration-200 duration-1000 transition-all pointer-events-none h-full backdrop-blur-xl bg-[#272932]/[33%] border-2 border-[#272932]/20 rounded-md leading-none p-1 flex flex-col justify-between">
                    <div>{card.value}<span dangerouslySetInnerHTML={{ __html: icon }}></span></div>
                    <div className="rotate-180">{card.value}<span dangerouslySetInnerHTML={{ __html: icon }}></span></div>
                </div>
            </div>
        </div>

    )

    return (
        <div className="relative group">                                                                                    {/* #21232b      #2d2f3a   (Xa4a4a4, Xffffff) */}
            <div className="w-24 h-36 relative rounded-md flex flex-col overflow-hidden transition-all shadow-[0px_0px_0px_#a4a4a4,_0px_0px_0px_#ffffff] duration-200 hover:shadow-[5px_5px_16px_#a4a4a4_,_-6px_-6px_15px_#ffffff]">

                <div style={['Clubs','Spades'].includes(card.suit)?{display: 'block'}:{display: 'none'}}>
                <div className="block group-hover:w-32 w-8 duration-0 h-8 absolute left-0 top-0 rounded-full bg-cyan-300 transition-all duration-500"></div>
                <div className="block w-8 duration-0 h-12 absolute left-0 bottom-0 rounded-full bg-green-200 transition-all duration-500"></div>
                <div className="block group-hover:h-32 group-hover:w-32 w-12 duration-0 h-16 top-12 -right-8 absolute rounded-full bg-green-100 transition-all duration-500"></div>
                </div>
                
                <div style={['Diamonds','Hearts'].includes(card.suit)?{display: 'block'}:{display: 'none'}}>
                <div className="block group-hover:w-32 w-12 duration-0 h-8 absolute left-0 top-0 rounded-full bg-pink-300 transition-all duration-500"></div>
                <div className="block w-8 duration-0 h-12 absolute left-0 bottom-0 rounded-full bg-red-200 transition-all duration-500"></div>
                <div className="block group-hover:h-32 group-hover:w-32 w-12 duration-0 h-16 top-12 -right-2 absolute rounded-full bg-purple-200 transition-all duration-500"></div>
                </div>
                
                <div className="w-full shadow-[inset_5px_5px_16px_#a4a4a4_,_inset_-6px_-6px_15px_#ffffff] group-hover:shadow-[inset_0px_0px_0px_#ffffff_,_inset_0px_0px_0px_#ffffff] group-hover:duration-200 duration-1000 transition-all pointer-events-none h-full backdrop-blur-xl bg-white/[33%] border-2 border-white/20 rounded-md leading-none p-1 flex flex-col justify-between">
                    <div>{card.value}<span dangerouslySetInnerHTML={{ __html: icon }}></span></div>
                    <div className="rotate-180">{card.value}<span dangerouslySetInnerHTML={{ __html: icon }}></span></div>
                </div>
            </div>
        </div>

    )
}