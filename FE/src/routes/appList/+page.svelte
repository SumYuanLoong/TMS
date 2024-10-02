<script>
	import { goto, invalidate } from '$app/navigation';
	import AppModal from '$lib/AppModal.svelte';
	import { axios } from '$lib/config';
	import { app_name } from '$lib/stores.js';
	import { onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast';

	export let data;
	let showModal = false;
	let showEModel = false;
	let editMode = false;
	let editData = {};
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

	async function startEdit(id) {
		// do things here to the appModal
		try {
			let res = await axios.post('/tms/apps/getOne', {
				app_acronym: id
			});
			if (res.data.success) {
				showEModel = true;
				editMode = true;
				editData = res.data.applist[0];
				editData.App_startDate = dateFormating(res.data.applist[0].App_startDate);
				editData.App_endDate = dateFormating(res.data.applist[0].App_endDate);
			}
		} catch (error) {
			if (error.response.data.message == 'Invalid Credentials') {
				goto('/login');
				toast.push('Invalid Credentials', { classes: ['error-toast'], duration: 3000 });
			}
			console.log(error.response.data);
		}
	}

	function dateFormating(date) {
		const parts = date.split('-');
		const dd = parts[0];
		const mm = parts[1];
		const yyyy = parts[2];
		const formattedDate = `${yyyy}-${mm}-${dd}`;
		return formattedDate;
	}

	async function editApp(event) {
		editMode = false;
	}

	async function authRedirect(params) {
		invalidate('app:appList');
	}

	onMount(async () => {
		//console.log(groups);
	});
</script>

<AppModal bind:showModal {groups}>
	<h2 slot="header">Create Application</h2>
</AppModal>
<AppModal
	bind:showModal={showEModel}
	on:editApp={editApp}
	on:auth={authRedirect}
	{groups}
	{editMode}
	app_name={editData.App_Acronym}
	rNumber={editData.App_Rnumber}
	description={editData.App_Description}
	startDate={editData.App_startDate}
	endDate={editData.App_endDate}
	create={editData.App_permit_Create}
	open={editData.App_permit_Open}
	todo={editData.App_permit_Todo}
	doing={editData.App_permit_Doing}
	done={editData.App_permit_Done}
>
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
				<p>R number: {app.app_Rnumber}</p>
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
