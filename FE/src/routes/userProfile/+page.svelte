<script>
	import { onMount } from 'svelte';

	let username = '';
	let email = '';

	// Function to fetch user data
	async function fetchUserData() {
		try {
			const response = await fetch('https://api.yoursite.com/user/details', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
					// Add your authentication headers if required
				}
			});
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			const data = await response.json();
			username = data.username;
			email = data.email;
		} catch (error) {
			console.error('Failed to fetch user data:', error);
		}
	}

	onMount(() => {
		fetchUserData();
	});
</script>

<div class="container">
	<h2>User details</h2>
	<p>Username: {username}</p>
	<p>Email: {email}</p>

	<form action="">
		<div class="form-group">
			<label for="new-email">Update Email</label>
			<input id="new-email" type="email" placeholder={email} />
		</div>
		<button>Update email</button>
	</form>

	<form action="">
		<div class="form-group">
			<label for="new-password">Change Password</label>
			<input id="new-password" type="password" placeholder="New Password" />
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
	.form-group {
		display: flex;
		align-items: center;
		margin-top: 10px;
	}
	.form-group label {
		flex: 1 0 120px; /* label width */
	}
	.form-group input,
	.form-group button {
		flex: 1 0 200px; /* input and button width */
		padding: 8px;
	}
</style>
