<script>
	import { page } from '$app/stores';
</script>

<!--
Think about how to get if login user is admin
-->
{#if $page.url.pathname.startsWith('/login')}
	<slot />
{:else}
	<nav>Username</nav>
	<slot />
{/if}
