export default function MenuButton({text}: {text: string}){



    return(
        <div className="relative group flex w-full h-full items-center justify-center transition-all">                                                                                   {/* #21232b      #2d2f3a   (Xa4a4a4, Xffffff) */}


                  <div className="w-full h-full relative rounded-md flex flex-col overflow-hidden transition-all shadow-[px_0px_0px_#a4a4a4,_0px_0px_0px_#ffffff] duration-200 hover:shadow-[5px_5px_16px_#a4a4a4_,_-4px_-4px_15px_#ffffff] group-hover:-translate-y-px">

                    <div>
                      <div className="block group-hover:w-64 w-8 h-8 absolute -left-4 top-0 delay-200 rounded-full bg-sky-200 transition-all duration-[1000ms]"></div>
                      <div className="block w-8 duration-0 h-16 absolute group-hover:w-64 delay-200 group-hover:h-16 -left-4 bottom-0 rounded-full bg-cyan-200 transition-all duration-200"></div>
                      <div className="block group-hover:top-2  group-hover:h-64 group-hover:w-64 delay-200 w-16 duration-0 h-16 top-12 -right-8 absolute rounded-full bg-pink-200 transition-all duration-[1000ms]"></div>
                      <div className="block group-hover:h-16 group-hover:w-64 w-4 duration-0 h-4 -top-4 delay-200 -right-4 absolute rounded-full bg-purple-200 transition-all duration-[1000ms]"></div>
                    </div>


                    <div className="w-[100.5%] h-full backdrop-blur-xl">
                      <div className="w-full text-blue-950/60 group-hover:text-blue-950 shadow-[inset_5px_5px_16px_#cccccc_,_inset_-6px_-6px_15px_#ffffff] group-hover:shadow-[inset_0px_0px_0px_#ffffff_,_inset_0px_0px_0px_#ffffff] group-hover:duration-500 duration-1000 transition-all pointer-events-none h-full bg-white/[33%] border-2 border-white/20 rounded-md leading-none p-1 flex flex-col justify-center items-center">
                        <div className='text-xl'>{text}</div>

                      </div>
                    </div>
                  </div>
                </div>
    )
}