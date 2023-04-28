import { useState } from "react";

export interface Ruletype {
    "id": number,
    "name": string,
    "operator": string,
    "left_player": number | null,
    "left_value": number | null,
    "left_field": number | null,
    "right_player": number | null,
    "right_value": number | null,
    "right_field": number | null,
    "required": boolean,
    "or_bool": boolean,
    "actions": any
}

export default function Rule({ rules, game_id, duplicate }: { rules: Ruletype, game_id: number, duplicate: CallableFunction }) {
    const [rulesState, setRulesState] = useState<Ruletype>(rules);
    let { id, required, operator, left_field, right_field, left_player, right_player, right_value, left_value, actions, or_bool, name } = rulesState;
    const lcard = left_field===null;
    const lpfcv = (left_field !== null && left_value !== null)
    const lpfc = (left_field !== null && left_value === null)
    const lorigin = left_player===null;

    const rpfcv =(right_field !== null && right_value !== null && right_player !== null)
    const rgfcv =(right_field !== null && right_player === null && right_value !== null)
    const rpfc =(right_field !== null && right_value === null && right_player !== null)
    const rgfc=(right_field !== null && right_player === null && right_value === null)
    const rv =(right_field === null && right_player === null && right_value !== null)
    const rinit = (right_field === null && right_player === null && right_value === null)
    const rpf = lorigin;

    const lapf = actions?.left_field !== null && actions?.left_player !== null;
    const rapf = actions?.right_field !== null && actions?.right_player !== null;
    const ragf = actions?.right_field !== null && actions?.right_player === null;

    const getLeftValue = ()=>{
        if(id===-1) return '';
        if(lorigin) return 'origin';
        if(lcard) return 'card';
        if(lpfcv) return 'pfcv';
        if(lpfc) return 'pfc';
        

        return '';
    }

    const getRightValue = ()=>{
        if(id===-1) return '';
        if(rpf) return 'pf';
        if(rpfcv) return 'pfcv';
        if(rgfcv) return 'gfcv';
        if(rpfc) return 'pfc';
        if(rgfc) return 'gfc';
        if(rv) return 'v';
        if(rinit) return 'init';
        

        return '';
    }


    const handleLSelect = (e: any) => {
        const value = e.target.value;
        switch(value){
            case 'card':
                left_field = null;
                left_value = null;
                left_player = 0;
                break;
            case 'pfcv':
                left_field = 0;
                left_value = 0;
                left_player = 0;
                break;
            case 'pfc':
                left_field = 0;
                left_value = null;
                left_player = 0;
                break;
            case 'origin':
                left_field = null;
                left_value = null;
                left_player = null;
                right_field = 0;
                break;
            default:
                break;
        
            }
            setRulesState((prev)=>({...prev, left_field, left_value, left_player, right_field}));
    }

    const handleRSelect = (e: any) => {
        const value = e.target.value;
        switch(value){
            case 'pfcv':
                right_field = 0;
                right_value = 0;
                right_player = 0;
                break;
            case 'gfcv':
                right_field = 0;
                right_value = 0;
                right_player = null;
                break;
            case 'pfc':
                right_field = 0;
                right_value = null;
                right_player = 0;
                break;
            case 'gfc':
                right_field = 0;
                right_value = null;
                right_player = null;
                break;
            case 'v':
                right_field = null;
                right_value = 0;
                right_player = null;
                break;
            case 'init':
                right_field = null;
                right_value = null;
                right_player = null;
                left_field=0;
                break;
            case 'pf':
                right_field = 0;
                right_value = null;
                right_player = null;
                left_player=null;
                break;
            default:
                break;

        }

        setRulesState((prev)=>({...prev, right_field, right_value, right_player, left_player, left_field}));
    }

    const handleInput=(e: any) => {
        // setRulesState((prev)=>({...prev, [e.target.id]: e.target.value===""?null:e.target.value}));
        setRulesState((prev)=>({...prev, [e.target.id]: e.target.value}));
    }

    const handleActionInput=(e: any) => {
        const newid = e.target.id.split('.')?.[1];
        // setRulesState((prev)=>({...prev, actions: {...prev.actions, [newid]: e.target.value===""?null:e.target.value}}));
        setRulesState((prev)=>({...prev, actions: {...prev.actions, [newid]: e.target.value}}));
    }

    const handleCheckbox=(e: any) => {
        setRulesState((prev)=>({...prev, [e.target.id]: e.target.checked}));
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        //console.log(Array.from(e.target.elements).map((x:any)=>{return {id: x.id, value: x.value}}))
        let rulesStateMapped: any = {};
        for (let key in rulesState) {
            if (rulesState.hasOwnProperty(key)) {
              rulesStateMapped[key] = (rulesState as any)[key]===""?null:(rulesState as any)[key];
            }
          }
        if(rulesState.actions!==null){
            rulesStateMapped.actions = {};
            for (let key in rulesState.actions){
                if (rulesState.actions.hasOwnProperty(key)) {
                    rulesStateMapped.actions[key] = (rulesState.actions as any)[key]===""?null:(rulesState.actions as any)[key];
                }
            }
        }
        console.log(rulesStateMapped)
        const res = await fetch('/api/game/setrules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({rules:rulesStateMapped, game_id})
        });
        const data = await res.json();
        if(data.error===null && data.rules!==null)
        setRulesState((prev)=>({...prev, id: data.rules.id}));
    }

    return (
        <form onSubmit={(e)=>handleSubmit(e)}>
        <div className="flex flex-col items-center justify-center border" style={(!required??true)?{borderColor: 'rgb(129 140 248)'}:{borderColor: 'rgb(251 191 36)'}}>
            <div>{or_bool ? 'OR' : 'AND'}
                <input type="checkbox" name="or_bool" id="or_bool" onChange={handleCheckbox} checked={or_bool} />
            </div>
            {/* <input className="text-center" type="text" id="id" onChange={handleInput} value={id} /> */}
            <input className="text-center" type="text" id="name" onChange={handleInput} value={name??''} />
            <div>{required ? 'required' : 'effect'}
                <input type="checkbox" name="required" id="required" onChange={handleCheckbox} checked={required} />
            </div>
            <div className="flex items-center justify-center gap-4">
                <select onChange={(e)=>handleLSelect(e)} className="border" name="left" id="lselect" defaultValue={getLeftValue()}>
                    <option value="">left operand</option>
                    <option value="card">placed card</option>
                    <option value="pfcv">playerfield card value</option>
                    <option value="pfc">playerfield count</option>
                    <option value="origin">card origin</option>
                </select>
                <select className="border" name="operator" id="operator" onChange={handleInput} value={operator}>
                    <option className="text-center" value="">operator</option>
                    <option className="text-center" value="==">==</option>
                    <option className="text-center" value=">=">{'>='}</option>
                    <option className="text-center" value="<=">{'<='}</option>
                    <option className="text-center" value=">">{'>'}</option>
                    <option className="text-center" value="<">{'<'}</option>
                    <option className="text-center" value="!=">{'!='}</option>
                </select>
                <select onChange={(e)=>handleRSelect(e)} className="border" name="right" id="rselect" defaultValue={getRightValue()}>
                    <option value="">right operand</option>
                    <option value="pfcv">playerfield card value</option>
                    <option value="gfcv">gamefield card value from top</option>
                    <option value="pfc">playerfield count</option>
                    <option value="gfc">gamefield count</option>
                    <option value="v">value</option>
                    <option value="init">init</option>
                    <option value="pf">playerfield</option>
                </select>
            </div>
            <div className="flex items-center justify-center gap-4">
               
                <div className="flex flex-col items-center justify-center" style={left_player===null?{display: 'none'}:{}}>
                    <div>left player</div>
                    <input className="text-center border" type="text" id="left_player" onChange={handleInput} value={left_player??''}  />
                </div>
                

                <div className="flex flex-col items-center justify-center" style={left_field===null?{display: 'none'}:{}}>
                    <div>left field</div>
                    <input className="text-center border" type="text" id="left_field" onChange={handleInput} value={left_field??''}  />
                </div>


                <div className="flex flex-col items-center justify-center" style={left_value===null?{display: 'none'}:{}}>
                    <div>left value</div>
                    <input className="text-center border" type="text" id="left_value" onChange={handleInput} value={left_value??''}  />
                </div>



                <div className="flex flex-col items-center justify-center" style={right_player===null?{display: 'none'}:{}}>
                    <div>right player</div>
                    <input className="text-center border" type="text" id="right_player" onChange={handleInput} value={right_player??''}  />
                </div>


                <div className="flex flex-col items-center justify-center" style={right_field===null?{display: 'none'}:{}}>
                    <div>right field</div>
                    <input className="text-center border" type="text" id="right_field" onChange={handleInput} value={right_field??''}  />
                </div>


                <div className="flex flex-col items-center justify-center" style={right_value===null?{display: 'none'}:{}}>
                    <div>right value</div>
                    <input className="text-center border" type="text" id="right_value" onChange={handleInput} value={right_value??''}  />
                </div>

            </div>
            {actions===null && <button onClick={()=>setRulesState((prev)=>({...prev, actions: {id:-1}}))}>add actions</button>}
            {actions!==null&& <>
            <div>
                actions
            </div>
            <div className="flex items-center justify-center gap-1.5">
                {/* <div className="flex flex-col items-center justify-center">
                    <div>action_id</div>
                    <input className="text-center border w-16" type="text" id="actions.id" onChange={handleActionInput} value={actions?.id??''} />
                </div> */}
                <div className="flex flex-col items-center justify-center">
                    <div>action</div>
                    <input className="text-center border w-16" type="text" id="actions.action" onChange={handleActionInput} value={actions?.action??''} />
                </div>
                <div className="flex flex-col items-center justify-center">
                    <div>left player</div>
                    <input className="text-center border w-16" type="text" id="actions.left_player" onChange={handleActionInput} value={actions?.left_player??''} />
                </div>
                <div className="flex flex-col items-center justify-center">
                    <div>left field</div>
                    <input className="text-center border w-16" type="text" id="actions.left_field" onChange={handleActionInput} value={actions?.left_field??''} />
                    </div>
                <div className="flex flex-col items-center justify-center">
                    <div>left value</div>
                    <input className="text-center border w-16" type="text" id="actions.left_value" onChange={handleActionInput} value={actions?.left_value??''} />
                    </div>

                <div className="flex flex-col items-center justify-center">
                    <div>right player</div>
                    <input className="text-center border w-16" type="text" id="actions.right_player" onChange={handleActionInput} value={actions?.right_player??''} />
                    </div>
                
                <div className="flex flex-col items-center justify-center">

                    <div>right field</div>
                    <input className="text-center border w-16" type="text" id="actions.right_field" onChange={handleActionInput} value={actions?.right_field??''} />
                    </div>

                <div className="flex flex-col items-center justify-center">
                    <div>right value</div>
                    <input className="text-center border w-16" type="text" id="actions.right_value" onChange={handleActionInput} value={actions?.right_value??''} />
                    </div>

                    <div className="flex flex-col items-center justify-center">
                    <div>number</div>
                    <input className="text-center border w-16" type="text" id="actions.number" onChange={handleActionInput} value={actions?.number??''} />
                    </div>

                    <div className="flex flex-col items-center justify-center">
                    <div>operator</div>
                    <input className="text-center border w-16" type="text" id="actions.operator" onChange={handleActionInput} value={actions?.operator??''} />
                    </div>

                    <div className="flex flex-col items-center justify-center">
                    <div>round attr</div>
                    <input className="text-center border w-16" type="text" id="actions.round_attr" onChange={handleActionInput} value={actions?.round_attr??''} />
                    </div>


            </div>
            </>
            }
           
        </div>
        <button type="submit">save</button>
        <div className="cursor-pointer flex w-fit" onClick={()=>duplicate(rulesState)}>duplicate</div>
        </form>
    )
}