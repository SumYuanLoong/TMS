<script>
	import { axios } from '$lib/config';
	import { goto } from '$app/navigation';
	import { toast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	let username = '';
	let password = '';

	const handleLogin = async () => {
		if (!username || !password) {
			toast.push('Invalid Credentials', { classes: ['error-toast'], duration: 3000 });
		} else {
			try {
				const res = await axios.post(`/auth/login`, {
					username: username,
					password: password
				});
				if (res.data.success) {
					console.log(res.data);
					goto('/appList');
				} else {
					toast.push('Invalid Credentials', { classes: ['error-toast'], duration: 3000 });
				}
			} catch (err) {
				toast.push('Invalid Credentials', { classes: ['error-toast'], duration: 3000 });
			}
		}
	};
	onMount(() => {
		console.log('did we just get kicked?');
	});
</script>

<div class="login-container">
	<form on:submit|preventDefault={handleLogin} class="login-form">
		<label for="username">Username: </label>
		<input type="text" placeholder="Username" bind:value={username} />
		<label for="password">Password: </label>
		<input type="password" placeholder="Password" bind:value={password} />
		<button type="submit">Login</button>
	</form>
</div>

<style>
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		width: 300px;
		padding: 20px;
		background: white;
		border-radius: 4px;
	}

	input {
		height: 30px;
		margin: 5px 0px;
		padding: 8px;
		font-size: 16px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	input:focus {
		outline: none;
		border-color: #80bdff;
		box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
	}

	button {
		height: 40px;
		background-color: #007bff;
		color: white;
		font-size: 16px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	button:hover {
		background-color: #0056b3;
	}
</style>
