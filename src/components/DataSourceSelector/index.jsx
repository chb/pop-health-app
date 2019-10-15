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

    render()
    {
        const ehr   = [];
        const claim = [];

        for (const id in this.props.dataSources) {
            const meta = this.props.dataSources[id];

            const node = (
                <Checkbox
                    key={ id }
                    label={ meta.label }
                    checked={ !!meta.selected }
                    disabled={ !meta.enabled }
                    onChange={ () => this.props.toggleDataSource(id) }
                    radio={ meta.type === "claims" }
                />
            );

            if (meta.type === "ehr") {
                ehr.push(node);
            }
            else if (meta.type === "claims") {
                claim.push(node);
            }
        }

        return (
            <div>
                <h6 className="data-sources-title">EHR DATA SOURCES</h6>
                { ehr }
                <br/>
                <br/>
                <h6 className="data-sources-title">CLAIMS DATA SOURCE</h6>
                { claim }
            </div>
        );
    }
}

export default connect(
    state => ({
        dataSources: { ...state.dataSources }
    }),
    dispatch => ({
        toggleDataSource: id => dispatch(toggleDataSource(id))
    })
)(Sidebar);
