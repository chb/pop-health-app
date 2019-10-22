import { selectClaimsDataSource } from "./dataSources";

const TOGGLE = "actions:payers:toggle";
const LOAD   = "actions:payers:loadData";

export function toggle(id) {
    return function(dispatch, getState) {

        const oldState = getState();
        const payer = oldState.payers[id];
        const correspondingClaimsDataSourceId = payer.ds_id;

        if (!payer.selected) {
            dispatch(selectClaimsDataSource(correspondingClaimsDataSourceId));
        }
        dispatch({ type: TOGGLE, payload: id });
    };
}

export function load(data) {
    return function(dispatch) {
        dispatch({ type: LOAD, payload: data });
    };
}

export default function reducer(state = {}, action)
{
    switch (action.type) {
    case TOGGLE: {
        const nextState = {};
        for (const id in state) {
            nextState[id] = {
                ...state[id],
                selected: id === action.payload ? !state[action.payload].selected : false
            };
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