'use strict';

const axios = require("axios");

const GET = "GET";
const POST = "POST";
const PUT = "PUT";
const DELETE = "DELETE";

class Client {
	constructor(root) {
		this.root = root;
	}

	getUrl(route) {
		return `${this.root}/api${route}`;
	}

	async request(method, route, auth, body) {

		const url = this.getUrl(route);

		let headers = {};

		if (auth) {
			const token = this.getToken();
			if (!token) {
				throw new Error("token required but user not logged in");
			}

			headers["Authorization"] = `Bearer ${token}`;
		}

		switch (method) {
		case GET:
			if (body) {
				throw new Error("cannot have body in GET request");
			}

			return (await axios.get(url, {
				headers,
			})).data;

		case DELETE:
			if (body) {
				throw new Error("cannot have body in DELETE request");
			}

			return (await axios.delete(url, {
				headers,
			})).data


		case POST:
			return (axios.post(url, {
				url,
				headers,
			})).data;

		case PUT:
			return (axios.put(url, {
				url,
				headers,
			})).data;

		default:
			throw new Error(`unknown method ${method}`);
		}
	}

	async getOrgs(tags, limit, offset) {
		let args = [];

		if (tags && tags.length > 0) {
			args.push(`tags=${tags.join(",")}`);
		}

		if (limit) {
			args.push(`limit=${limit}`);
		}

		if (offset) {
			args.push(`offset=${offset}`);
		}

		let route = "/orgs";

		if (args.length > 0 ) {
			route += `?${args.join("&")}`;
		}

		return await this.request(GET, route);
	}

	async getEvents(orgs, tags, before, after, limit, offset) {
		let args = [];

		if (orgs && orgs.length > 0) {
			args.push(`orgs=${orgs.join(",")}`);
		}

		if (tags && tags.length > 0) {
			args.push(`tags=${tags.join(",")}`);
		}

		if (before) {
			args.push(`before=${before.toISOString().substring(0, 10)}`);
		}

		if (after) {
			args.push(`after=${after.toISOString().substring(0, 10)}`);
		}

		if (limit) {
			args.push(`limit=${limit}`);
		}

		if (offset) {
			args.push(`offset=${offset}`);
		}

		let route = "/events";

		if (args.length > 0 ) {
			route += `?${args.join("&")}`
		}

		return await this.request(GET, route);
	}
}

const c = new Client("http://localhost:8080");

// print promise
const pp = (p) => {
	p.then(console.log);
}

pp(c.getOrgs(["greek"]));

pp(c.getEvents([1, 2], ["gaming"]));





