import React                    from "react";
import { BrowserRouter } from "react-router-dom";
import { Route, Redirect } from "react-router-dom";
import Header                   from "../Header";
import ReportPage               from "../ReportPage";
import MeasuresPage             from "../MeasuresPage";
import LoginPage                from "../LoginPage";
import                               "./App.scss";
// import { Provider }             from "react-redux";
// import store                    from "../../store";
import { connect } from "react-redux";

function PrivateRoute({ user, component: Component, ...rest }) {
    return (
        <Route {...rest} render={ props => (
            user ?
                <Component {...props} /> :
                <Redirect to={{
                    pathname: "/login",
                    state: { from: props.location }
                }} />
        ) } />
    );
}

function CPR(props) {
    const Component = connect(state => ({
        ...props,
        user: state.auth.currentUser
    }))(PrivateRoute);

    return <Component {...props}/>;
}

class App extends React.Component
{
    render() {
        return (
            <BrowserRouter>
            <div className="App">
                <Header
                    user={ this.props.user }
                    loading={ this.props.loading }
                    dispatch={ this.props.dispatch }
                />
                <div className="container" style={{ marginTop: 30 }}>
                    <CPR path="/"         component={ReportPage} exact />
                    <CPR path="/report"   component={ReportPage} />
                    <CPR path="/measures" component={MeasuresPage} />
                    <Route path="/login"  component={LoginPage} />
                </div>
            </div>
            </BrowserRouter>
        );
    }
}

export default connect(state => ({
    user: state.auth.currentUser,
    loading: state.auth.loading
}))(App);
