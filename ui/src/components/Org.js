import { Component } from "react";

import Event from "./Event";

class OrgEventList extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.setState({
            events: [
                {
                    event: {
                        id: 1,
                        name: "event name 1",
                        orgID: 2,
                        description: "event description",
                        startTime: new Date(),
                        endTime: new Date(),
                        tags: ["gaming", "greek"],
                        location: "price center",
                        created: new Date(),
                        updated: new Date(),
                    },
                    org: {
                        name: "org name",
                    },
                },
                {
                    event: {
                        id: 1,
                        name: "event name 2",
                        orgID: 2,
                        description: "event description",
                        startTime: new Date(),
                        endTime: new Date(),
                        tags: ["gaming", "greek"],
                        location: "price center",
                        created: new Date(),
                        updated: new Date(),
                    },
                    org: {
                        name: "org name",
                    },
                },
            ]
        });
    }


    render() {
        if (!this.state) {
            return <div/>;
        }

        console.log(this.state);

        const events = this.state.events.map((evt) => {
            return (<li><Event preview="wide" model={evt}/></li>)
        });


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

    componentDidMount() {
        this.setState({
            name: "org name"
        });
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
                <OrgEventList orgID={this.props.orgID} />
            </div>
        );
    }
}
