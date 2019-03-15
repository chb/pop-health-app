import React     from "react";
import PropTypes from "prop-types";
import                "./DataGrid.scss";

export default class DataGrid extends React.Component
{
    static propTypes = {
        rows: PropTypes.arrayOf(PropTypes.object)
    };

    static defaultProps = {
        rows: [] 
    };

    render()
    {
        const { rows } = this.props;

        if (!rows.length) {
            return <p className="text-center">No data</p>;
        }
    
        const header = (
            <thead>
                <tr>
                { Object.keys(rows[0]).map((key, i) => (
                    <th key={"th-" + i}>{ key }</th>
                )) }
                </tr>
            </thead>
        );

        const body = rows.map((rec, i) => (
            <tr key={i}>
                { Object.keys(rec).map(key => (
                <td key={key + "" + i}>{ rec[key] }</td>
                )) }
            </tr>
        ));

        return (
            <table className="table table-sm table-bordered table-hover data-grid">
                { header }
                <tbody>{ body }</tbody>
            </table>
        )
    }
}
