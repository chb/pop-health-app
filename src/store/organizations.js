const TOGGLE = "actions:organization:toggle";
const LOAD   = "actions:organization:loadData";

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
    case TOGGLE:
        return {
            ...state,
            [action.payload]: {
                ...state[action.payload],
                enabled: !state[action.payload].enabled
            }
        };
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