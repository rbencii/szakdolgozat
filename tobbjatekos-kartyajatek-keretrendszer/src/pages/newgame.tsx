import { FormEvent } from "react";

export default function NewGame() {


    const handleButton = async (e: any) => {
        e.preventDefault();
        const body: any = {};
        [...e.target.elements].forEach((x:any)=>body[x.name as any]=x.value);
        console.log(body)

        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }

        let resp = await fetch(`api/game/newgame`, options);
        let obj = await resp.json();
        console.log(obj)

    }


    return (
        <main className="w-screen h-screen flex flex-col items-center bg-[#e0e0e0]" style={{height: '100svh'}}>
            <form onSubmit={handleButton}>
            <div className="flex flex-col gap-4 items-start">

                <div className="flex w-full gap-4">

                <div className="flex w-full flex-col">
                    Name
                    <input name="name" type="text w-full" />
                </div>

                <div className="flex w-full flex-col">
                    Max players
                    <select className="w-full" name="playercount" id="playercount">
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                </div>

                </div>

                

                <div className="flex gap-4">

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col">
                            Gamefields
                            <textarea name="gamefields" id="gamefields" cols={30} rows={4} defaultValue={'["table","-variable"]'}></textarea>
                        </div>

                        <div className="flex flex-col">
                            Playerfields
                            <textarea name="playerfields" id="playerfields" cols={30} rows={4} defaultValue={'["+hand","+buttons"]'}></textarea>
                        </div>
                    </div>
                    <div className="flex h-full flex-col">
                        Initial values
                        <textarea className="h-full" name="init" id="init" cols={30} rows={9} defaultValue={`{
  "gamefields": {
    "table": 104,
    "trash": 0,
    "-variable": 0
  },
  "playerfields": {
    "+hand": 5,
    "+buttons": [
      {
        "suit": "Pick up",
        "value": "2",
        "sorter": 1
      }
    ],
    "+handtop": 3,
    "-handbottom": 3
  }
}`}></textarea>
                    </div>
                </div>



                <div className="flex w-full gap-4 items-end">

                    <div className="flex w-full flex-col">
                    Deckcount
                    <select className="w-full" name="deckcount" id="deckcount">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>
                    </div>

                    <button type="submit" className="rounded-xl px-4 h-full bg-slate-300 border-2 border">
                        Create
                    </button>

                </div>


            </div>
            </form>
        </main>
    )
}