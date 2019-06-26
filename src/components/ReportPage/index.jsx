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

class ReportPage extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            loading: true,
            error  : null,
            data   : null,

            // These are populated from URL params
            clinic : "", // Clinic ID
            date   : "", // YYYY-MM
            measure: "", // Measure ID
            org    : "", // Org ID
            payer  : ""  // Payer ID
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
    }

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
        // const {
        //     date,
        //     measure: {
        //         id: measureId
        //     }
        // } = this.props.location.state;
        // "/api/measures/results/immunization_for_adolescents?payer=bcbs_ma&org=bch"
        // measureId
        // payer
        // org
        // clinic
        // ds
        // date
    }

    componentDidMount()
    {
        this.loadData();
    }

    renderEditor()
    {
        return (
            <div>
                <SQLEditor
                    query={ QUERY }
                    { ...this.props.ui.sqlEditor }
                    onHeightChange={ h => this.props.dispatch(setEditorHeight(h)) }
                />
                <button className="btn btn-brand active">RUN</button>
            </div>
        );
    }

    render()
    {
      
        const { error, loading } = this.state;
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
                        <br/>
                        <br/>
                        <DataGrid/>
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
