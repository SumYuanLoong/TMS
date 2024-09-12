<script>
	import { page } from '$app/stores';
	import axios from 'axios';
</script>

{#if $page.url.pathname.startsWith('/login')}
	<slot />
{:else}
	<nav>test</nav>
	<slot />
{/if}
