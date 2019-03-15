const INITIAL_STATE = {
    "aetna": {
        label: "Aetna",
        enabled: false
    },
    "bcbs_ma": {
        label: "BCBS MA",
        enabled: false
    },
    "hphc": {
        label: "HPHC",
        enabled: false
    },
    "mass_health": {
        label: "MassHealth",
        enabled: true
    }
};

const TOGGLE = "actions:payers:togglePayer";

export function toggle(id)
{
    return { type: TOGGLE, payload: id };
}

export default function reducer(state = INITIAL_STATE, action)
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
    default:
        return state;
    }
}