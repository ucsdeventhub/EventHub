import { Component } from "react";

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

export default class Org extends Component {
    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        console.log("eventhub: ", eventhub);
        const org = await eventhub.getOrg(this.props.orgID);
        this.setState(org);
    }

    imgSrc() {
        return `/api/orgs/${this.state.id}/logo`
    }

    render() {
        if (!this.state) {
            return <div/>;
        }

        return (
            <div>
                <img src={this.imgSrc()} className="org-logo" />
                <h1>{this.state.name}</h1>
                <p>{this.state.description}</p>
                <OrgEventList model={this.state} />
            </div>
        );
    }
}
