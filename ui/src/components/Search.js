import { Fragment, Component } from "react";
// import { Link, withRouter } from "react-router-dom";
import eventhub from "../lib/eventhub";
import queryparser from "../lib/queryparser";

export default class Event extends Component {
    constructor(props) {
        super(props);

        this.state = {
            query: "",
        };

        this.submitQuery = this.submitQuery.bind(this);
    }

    async submitQuery(evt) {
        evt.preventDefault();
        const obj = queryparser.parse(this.state.query);
        let q = obj.filters.reduce((acc, el) => {
            if (el.key === "after" && el.value === "today") {
                el.value = (new Date()).toISOString().slice(0, 10);
            }
            return `${acc}${el.key}=${el.value}&`
        }, "?");

        q += `name=${obj.query}`


        const results = eventhub.getEventsRaw(q);
        this.setState({results, ...this.state});
    }

    render() {
        let results = null;
        if (this.state.results) {
            results = this.state.results.map;
            // TODO
        }

        // TODO: add more suggestions
        return (
            <>
                <form onSubmit={this.submitQuery}>
                    <input
                        name="event-search"
                        type="text"
                        value={this.state.query}
                        onChange={(evt) => {
                            this.setState({
                                query: evt.target.value,
                            });
                        }} />
                    <datalist>
                        <option value="tags:games" />
                        <option value="before:2020-12-30" />
                        <option value="after:today" />
                    </datalist>
                    <input type="submit" />
                </form>
                <li>
                    {results}
                </li>
            </>
        );
    }
}
