<script>
	import { page } from '$app/stores';
	import { afterUpdate, onMount } from 'svelte';
	import { axios } from '$lib/config';
	import { goto } from '$app/navigation';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { title } from '$lib/stores';

	let username = '';
	let pass = false;
	let isAdmin = false;
	$: pagename = $title;

	async function loadNavbar() {
		try {
			const res = await axios.get(`/auth`);
			// check admin and redirect if cannot
			if ($page.url.pathname.startsWith('/userManagement') && !res.data.is_admin) {
				goto('/appList');
			}
			// place name
			if (res.data.success) {
				username = res.data.username;
				isAdmin = res.data.is_admin;
				pass = true;
			}
		} catch (err) {
			//token not there
			console.log(err);
			goto('/login');
		}
	}

	afterUpdate(() => {
		if ($page.url.pathname.startsWith('/login') || $page.url.pathname.startsWith('/logout')) {
			pass = true;
		} else {
			loadNavbar();
		}
	});

	// function updateParentVariable(newVal) {
	// 	parentVariable = newVal;
	// }
</script>

<SvelteToast />
{#if pass}
	{#if $page.url.pathname.startsWith('/login') || $page.url.pathname.startsWith('/logout')}
		<slot />
	{:else}
		<nav>
			<h2 class="Title">{pagename}</h2>
			<div class="profile-container">
				<div class="dropdown-container">
					<img src="/user.png" alt="personal logo" />
					<div class="dropdown-content">
						<a href="/userProfile">User Profile</a>
						{#if isAdmin}<a href="/userManagement">User Management</a>{/if}
						<a href="/logout">Logout</a>
					</div>
				</div>
				<h3 class="username">{username}</h3>
			</div>
		</nav>
		<slot />
	{/if}
{/if}

<style>
	.Title {
		float: left;
		margin: 20px;
	}
	nav {
		background-color: #d9d9d9;
		padding: 10px;
	}
	img {
		width: 50px;
	}
	.dropdown-container {
		position: relative;
		display: inline-block;
		padding: 0 15px;
	}
	.profile-container {
		display: flex;
		flex-direction: row-reverse;
	}
	.dropdown-container:hover .dropdown-content {
		display: block;
		background-color: aliceblue;
		border: 1px;
		border-color: black;
	}
	.dropdown-container:hover .dropdown-content a {
		border-width: 1px;
		border-color: black;
	}

	a:hover {
		background-color: aquamarine;
	}
	.dropdown-content {
		display: none;
		position: absolute;
		right: 0;
		z-index: 1;
		min-width: 160px;
	}
	:global(body) {
		margin: 0;
		padding: 0;
	}
	.dropdown-content a {
		color: black;
		padding: 12px 16px;
		text-decoration: none;
		display: block;
	}
	:root {
		--toastContainerTop: auto;
		--toastContainerRight: auto;
		--toastContainerBottom: 2rem;
		--toastContainerLeft: 2rem;
		--toastBackground: #4bb543;
		--toastBarBackground: #3b8f35;
		--toastBarHeight: 0;
	}

	:global(.error-toast) {
		--toastBackground: #ff1a1a;
		--toastBarBackground: #e60000;
	}
</style>
