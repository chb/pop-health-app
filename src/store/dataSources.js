const TOGGLE = "actions:dataSources:toggle";
const LOAD   = "actions:dataSources:loadData";
const MERGE  = "actions:dataSources:merge";

function countSelected(state) {
    let selectedCount = 0;
    for (const id in state) {
        if (state[id].enabled) {
            selectedCount += 1;
        }
    }
    return selectedCount;
}

export function toggleDataSource(id)
{
    return { type: TOGGLE, payload: id };
}

export function load(data)
{
    return function(dispatch, getState) {
        const oldState = getState();
        const newState = {};

        data.forEach(rec => {
            let enabled = !!rec.enabled;
            let selected = !!rec.selected;

            if (rec.type === "claims") {
                enabled = false;
                const payerId = Object.keys(oldState.payers).find(
                    id => oldState.payers[id].dataSource === rec.id
                );

                if (!payerId || oldState.payers[payerId].selected) {
                    selected = true;
                }
            }

            newState[rec.id] = {
                ...rec,
                selected,
                enabled
            };
        });
        dispatch({ type: LOAD, payload: newState });
    };
}

export function toggle(id, on) {
    return function(dispatch, getState) {
        const oldState = getState();
        const selectedCount = countSelected(oldState);

        // If we only have one item selected, an "unselect request" must be ignored
        if (selectedCount <= 1 && !on) {
            return;
        }

        dispatch({
            type: MERGE,
            payload: {
                [id]: {
                    selected: !!on
                }
            }
        });
    };
}

export function selectClaimsDataSource(id) {
    return function(dispatch, getState) {
        const oldState = getState();
        const newState = { ...oldState.dataSources };

        for (const key in newState) {
            if (newState[key].type === "claims") {
                newState[key].selected = key === id;
            }
        }

        dispatch({ type: MERGE, payload: newState });
    };
}

export default function reducer(state = {}, action)
{
    switch (action.type) {

    case TOGGLE: {
        const selectedCount = countSelected(state);
        if (selectedCount <= 1 && state[action.payload].selected) {
            return state;
        }
        return {
            ...state,
            [action.payload]: {
                ...state[action.payload],
                selected: !state[action.payload].selected
            }
        };
    }

    case LOAD:
        return { ...action.payload };

    case MERGE:
        return window.jQuery.extend(true, state, action.payload);

    default:
        return state;
    }
}
