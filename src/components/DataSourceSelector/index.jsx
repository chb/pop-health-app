import React                from "react";
import PropTypes            from "prop-types";
import { connect }          from "react-redux";
import { toggleDataSource } from "../../store/dataSources";
import Checkbox             from "../Checkbox";
import { toggle as toggleOrg   } from "../../store/organizations";
import                           "./DataSourceSelector.css";

class Sidebar extends React.Component
{
    static propTypes = {
        dataSources     : PropTypes.object.isRequired,
        toggleDataSource: PropTypes.func.isRequired,
        toggleOrg       : PropTypes.func.isRequired,
        organizations   : PropTypes.array.isRequired
    };

    render()
    {
        const { dataSources, organizations, toggleDataSource, toggleOrg } = this.props;

        const ehr = Object.keys(dataSources)
            .filter(id => dataSources[id].type === "ehr")
            .map(id => dataSources[id]);


        return (
            <div>
                <h6 className="data-sources-title">ORGANIZATIONS</h6>
                {
                    organizations.map(o => (
                        <Checkbox
                            key={ o.value }
                            label={ o.label }
                            title={ o.description }
                            checked={ !!o.selected }
                            onChange={ () => toggleOrg(o.value) }
                            disabled={ o.selected && organizations.filter(o => o.selected).length < 2 }
                        />
                    ))
                }
                <br/>
                <br/>
                <h6 className="data-sources-title">EHR DATA SOURCES</h6>
                {
                    ehr.map(meta => (
                        <Checkbox
                            key={ meta.id }
                            label={ meta.label }
                            checked={ !!meta.selected }
                            disabled={ !meta.enabled || (meta.selected && ehr.filter(o => o.selected).length < 2) }
                            onChange={ () => toggleDataSource(meta.id) }
                            radio={ meta.type === "claims" }
                        />
                    ))
                }
            </div>
        );
    }
}

export default connect(
    state => ({
        dataSources: { ...state.dataSources },
        organizations: Object.keys(state.organizations).map(id => ({
            value      : id,
            label      : state.organizations[id].name,
            selected   : state.organizations[id].enabled,
            description: state.organizations[id].description
        }))
    }),
    dispatch => ({
        toggleDataSource: id => dispatch(toggleDataSource(id)),
        toggleOrg       : id => dispatch(toggleOrg(id))
    })
)(Sidebar);
