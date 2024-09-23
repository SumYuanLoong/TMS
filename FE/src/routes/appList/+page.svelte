<script>
	import AppModal from '$lib/AppModal.svelte';

	let showModal = false;

	async function addApp(event) {
		let newApp_name = event.detail.appname
	}
	let apps = [
		{
			id: 1,
			name: '<App_Acronym>',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Some random description......',
			number: '<number>'
		},
		{
			id: 2,
			name: 'App name 2',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Some random description......',
			number: '123'
		}
	];
</script>

<AppModal bind:showModal on:newApp={addApp}>
	<h2 slot="header">Create Application</h2>
</AppModal>

<div class="container">
	<div class="actions">
		<button on:click={() => (showModal = true)}>Create app</button>
	</div>
	<div class="app-list">
		{#each apps as app}
			<div class="app-card">
				<h2>{app.name}</h2>
				<p>{app.description}</p>
				<p>{app.number}</p>
				<button on:click={() => console.log(`Viewing app ${app.id}`)}>View</button>
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
		width: 80%;
		margin: auto;
		padding: 20px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		font-family: Arial, sans-serif;
	}

	.app-list {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
	}
	.app-card {
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: 5px;
		text-align: left;
	}

	.app-card p {
		margin: 10px 0;
	}

	button {
		padding: 10px 20px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		margin: 10px;
	}
</style>
