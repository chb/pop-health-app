import React     from "react";
import PropTypes from "prop-types";
import                "./DataGrid.scss";

export default class RemoteDataGrid extends React.Component
{
    static propTypes = {
        url: PropTypes.string
    };

    static defaultProps = {
        url: "http://localhost:3003/api/measures/report?limit=1000"
    }

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: null,
            data: null
        };
    }

    componentDidMount()
    {
        fetch(this.props.url)
            .then(res => res.json())
            .then(data => this.setState({
                loading: false,
                data
            }))
            .catch(error => this.setState({
                loading: false,
                error
            }))
    }

    render() {
        const { loading, error, data } = this.state;

        if (loading) {
            return "Loading...";
        }

        if (error) {
            return error.message;
        }

        const downloadUrl = new URL(this.props.url);
        downloadUrl.searchParams.set("type", "csv");

        return (
            <div className="table-wrap">
                <div className="row">
                    <div className="col-6 align-middle">
                        <h5>Results</h5>
                    </div>
                    <div className="col-6 text-right">
                        <a className="btn btn-brand" href={downloadUrl}>EXPORT CSV</a>
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
        super();
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
                headerCells[i].style.width = td.offsetWidth + "px";
            })
        }
    }

    render()
    {
        const { rows, cols } = this.props;

        if (!rows.length) {
            return <p className="text-center">No data</p>;
        }
    
        // const sum = cols.reduce((total, c) => total + c.length, 0);

        // const colGroup = (
        //     <colgroup>
        //     {
        //         cols.map((key, i) => (
        //             <col key={"col-" + i} style={ i ? {
        //                 width: (key.length / sum * 100) + "%"
        //             } : null }/>
        //         ))
        //     }
        //     </colgroup>
        // );

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
            <tr key={i} tabindex={0}>
                { rec.map((key, y) => (
                    <td key={"cell-" + i + "-" + y}>{ key }</td>
                )) }
            </tr>
        ));

        return (
            <div ref={ this.wrapper }>
                <div className="data-grid-header">
                    <table className="table table-sm table-bordered table-hover data-grid">
                        {/* { colGroup } */}
                        { header }
                    </table>
                </div>
                <div className="data-grid-body">
                    <table className="table table-sm table-bordered table-hover data-grid">
                        {/* { colGroup } */}
                        <tbody>{ body }</tbody>
                    </table>
                </div>
            </div>
        )
    }
}
