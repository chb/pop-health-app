import React               from "react";
import { connect }         from "react-redux";
import { Route, NavLink }  from "react-router-dom";
import Sidebar             from "../Sidebar";
import SQLEditor           from "../SQLEditor"
import DataGrid            from "../DataGrid";
import ReportSummary       from "../ReportSummary";
import DATA                from "./data";
import QUERY               from "./query";
import { setEditorHeight } from "../../store/ui"

class ReportPage extends React.Component
{
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
                        <NavLink className="btn btn-brand" to="/report" exact>REPORT</NavLink>
                        <NavLink className="btn btn-brand" to="/report/editor">BUILDER</NavLink>
                      </div>
                    </div>
                  </div>
                  <br/>
                  <Route path="/report" exact component={ReportSummary}/>
                  <Route path="/report/editor" render={() => this.renderEditor()} />
                  <br/>
                  <br/>
                  <div className="table-wrap">
                    <div className="row">
                      <div className="col-6 align-middle">
                        <h5>Results</h5>
                      </div>
                      <div className="col-6 text-right">
                        <button className="btn btn-brand">EXPORT CSV</button>
                      </div>
                    </div>
                    <DataGrid rows={ DATA }/>
                  </div>
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
