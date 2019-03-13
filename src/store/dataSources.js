const INITIAL_STATE = {
    bch_epic: {
        label  : "BCH Epic",
        enabled: true
    },
    bch_cerner: {
        label  : "BCH Cerner",
        enabled: true
    },
    aetna_claims: {
        label  : "Aetna Claims",
        enabled: false
    },
    mass_health_claims: {
        label  : "MassHealth Claims",
        enabled: true
    },
    bcbs_claims: {
        label  : "BCBS Claims",
        enabled: false
    }
};

export function toggleDataSource(id)
{
    return { type: "TOGGLE_DATA_SOURCE", payload: id };
}

export function setDataSourceEnabled(id, bEnabled)
{
    return {
        type: "SET_DATA_SOURCE_ENABLED",
        payload: {
            id,
            enabled: !!bEnabled
        }
    };
}

export default function reducer(state = INITIAL_STATE, action)
{
    switch (action.type) {
    case "TOGGLE_DATA_SOURCE":
        return {
            ...state,
            [action.payload]: {
                ...state[action.payload],
                enabled: !state[action.payload].enabled
            }
        };
    case "SET_DATA_SOURCE_ENABLED":
        return {
            ...state,
            [action.payload.id]: {
                ...state[action.payload.id],
                enabled: action.payload.enabled
            }
        };
    default:
        return state;
    }
}