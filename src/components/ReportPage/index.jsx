import React       from "react";
import { connect } from "react-redux";
import Sidebar     from "../Sidebar";
import SQLEditor   from "../SQLEditor"
import DATA        from "./data";
import QUERY       from "./query";
import { setEditorHeight } from "../../store/ui"

class ReportPage extends React.Component
{

    renderGrid()
    {
        const header = (
        <thead>
            <tr>
            { Object.keys(DATA[0]).map((key, i) => (
                <th key={"th-" + i}>{ key }</th>
            )) }
            </tr>
        </thead>
        );

        const body = DATA.map((rec, i) => (
        <tr key={i}>
            { Object.keys(rec).map(key => (
            <td key={key + "" + i}>{ rec[key] }</td>
            )) }
        </tr>
        ));

        return (
        <table className="table table-sm table-bordered table-hover">
            { header }
            <tbody>{ body }</tbody>
        </table>
        )
    }

    shouldComponentUpdate(newProps) {
      // return false;
      return newProps.ui.sqlEditor.height !== this.props.ui.sqlEditor.height;
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
                      <h3 style={{ lineHeight: "43px", margin: 0 }}>Cohort Builder</h3>
                    </div>
                    <div className="col-6 text-right">
                      <div className="btn-group view-toggle" role="group">
                        <button type="button" className="btn btn-brand">REPORT</button>
                        <button type="button" className="btn btn-brand active">BUILDER</button>
                      </div>
                    </div>
                  </div>
                  <br/>
                  <SQLEditor
                    query={ QUERY }
                    { ...this.props.ui.sqlEditor }
                    onHeightChange={ h => this.props.dispatch(setEditorHeight(h)) }
                  />
                  <button className="btn btn-brand active">RUN</button>
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
                    { this.renderGrid() }
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
