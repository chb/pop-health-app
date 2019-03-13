const INITIAL_STATE = {
    "childhood_immunization_status": {
        name: "Childhood Immunization Status"
    },
    "immunization_for_adolescents": {
        name: "Immunizations for Adolescents",
        description: "",
        numerator: "",
        denominator: "",
        query: ``,
        results: []
    },
    "depression_screening_follow_up": {
        name: "Depression Screening and Follow-up Plan"
    },
    "depression_remission": {
        name: "Depression Remission or Response"
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