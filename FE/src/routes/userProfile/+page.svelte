<script>
	import { onMount } from 'svelte';
	import { axios } from '$lib/config';

	let username = 'placeholder username';
	let email = 'placeholder email';
	let newPassword = '';
	let newEmail = '';

	// Function to fetch user data
	async function fetchUserData() {
		try {
			const response = await axios.get('/users/getOneUser');
			console.log(response);
			if (response.status != 200) {
				throw new Error('Network response was not ok');
			}
			username = response.data.user.username;
			email = response.data.user.email;
		} catch (error) {
			console.error('Failed to fetch user data:', error);
		}
	}

	onMount(() => {
		fetchUserData();
	});

	async function handleEmail() {
		try {
			const res = await axios.patch('/users/updateEmail', {
				username: username,
				email: newEmail
			});
			if (res.data.success) {
				console.log(res.data);
				email = newEmail;
				alert('email changed');
			}
		} catch (error) {
			alert('email not changed');
		}
	}

	async function handlePassword() {
		const regex = new RegExp(/((?=.*\d)(?=.*[a-zA-Z])(?=.*[\W\_]).{8,10})/g);
		if (!regex.test(newPassword)) {
			alert(`Please ensure password is aplhanumeric with symbols from 8 to 10 charactes`);
		} else {
			try {
				const response = await axios.patch('/users/updatePassword', {
					username: username,
					password: newPassword
				});
				if (response.data.success) {
					console.log(response.data);
					alert('password changed');
				}
			} catch (err) {
				console.log(err);
				alert('password not changed');
			}
		}
	}
</script>

<div class="container">
	<h2>User details</h2>
	<p>Username: {username}</p>
	<p>Email: {email}</p>

	<form on:submit|preventDefault={handleEmail} action="">
		<div class="form-group">
			<label for="new-email">Update Email</label>
			<input id="new-email" type="email" placeholder={email} bind:value={newEmail} />
		</div>
		<button>Update email</button>
	</form>

	<form on:submit|preventDefault={handlePassword} action="">
		<div class="form-group">
			<label for="new-password">Change Password</label>
			<input
				id="new-password"
				type="password"
				placeholder="New Password"
				bind:value={newPassword}
			/>
		</div>
		<button>Change password</button>
	</form>
</div>

<style>
	.container {
		width: 50%;
		margin: auto;
		padding: 20px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}
	input,
	button {
		width: 100%;
		padding: 8px;
		margin-top: 10px;
	}
	button {
		background-color: #007bff;
	}
	button:hover {
		background-color: #0056b3;
	}
	.form-group {
		display: flex;
		align-items: center;
		margin-top: 10px;
	}
	.form-group label {
		flex: 1 0 120px; /* label width */
	}
	.form-group input {
		flex: 1 0 200px; /* input and button width */
		padding: 8px;
	}
</style>
