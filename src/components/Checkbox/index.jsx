import React     from "react";
import PropTypes from "prop-types";
import                "./Checkbox.scss";


export default class Checkbox extends React.Component
{
    static propTypes = {
        label   : PropTypes.string.isRequired,
        checked : PropTypes.oneOfType([PropTypes.bool, PropTypes.number]).isRequired,
        disabled: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
        onChange: PropTypes.func.isRequired,
        radio   : PropTypes.bool
    };

    render()
    {
        const iconClass = this.props.radio ?
            (this.props.checked ? "fa fa-check-circle" : "far fa-circle") :
            (this.props.checked ? "fas fa-check-square" : "far fa-square");

        return (
            <label
                className={"checkbox-label" + (this.props.checked ? " selected" : "") }
                onClick={() => !this.props.disabled && this.props.onChange(!this.props.checked) }
                // @ts-ignore
                disabled={ !!this.props.disabled }
            >
                <i className={ iconClass }/> { this.props.label }
            </label>
        );
    }
}