import React              from "react";
import DataSourceSelector from "../DataSourceSelector";

export default class Sidebar extends React.Component
{
    render() {
        return (
            <div className="col-3 app-sidebar">
                <DataSourceSelector/>
            </div>
        );
    }
}
