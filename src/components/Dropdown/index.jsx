import React     from "react";
import PropTypes from "prop-types";
import                "./Dropdown.scss";

function cls(o) {
    return Object.keys(o).filter(c => !!o[c]).join(" ");
}

function stopEvent(e) {
    e.preventDefault();
    e.stopPropagation();
}

export default class Dropdown extends React.Component
{
    static propTypes = {
        value: PropTypes.any,
        label: PropTypes.string.isRequired,
        multiple: PropTypes.bool,
        onSelect: PropTypes.func.isRequired,
        options: PropTypes.arrayOf(PropTypes.shape({
            label      : PropTypes.string.isRequired,
            description: PropTypes.string,
            value      : PropTypes.any
        }))
    };

    constructor(props)
    {
        super(props);
        this.state = { open: false };
    }

    toggleOption(option) {
        if (!this.props.multiple) {
            this.setState({ open: false });
        }
        this.props.onSelect(option.value);
    };

    renderOptions()
    {
        return this.props.options.map(opt => {
            return (
                <div
                    key={ opt.value }
                    className={cls({"dropdown-item": 1, selected: opt.selected})}
                    onMouseDown={ () => this.toggleOption(opt) }
                >
                    {this.props.multiple && <i className={cls({
                        "fas fa-check-square": opt.selected,
                        "far fa-square"      : !opt.selected
                    })}/>}
                    <b>{ opt.label }</b>
                    { opt.description && <div className="small text-muted">{ opt.description }</div> }
                </div>
            )
        });
    }

    render()
    {
        let label = "None Selected";
        const selected = this.props.options.filter(o => o.selected);
        if (selected.length > 0) {
            if (selected.length === this.props.options.length) {
                label = `All ${this.props.label}`;
            }
            else {
                label = selected.map(o => o.label).join(", ");
            }
        }
        return (
            <div className={cls({
                dropdown: 1,
                multiple: this.props.multiple,
                show    : this.state.open
            })}>
                <button
                    className="btn btn-brand dropdown-toggle"
                    type="button"
                    onClick={() => this.setState({ open: !this.state.open })}
                    onBlur={() => this.setState({ open: false })}
                >
                    { label }
                </button>
                <div
                    className={cls({
                        "dropdown-menu": 1,
                        "show": this.state.open
                    })}
                    onClick={ stopEvent }
                    onMouseDown={ stopEvent }
                >
                    { this.renderOptions() }
                </div>
            </div>
        );
    }
}