import { Component } from "react";
import { withRouter } from "react-router-dom";

import Event from "./Event";
import eventhub from "../lib/eventhub";

class OrgEventList extends Component {
    constructor(props) {
        super(props)

        if (this.props.model) {
            this.state = {
                org: this.props.model
            };
        }
    }

    async componentDidMount() {
        console.log("state: ", this.state);
        console.log("props: ", this.props);
        if (!this.state) {
            const org = await eventhub.getOrg(this.props.orgID);
            this.setState({org});
        }

        if (!this.state.events) {
            const events = (await eventhub.getOrgsEvents(this.state.org.id))
                .map((evt) => {
                    return {
                        event: evt,
                        org: this.props.model,
                    };
                });
            this.setState({events, ...this.state});
        }
    }

    render() {
        if (!this.state || !this.state.events) {
            return <div/>;
        }

        const events = this.state.events.map((evt, i) => {
            console.log("event model", evt);
            return (
                <li key={i}>
                    <Event preview="wide" model={evt}/>
                </li>
            )
        });

        console.log(events);

        return (
            <ol>
                {events}
            </ol>
        );
    }
};

export default withRouter(class Org extends Component {
    constructor(props) {
        super(props);

        this.handleEditSubmit = this.handleEditSubmit.bind(this);
    }

    async componentDidMount() {
        console.log("eventhub: ", eventhub);
        const org = await eventhub.getOrg(this.props.orgID);
        this.setState(org);

        const sorgs = await eventhub.getOrgsSelf();
        if (sorgs.filter((org1) => org1.id == org.id).length) {
            this.setState({
                editable: true,
                ...this.state,
            });
        }
    }

    handleEditSubmit(evt) {
        evt.preventDefault();

        eventhub.putOrg(this.state);

        this.setState({});
        this.props.history.push(`/orgs/${this.state.id}`);
    }

    edit() {
        return (
            <>
                <h1>
                    Edit: {this.state.name}
                </h1>
                <form id="org-edit-form" onSubmit={this.handleEditSubmit}>
                    <label className="edit-field">Org Name
                        <input
                            name="org-name"
                            type="text"
                            value={this.state.name}
                            onChange={(evt) => {
                                this.state.name = evt.target.value;
                                this.setState({...this.state});
                            }}/>
                    </label>
                    <label className="edit-field">Org Description
                        <input
                            name="org-description"
                            type="text"
                            value={this.state.description}
                            onChange={(evt) => {
                                this.state.description = evt.target.value;
                                this.setState({...this.state});
                            }}/>
                    </label>

                    <input type="submit"/>
                </form>
            </>
        )
    }

    imgSrc() {
        return `/api/orgs/${this.state.id}/logo`
    }

    render() {
        if (!this.state) {
            return <div/>;
        }

        if (this.props.edit) {
            return this.edit()
        }

        if (this.props.newEvent) {
            return
        }

        return (
            <div>
                {this.state.editable && (
                    <a className="edit-link" href={`/orgs/${this.state.id}/edit`}>edit</a>
                )}
                {this.state.editable && (
                    <a className="edit-link" href={`/orgs/${this.state.id}/new-event`}>new event</a>
                )}
                <br/>

                <img src={this.imgSrc()} className="org-logo" />
                <h1>{this.state.name}</h1>
                <p>{this.state.description}</p>
                <OrgEventList model={this.state} />
            </div>
        );
    }
});
