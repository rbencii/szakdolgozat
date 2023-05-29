import { useEffect, useRef, useState } from "react";

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
    "exclusive": number | null,
    "left": string,
    "right": string,
    "actions": any
}

export default function Rule({ rules, game_id, duplicate, playerfields, gamefields }: { rules: Ruletype, game_id: number, duplicate: CallableFunction, playerfields: string[], gamefields: string[] }) {
    const [rulesState, setRulesState] = useState<Ruletype>(rules);

    let { id, required, operator, left_field, right_field, left_player, right_player, right_value, left_value, actions, or_bool, name, exclusive, left, right } = rulesState;

    const handleLSelect = (e: any) => {
        const value = e.target.value;

        switch (value) {
            case 'pfi': //playerfield index
                left_field = 0;
                left_player = 0;
                left_value = null;
                break;
            case 'next': //playerfield index
                left_field = null;
                left_player = null;
                left_value = null;
                break;
            case 'gfi': //gamefield index
                left_field = 0;
                left_player = 0;
                left_value = null;
                break;
            case 'cardidx': //placed card index
                left_field = null;
                left_player = 0;
                left_value = null;
                break;
            case 'cv': //placed card value
                left_field = null;
                left_value = null;
                left_player = null;
                break;
            case 'cs': //placed card suit
                left_field = null;
                left_value = null;
                left_player = null;
                break;
            case 'initpf': //init playerfield
                left_field = 0;
                left_value = null;
                left_player = null;
                break;
            case 'initgf': //init gamefield
                left_field = 0;
                left_value = null;
                left_player = null;
                break;
            case 'origin': //card origin index
                left_field = null;
                left_value = null;
                left_player = null;
                break;
            case 'originpf': //card origin field
                left_field = null;
                left_value = null;
                left_player = 0;
                break;
            case 'pfcv': //playerfield card value
                left_field = 0;
                left_value = 0;
                left_player = 0;
                break;
            case 'pfcs': //playerfield card suit
                left_field = 0;
                left_value = 0;
                left_player = 0;
                break;
            case 'pfc': //playerfield card count
                left_field = 0;
                left_value = null;
                left_player = 0;
                break;
            case 'gfcv': //gamefield card value
                left_field = 0;
                left_value = 0;
                left_player = 0;
                break;
            case 'gfcs': //gamefield card suit
                left_field = 0;
                left_value = 0;
                left_player = 0;
                break;
            case 'gfc': //gamefield card count
                left_field = 0;
                left_value = null;
                left_player = 0;
                break;
            case 'pf': //playerfield
                left_field = 0;
                left_value = null;
                left_player = 0;
                break;
            case 'gf': //gamefield
                left_field = 0;
                left_value = null;
                left_player = 0;
                break;
            case 'value': //value
                left_field = null;
                left_value = 0;
                left_player = null;
                break;

        }


        setRulesState((prev) => ({ ...prev, left_field, left_value, left_player, left: value }));
    }

    const handleRSelect = (e: any) => {
        const value = e.target.value;

        switch (value) {
            case 'pfi': //playerfield index
                right_field = 0;
                right_player = 0;
                right_value = null;
                break;
            case 'gfi': //gamefield index
                right_field = 0;
                right_player = 0;
                right_value = null;
                break;
            case 'cardidx': //placed card index
                right_field = null;
                right_player = 0;
                right_value = null;
                break;
            case 'cv': //placed card value
                right_field = null;
                right_value = null;
                right_player = null;
                break;
            case 'cs': //placed card suit
                right_field = null;
                right_value = null;
                right_player = null;
                break;
            case 'initpf': //init playerfield
                right_field = 0;
                right_value = null;
                right_player = null;
                break;
            case 'initgf': //init gamefield
                right_field = 0;
                right_value = null;
                right_player = null;
                break;
            case 'origin': //card origin index
                right_field = null;
                right_value = null;
                right_player = null;
                break;
            case 'originpf': //card origin field
                right_field = null;
                right_value = null;
                right_player = 0;
                break;
            case 'pfcv': //playerfield card value
                right_field = 0;
                right_value = 0;
                right_player = 0;
                break;
            case 'pfcs': //playerfield card suit
                right_field = 0;
                right_value = 0;
                right_player = 0;
                break;
            case 'pfc': //playerfield card count
                right_field = 0;
                right_value = null;
                right_player = 0;
                break;
            case 'gfcv': //gamefield card value
                right_field = 0;
                right_value = 0;
                right_player = 0;
                break;
            case 'gfcs': //gamefield card suit
                right_field = 0;
                right_value = 0;
                right_player = 0;
                break;
            case 'gfc': //gamefield card count
                right_field = 0;
                right_value = null;
                right_player = 0;
                break;
            case 'pf': //playerfield
                right_field = 0;
                right_value = null;
                right_player = 0;
                break;
            case 'gf': //gamefield
                right_field = 0;
                right_value = null;
                right_player = 0;
                break;
            case 'value': //value
                right_field = null;
                right_value = 0;
                right_player = null;
                break;

        }

        setRulesState((prev) => ({ ...prev, right_field, right_value, right_player, right: value }));
    }

    const handleActionLSelect = (e: any) => {
        const value = e.target.value;

        switch (value) {
            case 'cv': //placed card value
                actions.left_field = null;
                actions.left_value = null;
                actions.left_player = null;
                break;
            case 'cs': //placed card suit
                actions.left_field = null;
                actions.left_value = null;
                actions.left_player = null;
                break;
            case 'initpf': //init playerfield
                actions.left_field = 0;
                actions.left_value = null;
                actions.left_player = null;
                break;
            case 'initgf': //init gamefield
                actions.left_field = 0;
                actions.left_value = null;
                actions.left_player = null;
                break;
            case 'origin': //card origin index
                actions.left_field = null;
                actions.left_value = null;
                actions.left_player = null;
                break;
            case 'originpf': //card origin field
                actions.left_field = null;
                actions.left_value = null;
                actions.left_player = 0;
                break;
            case 'pfcv': //playerfield card value
                actions.left_field = 0;
                actions.left_value = 0;
                actions.left_player = 0;
                break;
            case 'pfcs': //playerfield card suit
                actions.left_field = 0;
                actions.left_value = 0;
                actions.left_player = 0;
                break;
            case 'pfc': //playerfield card count
                actions.left_field = 0;
                actions.left_value = null;
                actions.left_player = 0;
                break;
            case 'gfcv': //gamefield card value
                actions.left_field = 0;
                actions.left_value = 0;
                actions.left_player = 0;
                break;
            case 'gfcs': //gamefield card suit
                actions.left_field = 0;
                actions.left_value = 0;
                actions.left_player = 0;
                break;
            case 'gfc': //gamefield card count
                actions.left_field = 0;
                actions.left_value = null;
                actions.left_player = 0;
                break;
            case 'pf': //playerfield
                actions.left_field = 0;
                actions.left_value = null;
                actions.left_player = 0;
                break;
            case 'gf': //gamefield
                actions.left_field = 0;
                actions.left_value = null;
                actions.left_player = 0;
                break;
            case 'value': //value
                actions.left_field = null;
                actions.left_value = 0;
                actions.left_player = null;
                break;

        }


        setRulesState((prev) => ({ ...prev, actions: { ...prev.actions, left_field: actions.left_field, left_value: actions.left_value, left_player: actions.left_player, left: value } }));
    }

    const handleActionRSelect = (e: any) => {
        const value = e.target.value;

        switch (value) {
            case 'cv': //placed card value
                actions.right_field = null;
                actions.right_value = null;
                actions.right_player = null;
                break;
            case 'cs': //placed card suit
                actions.right_field = null;
                actions.right_value = null;
                actions.right_player = null;
                break;
            case 'initpf': //init playerfield
                actions.right_field = 0;
                actions.right_value = null;
                actions.right_player = null;
                break;
            case 'initgf': //init gamefield
                actions.right_field = 0;
                actions.right_value = null;
                actions.right_player = null;
                break;
            case 'origin': //card origin index
                actions.right_field = null;
                actions.right_value = null;
                actions.right_player = null;
                break;
            case 'originpf': //card origin field
                actions.right_field = null;
                actions.right_value = null;
                actions.right_player = 0;
                break;
            case 'pfcv': //playerfield card value
                actions.right_field = 0;
                actions.right_value = 0;
                actions.right_player = 0;
                break;
            case 'pfcs': //playerfield card suit
                actions.right_field = 0;
                actions.right_value = 0;
                actions.right_player = 0;
                break;
            case 'pfc': //playerfield card count
                actions.right_field = 0;
                actions.right_value = null;
                actions.right_player = 0;
                break;
            case 'gfcv': //gamefield card value
                actions.right_field = 0;
                actions.right_value = 0;
                actions.right_player = 0;
                break;
            case 'gfcs': //gamefield card suit
                actions.right_field = 0;
                actions.right_value = 0;
                actions.right_player = 0;
                break;
            case 'gfc': //gamefield card count
                actions.right_field = 0;
                actions.right_value = null;
                actions.right_player = 0;
                break;
            case 'pf': //playerfield
                actions.right_field = 0;
                actions.right_value = null;
                actions.right_player = 0;
                break;
            case 'gf': //gamefield
                actions.right_field = 0;
                actions.right_value = null;
                actions.right_player = 0;
                break;
            case 'value': //value
                actions.right_field = null;
                actions.right_value = 0;
                actions.right_player = null;
                break;

        }

        setRulesState((prev) => ({ ...prev, actions: { ...prev.actions, right_field: actions.right_field, right_value: actions.right_value, right_player: actions.right_player, right: value } }));
    }

    const handleInput = (e: any) => {
        setRulesState((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    }

    const handleActionInput = (e: any) => {
        const newid = e.target.id.split('.')?.[1];
        setRulesState((prev) => ({ ...prev, actions: { ...prev.actions, [newid]: e.target.value } }));
    }

    const handleCheckbox = (e: any) => {
        setRulesState((prev) => ({ ...prev, [e.target.id]: e.target.checked }));
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        let rulesStateMapped: any = {};
        for (let key in rulesState) {
            if (rulesState.hasOwnProperty(key)) {
                rulesStateMapped[key] = (rulesState as any)[key] === "" ? null : (rulesState as any)[key];
            }
        }
        if (rulesState.actions !== null) {
            rulesStateMapped.actions = {};
            for (let key in rulesState.actions) {
                if (rulesState.actions.hasOwnProperty(key)) {
                    rulesStateMapped.actions[key] = (rulesState.actions as any)[key] === "" ? null : (rulesState.actions as any)[key];
                }
            }
        }

        const res = await fetch('/api/game/setrules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rules: rulesStateMapped, game_id })
        });
        const data = await res.json();
        if (data.error === null && data.rules !== null)
            setRulesState((prev) => ({ ...prev, id: data.rules.id, actions: data.rules.action_id ? { ...prev.actions, id: data.rules.action_id } : null }));
        console.log(data)
    }

    const removeRule = async () => {

        const res = await fetch('/api/game/removerule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rule_id: rulesState.id, game_id })
        });

    }

    return (
        <form className="ml-auto mr-auto" onSubmit={(e) => handleSubmit(e)}>
            <div className="flex flex-col items-center justify-center border" style={(!required ?? true) ? { borderColor: 'rgb(129 140 248)' } : { borderColor: 'rgb(251 191 36)' }}>
                <div>{or_bool ? 'OR' : 'AND'}
                    <input type="checkbox" name="or_bool" id="or_bool" onChange={handleCheckbox} checked={or_bool} />
                </div>
                <input className="text-center border" type="text" id="id" onChange={handleInput} value={id} />
                <input className="text-center border" type="text" id="name" onChange={handleInput} value={name ?? ''} />
                <div>{required ? 'required' : 'effect'}
                    <input type="checkbox" name="required" id="required" onChange={handleCheckbox} checked={required} />
                </div>

                {!required && <div>
                    <select name="exclusive" id="exclusive" className="border text-center" onChange={handleInput} value={exclusive ?? '0'}>
                        <option value="0">ONLY IF NOT FAIL</option>
                        <option value="1">ALWAYS</option>
                    </select>
                </div>}


                <div className="flex gap-6">
                    <select name="left" id="left" className="border text-center" onChange={handleLSelect} value={left ?? ''}>
                        <option value="">Left operand</option>
                        <option value="cv">Placed card value</option>
                        <option value="cs">Placed card suit</option>
                        <option value="initpf">Init playerfield</option>
                        <option value="initgf">Init gamefield</option>
                        <option value="origin">Card origin index</option>
                        <option value="originpf">Card origin field</option>
                        <option value="pfcv">Playerfield card value</option>
                        <option value="pfcs">Playerfield card suit</option>
                        <option value="pfc">Playerfield cardcount</option>
                        <option value="gfcv">Gamefield card value</option>
                        <option value="gfcs">Gamefield card suit</option>
                        <option value="gfc">Gamefield cardcount</option>
                        <option value="pf">Playerfield</option>
                        <option value="pfi">Playerfield index</option>
                        <option value="gf">Gamefield</option>
                        <option value="gfi">Gamefield index</option>
                        <option value="cardidx">Placed card position</option>
                        <option value="value">Value</option>
                        <option value="next">next</option>
                    </select>

                    <select name="operator" id="operator" className="border text-center" onChange={handleInput} value={operator ?? ''}>
                        <option value="">Operator</option>
                        <option value="==">{'=='}</option>
                        <option value="!=">{'!='}</option>
                        <option value=">=">{'>='}</option>
                        <option value="<=">{'<='}</option>
                        <option value=">">{'>'}</option>
                        <option value="<">{'<'}</option>
                        <option value="r_count_in_l">{'Number of Right (Single) in Left (Multiple) == lv'}</option>
                        <option value="r_count_in_l_ge">{'Number of Right (Single) in Left (Multiple) >= lv'}</option>
                        <option value="r_count_in_l_le">{'Number of Right (Single) in Left (Multiple) <= lv'}</option>
                        <option value="l_f_has_r">{'Left (Multiple) has Right (Single)'}</option>

                    </select>

                    <select name="right" id="right" className="border text-center" onChange={handleRSelect} value={right ?? ''}>
                        <option value="">Right operand</option>
                        <option value="cv">Placed card value</option>
                        <option value="cs">Placed card suit</option>
                        <option value="initpf">Init playerfield</option>
                        <option value="initgf">Init gamefield</option>
                        <option value="origin">Card origin index</option>
                        <option value="originpf">Card origin field</option>
                        <option value="pfcv">Playerfield card value</option>
                        <option value="pfcs">Playerfield card suit</option>
                        <option value="pfc">Playerfield cardcount</option>
                        <option value="gfcv">Gamefield card value</option>
                        <option value="gfcs">Gamefield card suit</option>
                        <option value="gfc">Gamefield cardcount</option>
                        <option value="pf">Playerfield</option>
                        <option value="pfi">Playerfield index</option>
                        <option value="gf">Gamefield</option>
                        <option value="gfi">Gamefield index</option>
                        <option value="cardidx">Placed card position</option>
                        <option value="value">Value</option>
                    </select>
                </div>

                <div className="flex items-center justify-center gap-4">


                    <div className="flex flex-col items-center justify-center" style={left_player === null ? { opacity: '20%' } : {}}>
                        {!left?.includes('gf') && <>
                            <div>Left player</div>
                            <input className="text-center border" type="text" id="left_player" onChange={handleInput} value={left_player ?? ''} /></>
                        }
                        {left?.includes('gf') &&
                            <select className="border text-center" name="left_player" id="left_player" onChange={handleInput} value={left_player ?? ''}>
                                <option value="">from</option>
                                <option value="0">Tabletop</option>
                                <option value="1">Deck</option>
                            </select>}
                    </div>


                    <div className="flex flex-col items-center justify-center" style={left_field === null ? { opacity: '20%' } : {}}>

                        <select className="border text-center" name="left_field" id="left_field" onChange={handleInput} value={left_field ?? ''}>
                            <option value="">Left field</option>
                            {left?.includes('gf') && gamefields && gamefields.map((field, index) => {
                                return <option key={index} value={index}>{field}</option>
                            })
                            }
                            {left?.includes('pf') && playerfields && playerfields.map((field, index) => {
                                return <option key={index} value={index}>{field}</option>
                            })
                            }
                        </select>
                    </div>


                    <div className="flex flex-col items-center justify-center" style={left_value === null ? { opacity: '20%' } : {}}>
                        <div>{{ gfcv: 'From top', pfcv: 'Index', gfcs: 'From top', pfcs: 'Index' }[left] || 'Left value'}</div>
                        <input className="text-center border" type="text" id="left_value" onChange={handleInput} value={left_value ?? ''} />
                    </div>



                    <div className="flex flex-col items-center justify-center" style={right_player === null ? { opacity: '20%' } : {}}>
                        {!right?.includes('gf') && <>
                            <div>Right player</div>
                            <input className="text-center border" type="text" id="right_player" onChange={handleInput} value={right_player ?? ''} /></>
                        }
                        {right?.includes('gf') &&
                            <select className="border text-center" name="right_player" id="right_player" onChange={handleInput} value={right_player ?? ''}>
                                <option value="">from</option>
                                <option value="0">Tabletop</option>
                                <option value="1">Deck</option>
                            </select>}
                    </div>


                    <div className="flex flex-col items-center justify-center" style={right_field === null ? { opacity: '20%' } : {}}>

                        <select className="border text-center" name="right_field" id="right_field" onChange={handleInput} value={right_field ?? ''}>
                            <option value="">Right field</option>
                            {right?.includes('gf') && gamefields && gamefields.map((field, index) => {
                                return <option key={index} value={index}>{field}</option>
                            })
                            }
                            {right?.includes('pf') && playerfields && playerfields.map((field, index) => {
                                return <option key={index} value={index}>{field}</option>
                            })
                            }
                        </select>
                    </div>


                    <div className="flex flex-col items-center justify-center" style={right_value === null ? { opacity: '20%' } : {}}>
                        <div>{{ gfcv: 'From top', pfcv: 'Index', gfcs: 'From top', pfcs: 'Index' }[right] || 'Right value'}</div>
                        <input className="text-center border" type="text" id="right_value" onChange={handleInput} value={right_value ?? ''} />
                    </div>

                </div>
                {actions === null && <button onClick={() => setRulesState((prev) => ({ ...prev, actions: { id: -1 } }))}>add actions</button>}
                {actions !== null && <>
                    <div className="flex flex items-center justify-center">
                        <input className="border text-center w-8" type="text" id="actions.id" onChange={handleActionInput} value={actions?.id ?? ''} />
                        actions
                    </div>
                    <select name="actions.action_type" id="actions.action_type" className="border text-center" onChange={handleActionInput} value={actions?.action_type ?? ''}>
                        <option value="">ActionType (Reset Chain)</option>
                        <option value="-1">On Fail Do action</option>
                        <option value="0">Always Fail</option>
                        <option value="1">Do action if True Chain</option>
                        <option value="2">(Do action and Don't place card) if True Chain</option>
                    </select>
                    <div className="flex gap-6 mt-2">

                        <select name="actions.left" id="actions.left" className="border text-center" onChange={handleActionInput} value={actions?.left ?? ''}>
                            <option value="">Left operand</option>
                            <option value="cv">Placed card value</option>
                            <option value="cs">Placed card suit</option>
                            <option value="initpf">Init playerfield</option>
                            <option value="initgf">Init gamefield</option>
                            <option value="origin">Card origin index</option>
                            <option value="originpf">Card origin field</option>
                            <option value="pfcv">Playerfield card value</option>
                            <option value="pfcs">Playerfield card suit</option>
                            <option value="pfc">Playerfield cardcount</option>
                            <option value="gfcv">Gamefield card value</option>
                            <option value="gfcs">Gamefield card suit</option>
                            <option value="gfc">Gamefield cardcount</option>
                            <option value="pf">Playerfield</option>
                            <option value="pfi">Playerfield index</option>
                            <option value="gf">Gamefield</option>
                            <option value="gfi">Gamefield index</option>
                            <option value="cardidx">Placed card position</option>
                            <option value="value">Value</option>
                        </select>

                        <select name="actions.action" id="actions.action" className="border text-center" onChange={handleActionInput} value={actions?.action ?? ''}>
                            <option value="">Action</option>
                            <option value="fill_l_from_r">Fill Left from Right</option>
                            <option value="move_lv_l_to_r">Move X from Left to Right</option>
                            <option value="next">Next Player</option>
                            <option value="setcard">Set Left Card to Right</option>
                            <option value="setvalue">Set Left Card Value to Right</option>
                            <option value="setsuit">Set Left Card Suit to Right</option>
                            <option value="dir">Set Round Direction to Right</option>
                            <option value="breakchain">Break Chain</option>
                            <option value="continuechain">Continue Chain</option>
                            <option value="win">Winner is Right Value</option>
                        </select>

                        <select name="actions.right" id="actions.right" className="border text-center" onChange={handleActionInput} value={actions?.right ?? ''}>
                            <option value="">Right operand</option>
                            <option value="cv">Placed card value</option>
                            <option value="cs">Placed card suit</option>
                            <option value="initpf">Init playerfield</option>
                            <option value="initgf">Init gamefield</option>
                            <option value="origin">Card origin index</option>
                            <option value="originpf">Card origin field</option>
                            <option value="pfcv">Playerfield card value</option>
                            <option value="pfcs">Playerfield card suit</option>
                            <option value="pfc">Playerfield cardcount</option>
                            <option value="gfcv">Gamefield card value</option>
                            <option value="gfcs">Gamefield card suit</option>
                            <option value="gfc">Gamefield cardcount</option>
                            <option value="pf">Playerfield</option>
                            <option value="pfi">Playerfield index</option>
                            <option value="gf">Gamefield</option>
                            <option value="gfi">Gamefield index</option>
                            <option value="cardidx">Placed card position</option>
                            <option value="value">Value</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-center gap-4">


                        <div className="flex flex-col items-center justify-center" style={actions?.left_player === null ? { opacity: '20%' } : {}}>
                            {!actions.left?.includes('gf') && <>
                                <div>Left player</div>
                                <input className="text-center border" type="text" id="actions.left_player" onChange={handleActionInput} value={actions?.left_player ?? ''} /></>
                            }
                            {actions.left?.includes('gf') &&
                                <select className="border text-center" name="actions.left_player" id="actions.left_player" onChange={handleActionInput} value={actions?.left_player ?? ''}>
                                    <option value="">from</option>
                                    <option value="0">Tabletop</option>
                                    <option value="1">Deck</option>
                                </select>}
                        </div>


                        <div className="flex flex-col items-center justify-center" style={actions?.left_field === null ? { opacity: '20%' } : {}}>

                            <select className="border text-center" name="actions.left_field" id="actions.left_field" onChange={handleActionInput} value={actions?.left_field ?? ''}>
                                <option value="">Left field</option>
                                {actions.left?.includes('gf') && gamefields && gamefields.map((field, index) => {
                                    return <option key={index} value={index}>{field}</option>
                                })
                                }
                                {actions.left?.includes('pf') && playerfields && playerfields.map((field, index) => {
                                    return <option key={index} value={index}>{field}</option>
                                })
                                }
                            </select>
                        </div>


                        <div className="flex flex-col items-center justify-center" style={actions?.left_value === null ? { opacity: '20%' } : {}}>
                            <div>{{ gfcv: 'From top', pfcv: 'Index', gfcs: 'From top', pfcs: 'Index' }[actions.left as string] || 'Left value'}</div>
                            <input className="text-center border" type="text" id="actions.left_value" onChange={handleActionInput} value={actions?.left_value ?? ''} />
                        </div>



                        <div className="flex flex-col items-center justify-center" style={actions?.right_player === null ? { opacity: '20%' } : {}}>
                            {!actions.right?.includes('gf') && <>
                                <div>Right player</div>
                                <input className="text-center border" type="text" id="actions.right_player" onChange={handleActionInput} value={actions?.right_player ?? ''} /></>
                            }
                            {actions.right?.includes('gf') &&
                                <select className="border text-center" name="actions.right_player" id="actions.right_player" onChange={handleActionInput} value={actions?.right_player ?? ''}>
                                    <option value="">from</option>
                                    <option value="0">Tabletop</option>
                                    <option value="1">Deck</option>
                                </select>}
                        </div>


                        <div className="flex flex-col items-center justify-center" style={actions?.right_field === null ? { opacity: '20%' } : {}}>

                            <select className="border text-center" name="actions.right_field" id="actions.right_field" onChange={handleActionInput} value={actions?.right_field ?? ''}>
                                <option value="">Right field</option>
                                {actions.right?.includes('gf') && gamefields && gamefields.map((field, index) => {
                                    return <option key={index} value={index}>{field}</option>
                                })
                                }
                                {actions.right?.includes('pf') && playerfields && playerfields.map((field, index) => {
                                    return <option key={index} value={index}>{field}</option>
                                })
                                }
                            </select>
                        </div>


                        <div className="flex flex-col items-center justify-center" style={actions?.right_value === null ? { opacity: '20%' } : {}}>
                            <div>{{ gfcv: 'From top', pfcv: 'Index', gfcs: 'From top', pfcs: 'Index' }[actions.right as string] || 'Right value'}</div>
                            <input className="text-center border" type="text" id="actions.right_value" onChange={handleActionInput} value={actions?.right_value ?? ''} />
                        </div>

                    </div>
                </>
                }


            </div>
            <button className="border p-0.5" type="submit">save</button>
            <div className="cursor-pointer flex w-fit border p-0.5" onClick={() => duplicate(rulesState)}>duplicate</div>
            <div className="cursor-pointer flex w-fit border p-0.5" onClick={() => removeRule()}>remove</div>
        </form>
    )
}