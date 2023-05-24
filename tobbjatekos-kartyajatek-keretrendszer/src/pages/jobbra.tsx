export default function Jobbra() {


    return(<main>
        <div className="w-full h-full">

<div className="scrollera">
  <div className="scroller-contenta flex" id="scrollerContent">
    <div className="itema">Itema 1</div>
    <div className="itema">Itema 2</div>
    <div className="itema">Itema 3</div>
    <div className="itema">Itema 4</div>
    <div className="itema">Itema 5</div>
    <div className="itema">Itema 6</div>
    <div className="itema">Itema 7</div>
    <div className="itema">Itema 8</div>
    <div className="itema">Itema 9</div>
    <div className="itema">Itema 10</div>
  </div>
</div>
        </div>
        <style>
        {`
        .scrollera {
            overflow: auto;
            width: 10vw;
            display: flex;
            flex-direction: row-reverse;
            }
            
            .scrollera .scroller-contenta .itema {
              transform: translateZ(0); /* fixes a bug in Safari iOS where the scroller doesn't update */
            }`
            }
    </style>
    </main>
    )
}