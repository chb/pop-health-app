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

const TOGGLE = "actions:data-source:toggle";

export function toggleDataSource(id)
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
