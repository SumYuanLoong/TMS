<script>
	import { onMount } from 'svelte';
	import { axios } from '$lib/config';
	import { goto } from '$app/navigation';

	async function onlyThing() {
		let res = await axios.post('/auth/logout');
		if (res.data.success) {
			console.log('logout');
			goto('/login');
		}
	}

	onMount(async () => {
		await onlyThing();
	});
</script>
