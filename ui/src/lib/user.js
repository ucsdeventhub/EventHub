

const lib = {
	get: () => {
		let user = JSON.parse(localStorage.getItem("user"));

		if (!user) {
			// todo get user via api
		}

		return user
	},

	set: (user) => {
		// todo: validation
		localStorage.setItem("user", JSON.stringify(user));

		// todo set the user via api
	},

	del: () => {
		localStorage.removeItem("user");
	}
};

// debugging

window.removeUser = () => lib.del();
window.getUser = () => lib.get();
window.setDefaultUser = () => lib.set({
	id: 1,
	email: "abc@ucsd.edu",
	tokenVersion: 1,
	tagFavorites: ["asd"],
	orgFavorites: [1, 2],
	eventFavorites: [1, 2],
});


export default lib;
