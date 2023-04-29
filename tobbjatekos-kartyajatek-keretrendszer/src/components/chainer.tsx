import { Ruletype } from "./rule";


export default function Chainer({ rules, games_id, newChain, refresh }: { rules: Ruletype[], games_id: number, newChain: (chain: any) => void, refresh: CallableFunction }){

    const handleSubmit = async (e:any) => {
        e.preventDefault();
        const { chain_start, chain_end, or_bool } = e.target.elements;
        console.log(chain_start.value, chain_end.value, or_bool.checked)
            const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ games_id, chain_start: parseInt(chain_start.value), chain_end: parseInt(chain_end.value), or_bool: or_bool.checked })
            }

            let resp = await fetch(`api/game/addchain`, options);
            let obj = await resp.json();
            if(obj?.data){
                newChain(obj.data)
            }
         
    }

    return (
        <form onSubmit={(e)=>handleSubmit(e)}>
        <div className="flex flex-col gap-2 items-center justify-center">
            <h1>New Chain <span onClick={()=>refresh()}>R</span></h1>
            <div className="flex flex-row gap-2 items-center justify-center">
                <select name="chain_start" id="chain_start" defaultValue={""}>
                    <option value="">Start</option>
                    {rules.map((rule, i)=>{return <option key={i} value={rule.id}>{rule.name}</option>})}
                    
                </select>

                <select name="chain_end" id="chain_end" defaultValue={""}>
                    <option value="">End</option>
                    {rules.map((rule, i)=>{return <option key={i} value={rule.id}>{rule.name}</option>})}
                </select>
            </div>
            <input type="checkbox" name="or_bool" id="or_bool" /> OR_BOOL
            <button type="submit"> add chain</button>
        </div>
        </form>
    )
}