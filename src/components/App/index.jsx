import React               from "react";
import { BrowserRouter }   from "react-router-dom";
import { Route, Redirect } from "react-router-dom";
import { connect }         from "react-redux";
import PropTypes           from "prop-types";
import Header              from "../Header";
import ReportPage          from "../ReportPage";
import MeasuresPage        from "../MeasuresPage";
import LoginPage           from "../LoginPage";
import                          "./App.scss";

class PrivateRoute extends React.Component
{
    static propTypes = {
        user: PropTypes.object,
        component: PropTypes.any
    };

    render() {
        const { user, component: Component, ...rest } = this.props;
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
    static propTypes = {
        user: PropTypes.object,
        loading: PropTypes.bool,
        dispatch: PropTypes.func
    };

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
                        <CPR path="/"           component={ReportPage} exact />
                        <CPR path="/report"     component={ReportPage} />
                        <CPR path="/measures"   component={MeasuresPage} />
                        <Route path="/login"    component={LoginPage} />
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
