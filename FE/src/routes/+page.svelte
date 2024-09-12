<script>
	import axios from 'axios';
	import { onMount } from 'svelte';
	onMount(async () => {
		try {
			const res = await axios.get(`http://localhost:3000/users/getall`, {
				headers: {},
				params: {}
			});
			console.log(res);
		} catch (err) {
			console.log(err);
		}
	});
</script>

<h1>Welcome to SvelteKit</h1>

<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
