import React        from "react";
import { connect }  from "react-redux";
import Sidebar      from "../Sidebar";
import Dropdown     from "../Dropdown"
import TimelineGrid from "../TimelineGrid";
import { toggle as toggleOrg   } from "../../store/organizations";
import { toggle as togglePayer } from "../../store/payers";

class MeasuresPage extends React.Component
{
    generateData()
    {
        const data = {};
        Object.keys(this.props.measures).forEach(measure => {
            data[this.props.measures[measure].name] = [
                Math.round(Math.random() * 100),
                Math.round(Math.random() * 100),
                Math.round(Math.random() * 100),
                Math.round(Math.random() * 100),
                Math.round(Math.random() * 100),
                Math.round(Math.random() * 100),
                Math.round(Math.random() * 100),
                Math.round(Math.random() * 100),
                Math.round(Math.random() * 100),
                Math.round(Math.random() * 100),
                Math.round(Math.random() * 100),
                Math.round(Math.random() * 100)
            ];
        });
        return data;
    }

    render()
    {
        return (
            <div className="row">
                <Sidebar/>
                <div className="col-9">
                    <div className="row align-items-center">
                        <div className="col">
                            <div className="row">
                                <div className="col">
                                    <label>Payer</label>
                                    <Dropdown
                                        label="All Payers"
                                        value={ null }
                                        onSelect={id => this.props.dispatch(togglePayer(id))}
                                        options={this.props.payers}
                                    />
                                </div>
                                <div className="col">
                                    <label>Organization</label>
                                    <Dropdown
                                        multiple
                                        label="Organizations"
                                        onSelect={id => this.props.dispatch(toggleOrg(id))}
                                        options={this.props.organizations}
                                    />
                                </div>
                                <div className="col">
                                    <label>Clinic</label>
                                    <Dropdown
                                        label="All Clinics"
                                        value={ null }
                                        onSelect={() => 1}
                                        options={[
                                            {
                                                label: "All Clinics",
                                                description: "Show results from all clinics",
                                                value: null
                                            }
                                        ]}
                                    />
                                </div>    
                            </div>
                        </div>
                        <div className="col-3 align-self-end">
                            <br/>
                            <button className="btn btn-brand active btn-block">Update</button>
                        </div>
                    </div>
                    <br/>
                    { this.props.organizations.filter(o => o.selected).map(org => (
                        <TimelineGrid
                            key={ "timeline-" + org.value }
                            data={this.generateData()}
                            title={org.description}
                        />
                    )) }
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({
        organizations: Object.keys(state.organizations).map(id => ({
            value: id,
            label: state.organizations[id].name,
            selected: state.organizations[id].enabled,
            description: state.organizations[id].description
        })),
        payers: Object.keys(state.payers).map(id => ({
            value: id,
            label: state.payers[id].label,
            selected: state.payers[id].enabled,
            // description: state.payers[id].description
        })),
        measures: state.measures
    })
)(MeasuresPage);
