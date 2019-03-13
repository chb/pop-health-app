const INITIAL_STATE = {
    "bch": {
        name: "BCH",
        description: "Boston Children's Hospital"
    },
    "po": {
        name: "PO",
        description: "BCH Physicians Organization"
    },
    "ppoc": {
        name: "PPOC",
        description: "Pediatric Physicians Organization"
    }
};

export default function reducer(state = INITIAL_STATE, action)
{
    switch (action.type) {
    // case "TOGGLE_DATA_SOURCE":
    //     return {
    //         ...state,
    //         [action.payload]: {
    //             ...state[action.payload],
    //             enabled: !state[action.payload].enabled
    //         }
    //     };
    // case "SET_DATA_SOURCE_ENABLED":
    //     return {
    //         ...state,
    //         [action.payload.id]: {
    //             ...state[action.payload.id],
    //             enabled: action.payload.enabled
    //         }
    //     };
    default:
        return state;
    }
}