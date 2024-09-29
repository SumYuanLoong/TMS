<script>
	export let showModal; // boolean
	import { createEventDispatcher } from 'svelte';
	import { axios } from '$lib/config';
	import { toast } from '@zerodevx/svelte-toast';
	import { invalidate } from '$app/navigation';

	const dispatch = createEventDispatcher();

	let dialog; // HTMLDialogElement
	let errMsg = '';
	let errorState = false;
	export let editMode = false;
	export let groups = [];
	export let app_name = '';
	export let rNumber = 1;
	export let description = '';
	export let startDate = '';
	export let endDate = '';
	export let create, open, todo, doing, done;

	$: if (dialog && showModal) dialog.showModal();

	async function btnClick() {
		//TODO: validate app_name
		const appRegex = new RegExp(/^[\w]+$/g);
		if (!appRegex.test(app_name)) {
			//invalid case
			errMsg = 'Invalid App Acronym';
			errorState = true;
			return 0;
		}
		if (!Number.isInteger(rNumber)) {
			errMsg = 'R number is not an integer';
			errorState = true;
			return 0;
		}

		try {
			let res = await axios.post('/tms/apps/create', {
				app_acronym: app_name,
				R_number: rNumber,
				description: description,
				startDate: dateFormating(startDate),
				endDate: dateFormating(endDate),
				permit_create: create,
				permit_open: open,
				permit_todo: todo,
				permit_doing: doing,
				permit_done: done
			});
			if (res.data.success) {
				errorState = false;
				invalidate('app:appList');
				dialog.close();
				app_name = '';
				startDate = '';
				endDate = '';
				rNumber = 1;
				description = '';
			}
		} catch (error) {
			console.log(error.response.data);
			if (error.response.data.message == 'Invalid Credentials') {
				dispatch('auth');
			} else {
				errMsg = error.response.data.message;
				errorState = true;
			}
		}
	}

	async function editClick() {
		try {
			let res = await axios.put('/tms/apps/update', {
				app_acronym: app_name,
				description: description,
				permit_create: create,
				permit_open: open,
				permit_todo: todo,
				permit_doing: doing,
				permit_done: done
			});
			if (res.data.success) {
				invalidate('app:appList');
				app_name = '';
				startDate = '';
				endDate = '';
				rNumber = 1;
				description = '';
				dialog.close();
				dispatch('editApp', {});
			}
		} catch (error) {
			console.log(error.response.data);
			if (error.response.data.message == 'Invalid Credentials') {
				dispatch('auth');
			} else {
				errMsg = error.response.data.message;
				errorState = true;
			}
		}
	}

	function dateFormating(date) {
		const parts = date.split('-');
		const dd = parts[2];
		const mm = parts[1];
		const yyyy = parts[0];
		const formattedDate = `${dd}-${mm}-${yyyy}`;
		return formattedDate;
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => {
		showModal = false;
		errorState = false;
		app_name = '';
		startDate = '';
		endDate = '';
		rNumber = 1;
		description = '';
	}}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<slot name="header" />
		{#if errorState}
			<p class="error">{errMsg}</p>
		{/if}
		<form on:submit|preventDefault={editMode ? editClick : btnClick}>
			<div>
				<label for="new group name">Acronym:</label> <br />
				<input
					type="text"
					placeholder="App Acronym"
					style="width: 100%;"
					bind:value={app_name}
					disabled={editMode}
					required
				/>
			</div>
			<div>
				<label for="new group name"> Description:</label> <br />
				<input type="text" placeholder="App Desc" style="width: 100%;" bind:value={description} />
			</div>
			<div>
				<label for="new group name">R Number:</label> <br />
				<input
					type="number"
					placeholder="0"
					style="width: 100%;"
					bind:value={rNumber}
					disabled={editMode}
					required
				/>
			</div>
			<div>
				<label for="new group name">Start Date:</label> <br />
				<input
					type="date"
					placeholder="Group name"
					style="width: 100%;"
					bind:value={startDate}
					disabled={editMode}
					required
				/>
				<label for="new group name">End Date:</label> <br />
				<input
					type="date"
					placeholder="Group name"
					style="width: 100%;"
					bind:value={endDate}
					disabled={editMode}
					required
				/>
			</div>
			<div>
				<label for="colourPicker">Permit Group</label> <br />
				<div>
					<!-- CREATE-->
					<div>
						<label for="create">Create:</label>
						<select bind:value={create}>
							<option value="">Select group</option>
							{#each groups as group}
								<option value={group}>{group}</option>
							{/each}
						</select>
					</div>
					<!-- OPEN-->
					<div>
						<label for="create">Open:</label>
						<select bind:value={open}>
							<option value="">Select group</option>
							{#each groups as group}
								<option value={group}>{group}</option>
							{/each}
						</select>
					</div>
					<!-- TODO-->
					<div>
						<label for="create">Todo:</label>
						<select bind:value={todo}>
							<option value="">Select group</option>
							{#each groups as group}
								<option value={group}>{group}</option>
							{/each}
						</select>
					</div>
					<!-- DOING-->
					<div>
						<label for="create">Doing:</label>
						<select bind:value={doing}>
							<option value="">Select group</option>
							{#each groups as group}
								<option value={group}>{group}</option>
							{/each}
						</select>
					</div>
					<!-- DONE-->
					<div>
						<label for="create">Done:</label>
						<select bind:value={done}>
							<option value="">Select group</option>
							{#each groups as group}
								<option value={group}>{group}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>

			<button class="submitBtn" type="submit"
				>{#if editMode}
					Update
				{:else}Create App{/if}</button
			>
		</form>
		<!-- svelte-ignore a11y-autofocus -->
		<button on:click={() => dialog.close()}>Close</button>
	</div>
</dialog>

<style>
	dialog {
		max-width: 48em;
		border-radius: 0.2em;
		border: none;
		padding: 0;
		border-radius: 15px;
		width: 1200px;
		height: 36em;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		display: block;
	}
	button {
		background-color: white;
		color: black;
		border-color: #0056b3;
		border-style: solid;
		border-width: 1px;
		padding: 10px;
		cursor: pointer;
		margin: 5px;
		border-radius: 5px;
	}
	.submitBtn {
		background-color: #007bff;
		color: white;
		border: none;
	}
	.error {
		color: white;
		background-color: red;
	}
</style>
