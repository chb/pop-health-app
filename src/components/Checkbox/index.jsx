import React     from "react";
import PropTypes from "prop-types";
import                "./Checkbox.scss";


export default class Checkbox extends React.Component
{
    static propTypes = {
        label   : PropTypes.string.isRequired,
        checked : PropTypes.bool.isRequired,
        onChange: PropTypes.func.isRequired
    };

    render()
    {
        return (
            <label
                className={"checkbox-label" + (this.props.checked ? " selected" : "") }
                onClick={() => this.props.onChange(!this.props.checked) }
            >
                <i className={this.props.checked ? "fas fa-check-square" : "far fa-square"}/> { this.props.label }
            </label>
        );
    }
}