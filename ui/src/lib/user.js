import eventhub from "../lib/eventhub";

class User {
	async get() {
		let user = JSON.parse(localStorage.getItem("user"));

		if (!user && eventhub.getToken()) {
			// todo get user via
            user = await eventhub.getUsersSelf();
            localStorage.setItem("user", JSON.stringify(user));
            console.log("got user: ", user);
		}

		return user
	}

	async set(user) {
		// todo: validation
		localStorage.setItem("user", JSON.stringify(user));

		// todo set the user via api
        if (eventhub.getToken()) {
            await eventhub.postUser(user);
        }
	}

	del() {
        eventhub.delToken();
		localStorage.removeItem("user");
	}
};

const lib = new User();

// debugging

window.removeUser = () => lib.del();
window.getUser = () => lib.get();
/*
window.setDefaultUser = () => lib.set({
	id: 1,
	email: "abc@ucsd.edu",
	tokenVersion: 1,
	tagFavorites: ["asd"],
	orgFavorites: [1, 2],
	eventFavorites: [1, 2],
});
*/


export default lib;
