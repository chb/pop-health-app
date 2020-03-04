import React                    from "react";
import { Provider }             from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store                    from "./store";
import App                   from "./components/App";



export default class Root extends React.Component
{
    render() {
        return (
            <BrowserRouter>
                <Provider store={ store }>
                    <App/>
                </Provider>
            </BrowserRouter>
        );
    }
}

