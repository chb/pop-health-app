import React               from "react";
import PropTypes           from "prop-types";
import { connect }         from "react-redux";
import { Route, NavLink }  from "react-router-dom";
import Sidebar             from "../Sidebar";
import SQLEditor           from "../SQLEditor";
import DataGrid            from "../DataGrid";
import ReportSummary       from "../ReportSummary";
import http                from "../../http";
import { setEditorHeight } from "../../store/ui";

function formatDuration(ms) {
    let out = [];
    let meta = [
        { label: "week"  , n: 1000 * 60 * 60 * 24 * 7 },
        { label: "day"   , n: 1000 * 60 * 60 * 24     },
        { label: "hour"  , n: 1000 * 60 * 60          },
        { label: "minute", n: 1000 * 60               },
        { label: "second", n: 1000                    },
        { label: "ms"    , n: 1                       }
    ];

    meta.reduce((prev, cur) => {
        let chunk = Math.floor(prev / cur.n);
        if (chunk) {
            out.push(`${chunk} ${cur.label}${chunk > 1 && cur.n > 1 ? "s" : ""}`);
            return prev - chunk * cur.n;
        }
        return prev;
    }, ms);

    if (!out.length) {
        out.push(`0 ${meta.pop().label}`);
    }

    if (out.length > 1) {
        let last = out.pop();
        out[out.length - 1] += " and " + last;
    }

    return out.join(", ");
}

class ReportPage extends React.Component
{
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                id     : PropTypes.string,
                date   : PropTypes.string,
                measure: PropTypes.string,
                org    : PropTypes.string
            })
        }),
        location: PropTypes.object,
        ui: PropTypes.shape({
            sqlEditor: PropTypes.object
        }),
        dispatch: PropTypes.func.isRequired,
        dataSources: PropTypes.object
    };

    constructor(props)
    {
        super(props);

        this.state = {
            loading: true,
            error  : null,
            data   : null
        };

        this.timer = null;
    }

    /**
     * Starts a timer that is active while a query is running. When the query is
     * complete (successful or not) the timer will destroy itself. This is used
     * to measure the total time that it takes to execute a query and receive
     * the result.
     */
    startClock() {
        const start = Date.now();

        const tick = () => {
            if (this.state.prestoLoading) {
                this.setState({
                    queryTime: Date.now() - start
                }, () => {
                    this.timer = setTimeout(tick, 100);
                });
            } else {
                this.timer = null;
            }
        };

        tick();
    }

    /**
     * Loads the report data
     */
    loadData()
    {
        const dsKeys = Object.keys(this.props.dataSources);
        const query = new URLSearchParams(this.props.location.search);

        if (dsKeys.length) {
            query.delete("ds");
            dsKeys.forEach(key => {
                if (this.props.dataSources[key].selected) {
                    query.append("ds", key);
                }
            });
        }

        this.setState({ loading: true }, () => {
            http.request(`/api/measure/result/report?${query}`).then(
                data  => this.setState({ data, loading: false }),
                error => this.setState({ error, loading: false })
            );
        });
    }

    /**
     * Execute an SQL query and render the results in the grid
     * @param {String} q The SQL to execute
     */
    runQuery(q)
    {
        this.setState({
            prestoLoading: true,
            queryTime: 0,
            query: q
        }, () => {
            this.startClock();
            http.query(q).then(
                resp => {
                    this.setState({
                        prestoLoading: false,
                        prestoError  : null,
                        prestoData   : resp
                    });
                },
                err => {
                    this.setState({
                        prestoLoading: false,
                        prestoError  : err,
                        prestoData   : null
                    });
                }
            );
        });
    }

    /**
     * Fetch the report data after the first render
     */
    componentDidMount()
    {
        this.loadData();
    }

    componentDidUpdate(prevProps)
    {
        if (!this.state.loading) {

            // Detect dataSource selection change
            const prevDataSources = prevProps.dataSources || {};
            for (const dsId in prevDataSources) {
                const curDs = (this.props.dataSources || {})[dsId];
                if (curDs.selected !== prevDataSources[dsId].selected) {
                    return this.loadData();
                }
            }
        }
    }

    renderEditor()
    {
        if (!this.state.data || !this.state.data.cohort_sql) {
            return null;
        }

        return (
            <SQLEditor
                query={ this.state.data.cohort_sql }
                { ...this.props.ui.sqlEditor }
                onHeightChange={ h => this.props.dispatch(setEditorHeight(h)) }
                onQuery={ q => this.runQuery(q) }
            />
        );
    }

    createSummaryRenderer()
    {
        if (!this.state.data) return null;

        return (
            <ReportSummary
                clinic="All Clinics"
                date={ this.state.data.measureDate }
                measureName={ this.state.data.measureName }
                startValue={ this.state.numeratorValue }
                numeratorValue={ this.state.data.numeratorValue }
                denominatorValue={ this.state.data.denominatorValue }
                measureDescription={ this.state.data.measureDescription || "No description available for this measure" }
                numeratorDescription={ this.state.data.numeratorDescription || "No description available for the numerator of this measure"   }
                denominatorDescription={ this.state.data.denominatorDescription || "No description available for the denominator of this measure" }
            />
        );
    }

    render()
    {
        const {
            error,
            // loading,
            prestoError,
            prestoData,
            prestoLoading,
            queryTime,
            query
        } = this.state;

        if ( error ) {
            console.error(error);
            return <b>{ error.message }</b>;
        }

        // if ( loading ) {
        //     return <b>Loading...</b>;
        // }

        return (
            <div>
                <div className="row">
                    <Sidebar/>
                    <div className="col-9">
                        <div className="row">
                            <div className="col-6 align-middle">
                                <h3 style={{ lineHeight: "43px", margin: 0 }}>
                                    <Route path="/report" exact render={() => "Month Report" }/>
                                    <Route path="/report/editor" render={() => "Cohort Builder"} />
                                </h3>
                            </div>
                            <div className="col-6 text-right">
                                <div className="btn-group view-toggle" role="group">
                                    <NavLink className="btn btn-brand" to={{
                                        pathname: "/report",
                                        search  : this.props.location.search
                                    }} exact>REPORT</NavLink>
                                    <NavLink className="btn btn-brand" to={{
                                        pathname: "/report/editor",
                                        search  : this.props.location.search
                                    }} exact>BUILDER</NavLink>
                                </div>
                            </div>
                        </div>
                        <br/>
                        <Route path="/report"        exact render={() => this.createSummaryRenderer()}/>
                        <Route path="/report/editor" exact render={() => this.renderEditor()} />
                        {
                            queryTime ?
                                <div className="float-right" style={{ marginTop: "-4em", fontSize: 11, color: "#999", textAlign: "right" }}>
                                        Total time: { formatDuration(queryTime) }<br/>
                                    { !prestoLoading && prestoData ? "Result rows: " + prestoData.data.length : "" }
                                </div> :
                                null
                        }
                        <br/>
                        <br/>
                        {
                            prestoLoading ?
                                <div className="alert alert-info">Loading...</div> :
                                prestoError ?
                                    <div className="alert alert-danger">{ prestoError.message }</div> :
                                    prestoData === undefined ?
                                        null :
                                        prestoData && prestoData.data && prestoData.data.length ?
                                            <DataGrid data={ prestoData } query={query}/> :
                                            <div className="alert alert-info">No data to display</div>
                        }
                        <br/>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({
        ui: state.ui,
        dataSources: state.dataSources
    })
)(ReportPage);
