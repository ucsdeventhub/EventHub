import "./App.css";
import {
    BrowserRouter as Router,
    withRouter,
    Route,
    Link,
    Switch,
} from "react-router-dom";

import Org from "./components/Org";
import Event from "./components/Event";
import Header from "./components/Header";
import Home from "./components/Home";
import Search from "./components/Search";
import Calendar from "./components/Calendar"

function App() {
  return (
    <Router>
        <Header />
          <main className="content">
              <Switch>
                <Route exact={true} path="/" render={() => (
                    <Home />
                )} />

                <Route path="/events/:eventID/edit" render={({match}) => (
                    <Event edit eventID={match.params.eventID} />
                )} />

                <Route path="/events/:eventID" render={({match}) => (
                    <Event eventID={match.params.eventID} />
                )} />


                <Route path="/orgs/:orgID/edit" render={({match}) => (
                    <Org edit orgID={match.params.orgID} />
                )} />

                <Route path="/orgs/:orgID/new-event" render={({match}) => (
                    <Event newForOrg={match.params.orgID} />
                )} />

                <Route path="/orgs/:orgID" render={({match}) => (
                    <Org orgID={match.params.orgID} />
                )} />

                <Route path="/orgs/" render={() => (
                    <h1>Orgs</h1>
                )} />

                <Route path="/search" render={() => (
                    <Search />
                )} />

                <Route path="/calendar" render={() => (
                    <Calendar />
                )} />

                <Route path="/" render={() => (<h1>Not found!</h1>)} />
            </Switch>
        </main>
    </Router>
  );
}

export default App;
