const TOGGLE = "actions:payers:toggle";
const LOAD   = "actions:payers:loadData";

export function toggle(id)
{
    return { type: TOGGLE, payload: id };
}

export function load(data)
{
    return { type: LOAD, payload: data };
}

export default function reducer(state = {}, action)
{
    switch (action.type) {
    case TOGGLE: {
        const nextState = {};
        for (const id in state) {
            nextState[id] = {
                ...state[id],
                enabled: id === action.payload ? !state[action.payload].enabled : false
            }
        }
        return nextState;
    }
    case LOAD: {
        const newState = {};
        action.payload.forEach(rec => {
            newState[rec.id] = rec;
        });
        return newState;
    }
    default:
        return state;
    }
}