const INITIAL_STATE = {
    "bch": {
        name: "BCH",
        description: "Boston Children's Hospital",
        enabled: true
    },
    "po": {
        name: "PO",
        description: "BCH Physicians Organization",
        enabled: true
    },
    "ppoc": {
        name: "PPOC",
        description: "Pediatric Physicians Organization",
        enabled: true
    }
};

const TOGGLE = "actions:organization:toggleOrganization";

export function toggle(id)
{
    return { type: TOGGLE, payload: id };
}

export default function reducer(state = INITIAL_STATE, action)
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
    default:
        return state;
    }
}