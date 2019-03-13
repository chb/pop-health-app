import React     from "react";
import PropTypes from "prop-types";
import            "./SQLEditor.css";

window.require.config({ paths: { 'vs': 'monaco-editor/min/vs' }});

export default class SQLEditor extends React.Component
{
    static propTypes = {
        query         : PropTypes.string,
        height        : PropTypes.number,
        options       : PropTypes.object,
        onHeightChange: PropTypes.func.isRequired
    };

    static defaultProps = {
        query: ""
    };

    componentWillUnmount()
    {
        if (this.editor) {
            this.editor.dispose();
            this.editor = null;
        }
    }

    componentDidMount()
    {
        window.require(['vs/editor/editor.main'], monaco => {
            this.editor = monaco.editor.create(this.editorNode, {
                ...this.props.options,
                value: this.props.query
            });

            // this.editor.onDidChangeModelContent(() => {
            //     this.setState({
            //         sql: editor.getValue()
            //     })
            // })

            // Row Resizer -----------------------------------------------------
            const $ = window.jQuery;
            const $window = $(window);
            const $editor = $(this.editorNode);

            $(this.divider).on("mousedown", startEvent => {
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
        });
    }

    render() {
        return (
            <div>
                <div className="sql-editor" ref={ node => this.editorNode = node } style={{ height: this.props.height }} />
                <div className="sql-editor-resizer" ref={ node => this.divider = node }>.....</div>
            </div>
        );
    }
}