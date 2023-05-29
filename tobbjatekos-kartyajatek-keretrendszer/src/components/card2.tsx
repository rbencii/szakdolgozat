import { CardData } from "./hand";

export default function Card2({ card, dark }: { card: CardData, dark?: boolean }) {

    const blue = ['Clubs','Spades'].includes(card.suit)
    const red = ['Diamonds','Hearts'].includes(card.suit)

    let icon;
    const suits = ["Clubs", "Diamonds", "Hearts", "Spades"];

    card.suit === "Diamonds" ? (icon = "&diams;") : (icon = "&" + card.suit.toLowerCase() + ";");

    if(dark && blue){
    return (
        <div className="relative group flex w-full h-full items-center justify-center transition-all">                                                                                   
            <div className="w-full h-full text-white/50 relative rounded-md flex flex-col overflow-hidden transition-all shadow-[0px_0px_0px_#21232b,_0px_0px_0px_#2d2f3a] duration-500  hover:shadow-[5px_5px_16px_#21232b_,_-4px_-4px_15px_#2d2f3a]">

                <div>
                    <div className="block group-hover:w-32 w-8 duration-0 h-8 absolute left-0 top-0 rounded-full bg-cyan-300 transition-all duration-500"></div>
                    <div className="block w-8 duration-0 h-12 absolute left-0 bottom-0 rounded-full bg-green-200 transition-all duration-500"></div>
                    <div className="block group-hover:h-32 group-hover:w-32 w-12 duration-0 h-16 top-12 -right-8 absolute rounded-full bg-green-100 transition-all duration-500"></div>
                </div>



                <div className="w-[100.5%] h-full backdrop-blur-xl">
                    <div className="w-full shadow-[inset_5px_5px_16px_#21232b_,_inset_-6px_-6px_15px_#2d2f3a] group-hover:shadow-[inset_0px_0px_0px_#2d2f3a_,_inset_0px_0px_0px_#2d2f3a] group-hover:duration-200 duration-1000 transition-all pointer-events-none h-full bg-[#272932]/[33%] border-2 border-[#272932]/20 rounded-md leading-none p-1 flex flex-col justify-between">
                        <div>{card.value}<span dangerouslySetInnerHTML={{ __html: icon }}></span></div>
                        <div className="rotate-180">{card.value}<span dangerouslySetInnerHTML={{ __html: icon }}></span></div>
                    </div>
                </div>
            </div>
        </div>

    )
    }
    else if( dark && red){
        return(
        <div className="relative group flex w-full h-full items-center justify-center transition-all">                                                                                   
            <div className="w-full h-full text-white/50 relative rounded-md flex flex-col overflow-hidden transition-all shadow-[0px_0px_0px_#21232b,_0px_0px_0px_#2d2f3a] duration-500  hover:shadow-[5px_5px_16px_#21232b_,_-4px_-4px_15px_#2d2f3a]">

              
                <div >
                <div className="block group-hover:w-32 w-12 duration-0 h-8 absolute left-0 top-0 rounded-full bg-pink-300 transition-all duration-500"></div>
                <div className="block w-8 duration-0 h-12 absolute left-0 bottom-0 rounded-full bg-red-200 transition-all duration-500"></div>
                <div className="block group-hover:h-32 group-hover:w-32 w-12 duration-0 h-16 top-12 -right-2 absolute rounded-full bg-purple-200 transition-all duration-500"></div>
                </div>
                

                <div className="w-[100.5%] h-full backdrop-blur-xl">
                <div className="w-full shadow-[inset_5px_5px_16px_#21232b_,_inset_-6px_-6px_15px_#2d2f3a] group-hover:shadow-[inset_0px_0px_0px_#2d2f3a_,_inset_0px_0px_0px_#2d2f3a] group-hover:duration-200 duration-1000 transition-all pointer-events-none h-full bg-[#272932]/[33%] border-2 border-[#272932]/20 rounded-md leading-none p-1 flex flex-col justify-between">
                    <div>{card.value}<span dangerouslySetInnerHTML={{ __html: icon }}></span></div>
                    <div className="rotate-180">{card.value}<span dangerouslySetInnerHTML={{ __html: icon }}></span></div>
                </div>
                </div>
            </div>
        </div>)
    }
    else if(!dark && blue)
    return (
        <div className="relative group flex w-full h-full items-center justify-center transition-all">                                                                                  
            
    
            <div className="w-full h-full relative rounded-md flex flex-col overflow-hidden transition-all shadow-[px_0px_0px_#a4a4a4,_0px_0px_0px_#ffffff] duration-200 hover:shadow-[5px_5px_16px_#a4a4a4_,_-4px_-4px_15px_#ffffff] group-hover:-translate-y-px">

                <div>
                <div className="block group-hover:w-32 w-8 h-8 absolute left-0 top-0 rounded-full bg-sky-200 transition-all duration-[2000ms]"></div>
                <div className="block w-8 duration-0 h-12 absolute group-hover:h-16 left-0 bottom-0 rounded-full bg-cyan-200 transition-all duration-500"></div>
                <div className="block group-hover:h-32 group-hover:w-16 w-12 duration-0 h-16 top-12 -right-8 absolute rounded-full bg-blue-300 transition-all duration-[2000ms]"></div>
                </div>
                
                
                <div className="w-[100.5%] h-full backdrop-blur-xl">
                    <div className="w-full text-blue-950/50 group-hover:text-black shadow-[inset_5px_5px_16px_#cccccc_,_inset_-6px_-6px_15px_#ffffff] group-hover:shadow-[inset_0px_0px_0px_#ffffff_,_inset_0px_0px_0px_#ffffff] group-hover:duration-500 duration-1000 transition-all pointer-events-none h-full bg-white/[33%] border-2 border-white/20 rounded-md leading-none p-1 flex flex-col justify-between">
                    <div>{card.value}<span dangerouslySetInnerHTML={{ __html: icon }}></span></div>
                    <div className="rotate-180">{card.value}<span dangerouslySetInnerHTML={{ __html: icon }}></span></div>
                    </div>
                </div>
            </div>
        </div>

    )
    else if(!dark && red)
    return (
        <div className="relative group flex w-full h-full items-center justify-center transition-all">                                                                                  
            
    
            <div className="w-full h-full relative rounded-md flex flex-col overflow-hidden transition-all shadow-[px_0px_0px_#a4a4a4,_0px_0px_0px_#ffffff] duration-200 hover:shadow-[5px_5px_16px_#a4a4a4_,_-4px_-4px_15px_#ffffff] group-hover:-translate-y-px">

                <div>
                <div className="block group-hover:w-32 w-12 h-8 absolute left-0 top-0 rounded-full bg-pink-300 transition-all duration-[2000ms]"></div>
                <div className="block w-8 duration-0 h-12 absolute left-0 bottom-0 rounded-full bg-red-200 transition-all duration-500"></div>
                <div className="block group-hover:h-32 group-hover:w-32 w-12 duration-0 h-16 top-12 -right-2 absolute rounded-full bg-purple-200 transition-all duration-1000"></div>
                </div>
                
                <div className="w-[100.5%] h-full backdrop-blur-xl">
                    <div className="w-full text-rose-900/50 group-hover:text-black shadow-[inset_5px_5px_16px_#cccccc_,_inset_-6px_-6px_15px_#ffffff] group-hover:shadow-[inset_0px_0px_0px_#ffffff_,_inset_0px_0px_0px_#ffffff] group-hover:duration-500 duration-1000 transition-all pointer-events-none h-full bg-white/[33%] border-2 border-white/20 rounded-md leading-none p-1 flex flex-col justify-between">
                    <div>{card.value}<span dangerouslySetInnerHTML={{ __html: icon }}></span></div>
                    <div className="rotate-180">{card.value}<span dangerouslySetInnerHTML={{ __html: icon }}></span></div>
                    </div>
                </div>
            </div>
        </div>

    )
    else if(!dark)
        return(
            <div className="relative group flex w-full h-full items-center justify-center transition-all">                                                                                   
            
    
            <div className="w-full h-full relative rounded-md flex flex-col overflow-hidden transition-all shadow-[px_0px_0px_#a4a4a4,_0px_0px_0px_#ffffff] duration-200 hover:shadow-[5px_5px_16px_#a4a4a4_,_-4px_-4px_15px_#ffffff] group-hover:-translate-y-2">
 
                    <div className="w-full font-bold text-black/25 group-hover:text-black shadow-[inset_5px_5px_16px_#a4a4a4_,_inset_-12px_-12px_15px_#ffffff] group-hover:shadow-[inset_0px_0px_0px_#ffffff_,_inset_0px_0px_0px_#ffffff] group-hover:duration-200 duration-1000 transition-all pointer-events-none h-full bg-white/[33%] border-2 border-white/20 rounded-md leading-none flex flex-col justify-center items-center">
                    <div>{card?.value=='hidden'?'??':card?.suit}</div>

                </div>
            </div>
        </div>
        )


        return(   
            <div className="relative group flex w-full h-full items-center justify-center transition-all">                                                                                  
            <div className="w-full h-full text-white/50 relative rounded-md flex flex-col overflow-hidden transition-all shadow-[0px_0px_0px_#21232b,_0px_0px_0px_#2d2f3a] duration-500  hover:shadow-[5px_5px_16px_#21232b_,_-4px_-4px_15px_#2d2f3a]">
                <div className="w-full justify-center items-center font-bold shadow-[inset_5px_5px_16px_#21232b_,_inset_-6px_-6px_15px_#2d2f3a] group-hover:shadow-[inset_0px_0px_0px_#2d2f3a_,_inset_0px_0px_0px_#2d2f3a] group-hover:duration-200 duration-1000 transition-all pointer-events-none h-full bg-[#272932]/[33%] border-2 border-[#272932]/20 rounded-md leading-none p-1 flex flex-col">
                    <div>{card?.value=='hidden'?'??':card?.suit}</div>
                </div>
            </div>
        </div>
        )
}