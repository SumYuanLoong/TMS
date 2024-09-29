<script>
	export let showTaskModal; // boolean
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let dialog; // HTMLDialogElement
	export let planName = '';
	export let plans = [];
	export let flagPlan = false;
	export let flagNone = true;
	export let flagNotes = false;
	export let taskState = '';
	export let taskID = '';
	export let taskName = '';
	export let taskNotes = '';
	export let taskDescription = '';
	export let taskCreator = '';
	export let taskOwner = '';
	export let taskCreatedDate = '';

	let newNotes = '';
	let errorState = false;
	let errMsg = '';

	$: if (dialog && showTaskModal) dialog.showModal();

	function btnClick() {
		dispatch('newPlan', {
			planName: planName
		});
		planName = '';
	}
</script>

<dialog
	bind:this={dialog}
	on:close={() => {
		showTaskModal = false;
		errorState = false;
	}}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<slot name="header" />
		{#if errorState}
			<p class="error">{errMsg}</p>
		{/if}
		<form on:submit|preventDefault={btnClick}>
			<div>
				<p style="width: 100%;">ID : {taskID}</p>
			</div>
			<div>
				<p style="width: 100%;">Name : {taskName}</p>
			</div>
			<div>
				<label for="new group name">Description:</label> <br />
				<textarea style="width: 100%;" bind:value={taskDescription} rows="6" />
			</div>
			<div>
				<p style="width: 100%;">State : {taskState}</p>
			</div>

			<div>
				<label for="create">Plan:</label>
				<select bind:value={planName} disabled={flagPlan}>
					<option value="">Select group</option>
					{#each plans as plan}
						<option value={plan}>{plan}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="new group name">Start Date:</label> <br />
				<p>{taskNotes}</p>
				<textarea style="width: 100%;" bind:value={newNotes} disabled={flagNotes} />
			</div>
			<button class="submitBtn" type="submit">Save</button>
			<button class="submitBtn" type="submit">Demote</button>
			<button class="submitBtn" type="submit">Promote</button>
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
