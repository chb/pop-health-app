/* eslint-disable jsx-a11y/anchor-is-valid */
import React     from "react";
import PropTypes from "prop-types";
import                "./DataGrid.scss";

function pad(input) {
    while (input.length % 4) {
        input += "=";
    }
    return input;
}

function base64UrlEncode(input) {
    return pad(btoa(input)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export default class RemoteDataGrid extends React.Component
{
    static propTypes = {

        /**
         * Let the grid know what SQL query has produced the data. This is
         * needed so that we can build the download csv link
         */
        query: PropTypes.string.isRequired,

        /**
         * The data to render in the grid
         */
        data: PropTypes.shape({
            header: PropTypes.arrayOf(PropTypes.string),
            data: PropTypes.arrayOf(PropTypes.array)
        })
    };

    buildCsvUrl()
    {
        return "http://localhost:3003/sql/csv?q=" + base64UrlEncode(this.props.query);
    }

    render() {
        const { data = {} } = this.props;

        return (
            <div className="table-wrap">
                <div className="row">
                    <div className="col-6 align-middle">
                        <h5>Preview</h5>
                    </div>
                    <div className="col-6 text-right">
                        <a
                            className="btn btn-brand"
                            href={ this.buildCsvUrl() }
                            download="report.csv"
                        >DOWNLOAD CSV</a>
                    </div>
                </div>
                <DataGrid cols={ data.header } rows={ data.data} />
            </div>
        );
    }
}

class DataGrid extends React.Component
{
    static propTypes = {
        cols: PropTypes.arrayOf(PropTypes.string),
        rows: PropTypes.arrayOf(PropTypes.array)
    };

    static defaultProps = {
        cols: [],
        rows: [] 
    };

    constructor(props)
    {
        super(props);
        this.wrapper = React.createRef();
    }

    componentDidUpdate()
    {
        this.syncHeader();
    }

    componentDidMount()
    {
        this.syncHeader();
    }

    syncHeader() {
        if (this.wrapper.current) {
            let headerCells = this.wrapper.current.querySelectorAll(".data-grid-header th");
            let bodyCells = this.wrapper.current.querySelectorAll(".data-grid-body tr:first-child td");
            bodyCells.forEach((td, i) => {
                headerCells[i].style.width = Math.floor(td.clientWidth + 1) + "px";
            });
        }
    }

    render()
    {
        const { rows, cols } = this.props;

        if (!rows.length) {
            return <p className="text-center">No data</p>;
        }
    
        const header = (
            <thead>
                <tr>
                { cols.map((key, i) => (
                    <th key={"th-" + i} title={ key }>{ key }</th>
                )) }
                </tr>
            </thead>
        );

        const body = rows.map((rec, i) => (
            <tr key={i} tabIndex={0}>
                { rec.map((key, y) => (
                    <td key={"cell-" + i + "-" + y}>{ key }</td>
                )) }
            </tr>
        ));

        return (
            <div ref={ this.wrapper } className="data-grid-wrapper">
                <table className="table table-sm table-hover data-grid">
                    { header }
                    <tbody>{ body }</tbody>
                </table>
            </div>
        )
    }
}
