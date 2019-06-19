import React        from "react";
import { connect }  from "react-redux";
import Sidebar      from "../Sidebar";
import Dropdown     from "../Dropdown"
import TimelineGrid from "../TimelineGrid";
import { toggle as toggleOrg   } from "../../store/organizations";
import { toggle as togglePayer } from "../../store/payers";
// import { queryMeasures } from "../../store/measureResults";
import http from "../../http"

class MeasuresPage extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            loading: false,
            error: null,
            data: null
        };
    }

    // /**
    //  * Determine if the selected organizations have changed
    //  * @param {Objects} prevProps
    //  */
    // hasChangesInOrganizations(prevProps) {
    //     const a = this.props.organizations.filter(o => o.selected).map(o => o.value).sort();
    //     const b = prevProps.organizations.filter(o => o.selected).map(o => o.value).sort();
    //     return a + "" !== b + "";
    // }

    // /**
    //  * Determine if the selected clinics have changed
    //  * @param {Objects} prevProps
    //  */
    // hasChangesInClinics(prevProps) {
    //     return false; // no clinics yet
    // }

    // /**
    //  * Determine if the selected data sources have changed
    //  * @param {Objects} prevProps 
    //  */
    // hasChangesInDataSources(prevProps) {
    //     const a = Object.keys(this.props.dataSources).filter(k => this.props.dataSources[k].enabled).sort();
    //     const b = Object.keys(prevProps.dataSources).filter(k => prevProps.dataSources[k].enabled).sort();
    //     return a + "" !== b + "";
    // }

    // /**
    //  * Determine if the selected payer has changed
    //  * @param {Objects} prevProps 
    //  */
    // hasChangesInPayer(prevProps) {
    //     const a = (prevProps.payers.find(o => o.selected) || {}).value;
    //     const b = (this.props.payers.find(o => o.selected) || {}).value;
    //     return a !== b;
    // }

    /**
     * Determine if any part of the state that is relevant for the measures
     * calculation has changed
     * @param {*} prevProps
     */
    hasChanges(prevProps) {
        return this.getQueryUri(prevProps) !== this.getQueryUri(this.props);
        // return (
        //     this.hasChangesInPayer(prevProps) ||
        //     this.hasChangesInOrganizations(prevProps) ||
        //     this.hasChangesInClinics(prevProps) ||
        //     this.hasChangesInDataSources(prevProps)
        // );
    }

    /**
     * Compile and return the uri that will be used to query the measure results.
     * If any of the needed variables are missing (E.g. not available yet), it
     * will return null.
     */
    getQueryUri(props) {
        let q = new URLSearchParams();

        // payer
        props.payers.forEach(o => {
            if (o.selected) q.append("payer", o.value);
        });

        // organizations
        props.organizations.forEach(o => {
            if (o.selected) q.append("org", o.value);
        });

        // clinics
        // TODO

        // Data sources
        for (let id in props.dataSources) {
            if (props.dataSources[id].enabled) {
                q.append("ds", id);
            }
        }

        if (!q.has("payer") || !q.has("ds")) {
            return null;
        }

        q = q.toString();

        if (!q) {
            return null;
        }

        return "/api/measures/results?" + q;
    }
    
    query()
    {
        const uri = this.getQueryUri(this.props);
        if (uri) {
            this.setState({ loading: true });
            http.request(uri).then(
                data  => this.setState({ data, loading: false }),
                error => this.setState({ error, loading: false })
            );

            // // debugger;
            // this.props.dispatch(queryMeasures({
            //     org: this.props.organizations.filter(o => !!o.selected).map(o => o.id),
            //     payer: "mass_health"
            //     // clinic,
            //     // ds,
            //     // startDate,
            //     // endDate
            // }));
        }
    }

    // getSnapshotBeforeUpdate(prevProps, prevState) {
    //     if (prevProps)
    // }

    componentDidUpdate(prevProps, prevState)
    {
        if (this.hasChanges(prevProps)) this.query();
    }

    componentDidMount()
    {
        this.query();
    }

    // generateData()
    // {
    //     const data = {};
    //     Object.keys(this.props.measures).forEach(measure => {
    //         data[this.props.measures[measure].name] = [
    //             Math.round(Math.random() * 100),
    //             Math.round(Math.random() * 100),
    //             Math.round(Math.random() * 100),
    //             Math.round(Math.random() * 100),
    //             Math.round(Math.random() * 100),
    //             Math.round(Math.random() * 100),
    //             Math.round(Math.random() * 100),
    //             Math.round(Math.random() * 100),
    //             Math.round(Math.random() * 100),
    //             Math.round(Math.random() * 100),
    //             Math.round(Math.random() * 100),
    //             Math.round(Math.random() * 100)
    //         ];
    //     });
    //     return data;
    // }

    // Rendering methods -------------------------------------------------------
    renderStage()
    {
        const { error, loading, data } = this.state;
        if (loading) {
            return <p style={{ textAlign: "center" }}>Loading...</p>;
        }
        if (error) {
            return <pre>{ error.stack }</pre>;
        }
        if (!data) {
            return null;
        }

        const reports = [];
        for (let id in data.organizations) {
            reports.push(
                <TimelineGrid
                    key={ "timeline-" + id }
                    data={ data.organizations[id] }
                    orgId={id}
                />
            );
        }

        return reports;
    }

    render()
    {
        // console.log(this.props)
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
                    { this.renderStage() }
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
        measures: state.measures,
        dataSources: state.dataSources
    })
)(MeasuresPage);
