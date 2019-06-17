const LOAD = "actions:measures:loadData";

export function load(data)
{
    return { type: LOAD, payload: data };
}

export default function reducer(state = {}, action)
{
    switch (action.type) {
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