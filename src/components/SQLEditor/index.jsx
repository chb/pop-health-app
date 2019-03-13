import React     from "react";
import PropTypes from "prop-types";
import            "./SQLEditor.css";

window.require.config({ paths: { 'vs': 'monaco-editor/min/vs' }});

export default class SQLEditor extends React.Component
{
    static propTypes = {
        query: PropTypes.string,
        height: PropTypes.number,
        options: PropTypes.object,
        onHeightChange: PropTypes.func.isRequired
    };

    static defaultProps = {
        query: ""
    };

    constructor(props)
    {
        super(props);
        // this.sqlEditorDiv = React.createRef();
        this.state = { height: 200 };
        this.editor = null;
    }

    componentWillUnmount()
    {
        console.log("SQLEditor.componentWillUnmount", !!this.editor)
        if (this.editor) {
            this.editor.dispose();
            this.editor = null;
            // this.sqlEditorDiv.innerHTML = "";
        }
    }

    componentDidMount()
    {
        console.log("SQLEditor.componentDidMount")
        const createEditor = (monaco) => {
            if (!this.editor) {
                console.log(this)
                this.editor = monaco.editor.create(document.getElementById("sql-editor"), {
                    ...this.props.options,
                    value: this.props.query
                });

                // this.editor.onDidChangeModelContent(() => {
                //     this.setState({
                //         sql: editor.getValue()
                //     })
                // })

                // Row Resizer -------------------------------------------------
                const $ = window.jQuery;
                const $window = $(window);
                const $editor = $("#sql-editor");

                $("#divider").on("mousedown", startEvent => {
                    const startY = startEvent.clientY;
                    let height = $editor.css({ overflow: "hidden" }).height();
                    $window.on("mouseup.resize", () => {
                        $editor.css({ overflow: "visible" });
                        this.props.onHeightChange($editor.outerHeight());
                        $window.off(".resize");
                    });
                    $window.on("mousemove.resize", moveEvent => {
                        $editor.height(height + moveEvent.clientY - startY);
                    });
                });
            }
        };

        // if (!window.monaco) {
        //     window.monaco = {};
            window.require(['vs/editor/editor.main'], createEditor);
        // } else {
        //     createEditor();
        // }
    }

    // shouldComponentUpdate(nextProps) {
    //     return false;
    //     // return nextProps.query !== this.props.query;
    // }

    render() {
        // console.log("SQLEditor.render")
        return (
            <div>
                <div id="sql-editor" style={{ height: this.props.height }} />
                <div id="divider">.....</div>
            </div>
        );
    }
}