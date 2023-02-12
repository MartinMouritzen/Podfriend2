export const createUserSlice = (set,get) => ({
	loggedIn: false,
	userData: false,
	authToken: false,
	authTokenReceived: (authToken) => {
		set({
			authToken: authToken
		});
	},
	userNotLoggedIn: () => {
		set({
			loggedIn: false,
			authToken: false,
			userData: false
		});
	},
	authenticateUser: () => {
		var { authToken } = getState().authToken;

		if (authToken) {
			return fetch("https://api.podfriend.com/authenticate/", {
				method: "GET",
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': `Bearer ${authToken}`
				}
			})
			.then((resp) => {
				return resp.json()
			})
			.then((data) => {
				if (data.message || data.error) {
					// An error will occur if the token is invalid.
					// If this happens, you may want to remove the invalid token.
					// localStorage.removeItem("authToken")
					console.log('error loggin user in.');
					console.log(data);
					console.log('token: ' + authToken);
					get().userNotLoggedIn();
				}
				else {
					dispatch(userLoggedIn(data))
				}
			})
			.catch((error) => {
				console.log('error loggin user in.');
				console.log(error);
			});
		}
		else {
			get().userNotLoggedIn();
		}
	},
	checkIfUsernameExists: (username) => {
		if (!username) {
			return false;
		}
		var url = "https://api.podfriend.com/user/?username=" + username;

		return fetch(url, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		})
		.then((resp) => {
			return resp.json()
		})
		.then((data) => {
			if (data.exists) {
				return true;
			}
			else {
				return false;
			}
		});
	},
	createUser: (username,password,email) => {
		var url = "https://api.podfriend.com/user/";
		
		var formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('email', email);

		return fetch(url, {
			method: 'POST',
			headers: {
				'Accept': 'application/json'
			},
			body: formData
		})
		.then((resp) => {
			return resp.json()
		})
		.then((data) => {
			if (data.errorMessage) {
				return Promise.reject('Error happened while creating user. This might not be your fault. The server returned: ' + data.errorMessage);
			}
			else {
				console.log(data);
				return data;
			}
		})
		.catch((error) => {
			alert('Error happened while creating user.');
			console.log('Error happened while creating user.');
			console.log(error);
		});
	}
});