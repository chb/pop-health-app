const INITIAL_STATE = {
    sqlEditor: {
        height: 200,
        options: {
            value: "",
            language: "sql",
            lineNumbers: "off",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            emptySelectionClipboard: false,
            folding: true,
            fontFamily: "Menlo, monospace",
            fontSize: 13,
            glyphMargin: true,
            lineHeight: 16,
            mouseWheelZoom: true,
            renderLineHighlight: "all",
            minimap: {
                enabled: true,
                renderCharacters: false
            }
        }
    }
};

export function setEditorHeight(height)
{
    return { type: "SET_EDITOR_HEIGHT", payload: height };
}

export default function reducer(state = INITIAL_STATE, action)
{
    switch (action.type) {
    case "SET_EDITOR_HEIGHT":
        return {
            ...state,
            sqlEditor: {
                ...state.sqlEditor,
                height: action.payload
            }
        };
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