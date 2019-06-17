const TOGGLE = "actions:dataSources:toggle";
const LOAD   = "actions:dataSources:loadData";

export function toggleDataSource(id)
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
        let selectedCount = 0;
        for (const id in state) {
            if (state[id].enabled) {
                selectedCount += 1;
            }
        }
        if (selectedCount <= 1 && state[action.payload].enabled) {
            return state;
        }
        return {
            ...state,
            [action.payload]: {
                ...state[action.payload],
                enabled: !state[action.payload].enabled
            }
        };
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
