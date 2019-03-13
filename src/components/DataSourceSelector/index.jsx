import React                from "react";
import PropTypes            from "prop-types";
import { connect }          from "react-redux";
import { toggleDataSource } from "../../store/dataSources";
import Checkbox             from "../Checkbox";
import                           "./DataSourceSelector.css";

class Sidebar extends React.Component
{
    static propTypes = {
        dataSources     : PropTypes.object.isRequired,
        toggleDataSource: PropTypes.func.isRequired
    };

    renderCheckBoxes()
    {
        const out = [];

        for (const id in this.props.dataSources) {
            const meta = this.props.dataSources[id];

            out.push(
                <Checkbox
                    key={ id } 
                    label={ meta.label }
                    checked={ meta.enabled }
                    onChange={ () => this.props.toggleDataSource(id) }
                />
            );
        }

        return out;
    }

    render() {
        return (
            <div>
                <h6 className="data-sources-title">DATA SOURCES</h6>
                { this.renderCheckBoxes() }
            </div>
        );
    }
}

export default connect(
    state => ({ dataSources: state.dataSources }),
    dispatch => ({
        toggleDataSource: id => dispatch(toggleDataSource(id))
    })
)(Sidebar);