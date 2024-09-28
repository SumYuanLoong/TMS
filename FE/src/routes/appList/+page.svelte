<script>
	import { goto } from '$app/navigation';
	import AppModal from '$lib/AppModal.svelte';
	import { axios } from '$lib/config';
	import { app_name } from '$lib/stores.js';
	import { onMount } from 'svelte';

	export let data;
	let showModal = false;
	let editMode = false;
	$: apps = data.apps;
	$: PL = data.isPL;
	$: groups = data.groups;

	function print() {
		console.log(apps);
	}

	function navigate(selected_app) {
		// add app selected into the stores
		// navigate to the kanban page
		app_name.set(selected_app);
		goto('/kanban');
	}

	async function addApp(event) {
		let app_name = event.detail.app_name;
		let rNumber = event.detail.rNumber;
		//TODO: validate app_name
		//TODO: validate rNumber

		try {
			let res = await axios.post('/tms/apps/create', {
				app_acronym: app_name,
				R_number: rNumber,
				description: event.detail.description,
				startDate: event.detail.startDate,
				endDate: event.detail.endDate
			});
			if (res.data.success) {
				apps = [
					...apps,
					{
						name: app_name,
						description: event.detail.description,
						number: rNumber
					}
				];
			}
		} catch (error) {
			console.log(error.response.data);
		}
	}

	async function startEdit(id) {
		// do things here to the appModal
		try {
			let res = await axios.post('/tms/apps/getOne', {
				app_acronym: id
			});
			if (res.data.success) {
				showModal = true;
				editMode = true;
			}
		} catch (error) {
			if (error.response.data.message == 'Invalid Credentials') {
				goto('/login');
			}
			console.log(error.response.data);
		}
	}

	async function editApp(event) {
		editMode = false;
	}

	onMount(async () => {
		console.log(groups);
	});
</script>

<AppModal bind:showModal on:newApp={addApp} {groups} {editMode}>
	<h2 slot="header">Create Application</h2>
</AppModal>

<div class="container">
	{#if PL}
		<div class="actions">
			<button on:click={() => (showModal = true)} style="margin:10px">Create app</button>
		</div>
	{/if}

	<div class="app-list">
		{#each apps as app, index}
			<div class="app-card">
				<h2>{app.app_acronym}</h2>
				<p>{app.app_description}</p>
				<p>{app.app_Rnumber}</p>
				<button on:click={() => navigate(app.app_acronym)}>View</button>
				{#if PL}<button on:click={() => startEdit(app.app_acronym)} class="editBtn">Edit</button
					>{/if}
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
	}
	.editBtn {
		background-color: white;
		color: black;
		border-color: #0056b3;
		border-style: solid;
		border-width: 1px;
	}
</style>
