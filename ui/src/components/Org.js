import { Component } from "react";

import Event from "./Event";
import eventhub from "../lib/eventhub";

class OrgEventList extends Component {
    constructor(props) {
        super(props)
    }

    async componentDidMount() {
        const events = (await eventhub.getOrgsEvents(this.props.orgID))
            .map((evt) => {
                return {
                    event: evt,
                    org: this.props.model,
                };
            });
        this.setState({events});
    }

    render() {
        if (!this.state) {
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
        return `/api/orgs/${this.props.orgID}/logo`
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
