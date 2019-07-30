import React               from "react";
import { connect }         from "react-redux";
import { Route, NavLink }  from "react-router-dom";
import Sidebar             from "../Sidebar";
import SQLEditor           from "../SQLEditor"
import DataGrid            from "../DataGrid";
import ReportSummary       from "../ReportSummary";
import QUERY               from "./query";
import http                from "../../http"
import { setEditorHeight } from "../../store/ui"

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

    meta.reduce((prev, cur, i, all) => {
        let chunk = Math.floor(prev / cur.n);
        if (chunk) {
            out.push(`${chunk} ${cur.label}${chunk > 1 && cur.n > 1 ? "s" : ""}`);
            return prev - chunk * cur.n
        }
        return prev
    }, ms);

    if (!out.length) {
        out.push(`0 ${meta.pop().label}`);
    }

    if (out.length > 1) {
        let last = out.pop();
        out[out.length - 1] += " and " + last;
    }

    return out.join(", ")
}

class ReportPage extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {

            // These are populated from URL params
            // -----------------------------------------------------------------
            clinic : "", // Clinic ID
            date   : "", // YYYY-MM
            measure: "", // Measure ID
            org    : "", // Org ID
            payer  : "", // Payer ID

            // Data and state of the currently selected report
            // -----------------------------------------------------------------
            loading: true,
            error  : null,
            data   : null,

            // Data, query and state of the SQL editor
            // -----------------------------------------------------------------
            prestoLoading: null,
            prestoError  : null,
            prestoData   : null,
            queryTime    : 0,
            query        : ""
        };

        const query = new URLSearchParams(this.props.location.search);

        do {

          // We expect to be told where the report has been generated. This is the
          // clinic but until we have the clinics implemented, we are using a
          // default clinic ("boston_clinic") for every report
          this.state.clinic = query.get("clinic") || "boston_clinic";

          // We expect to be told which date to look for
          if (!query.has("date")) {
              this.state.error = new Error("A 'date' parameter is required");
              break;
          }
          this.state.date = query.get("date");

          // We expect to be told which measure to look for
          if (!query.has("measure")) {
              this.state.error = new Error("A 'measure' parameter is required");
              break;
          }
          this.state.measure = query.get("measure");

          // We expect to be told which organization should be used
          if (!query.has("org")) {
              this.state.error = new Error("A 'org' parameter is required");
              break;
          }
          this.state.org = query.get("org");

          // We expect to be told which payer should be used
          if (!query.has("payer")) {
              this.state.error = new Error("A 'payer' parameter is required");
              break;
          }
          this.state.payer = query.get("payer");

        } while (false);

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
        const uri = `/api/measures/results/${this.state.measure}?payer=${
          this.state.payer}&org=${this.state.org}&date=${this.state.date
          }&clinic=${this.state.clinic}`;
        this.setState({ loading: true });
        http.request(uri).then(
            data  => this.setState({ data, loading: false }),
            error => this.setState({ error, loading: false })
        );
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

    renderEditor()
    {
        return (
            <SQLEditor
                query={ QUERY }
                { ...this.props.ui.sqlEditor }
                onHeightChange={ h => this.props.dispatch(setEditorHeight(h)) }
                onQuery={ q => this.runQuery(q) }
            />
        );
    }

    render()
    {
      
        const { error, loading, prestoError, prestoData, prestoLoading, queryTime, query } = this.state;
        if ( error ) {
            console.error(error);
            return <b>{ error.message }</b>
        }
        if ( loading ) {
            return <b>Loading...</b>
        }

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
                                  }}>BUILDER</NavLink>
                              </div>
                          </div>
                        </div>
                        <br/>
                        <Route path="/report" exact component={ReportSummary}/>
                        <Route path="/report/editor" render={() => this.renderEditor()} />
                        {
                            queryTime ?
                            <div className="float-right" style={{ marginTop: "-4em", fontSize: 11, color: "#999", textAlign: "right" }}>
                                    Total time: { formatDuration(queryTime) }<br/>
                                {/* { !prestoLoading && prestoData && prestoData.processedRows ? "Processed rows: " + String(prestoData.processedRows).replace(/\d(?=(\d{3})+$)/g, '$&,') : "" }<br/> */}
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
                                    prestoData ?
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
    ui: state.ui
  })
)(ReportPage);
