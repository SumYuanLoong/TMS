<script>
	export let showCreateModal; // boolean
	import { createEventDispatcher } from 'svelte';
	import MultiSelect from 'svelte-multiselect';
	const dispatch = createEventDispatcher();

	export let plans;
	let dialog; // HTMLDialogElement
	let taskName = '';
	let taskDesc = '';
	let planName = [];
	let taskNotes = '';

	$: if (dialog && showCreateModal) dialog.showModal();

	function btnClick() {
		dispatch('newTask', {
			planName: planName[0],
			taskName: taskName,
			taskNotes: taskNotes,
			taskDesc: taskDesc
		});
		//planName = [];
		//taskDesc = '';
		//taskNotes = '';
		//taskName = '';
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => (showCreateModal = false)}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation class="container">
		<slot name="header" />
		<form on:submit|preventDefault={btnClick}>
			<div>
				<label for="Task Name">Name:</label> <br />
				<input type="text" placeholder="Group name" style="width: 100%;" bind:value={taskName} />
			</div>
			<div>
				<label for="Task Desc">Description</label> <br />
				<textarea bind:value={taskDesc} maxlength="255" rows="6" />
			</div>
			<div>
				<label for="Task is of Plan">Plan</label> <br />
				<MultiSelect options={plans} bind:selected={planName} maxSelect={1}></MultiSelect>
			</div>
			<div>
				<label for="Task Notes">Notes</label> <br />
				<textarea bind:value={taskNotes} rows="6" />
			</div>

			<button class="submitBtn" type="submit">Create Task</button>
		</form>
		<!-- svelte-ignore a11y-autofocus -->
		<button on:click={() => dialog.close()} class="close">Close</button>
	</div>
</dialog>

<style>
	div {
		display: flex;
		flex-direction: row;
		align-items: baseline;
	}
	.container {
		display: block;
	}
	input,
	label {
		margin: 0.5em;
		display: inline;
		height: 2em;
	}
	input {
		border-radius: 0.2em;
		border-style: solid;
		border-width: 1px;
	}
	dialog {
		max-width: 36em;
		border-radius: 0.2em;
		border: none;
		padding: 0;
		border-radius: 15px;
		width: 36em;
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
	/* Form styles */
	form {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	/* Label and input styles */
	label {
		display: inline-block;
	}

	input,
	textarea {
		width: 100%;
		padding: 5px;
		border: 1px solid #ccc;
		border-radius: 3px;
	}

	/* Button styles */
	button {
		padding: 10px 20px;
		background-color: #007bff;
		color: #fff;
		border: none;
		border-radius: 3px;
		cursor: pointer;
	}

	button:hover {
		background-color: #0069d9;
	}

	/* Close button styles */
	button.close {
		background-color: #cccccc;
		color: #000;
	}

	/* Other styles (adjust as needed) */
	.submitBtn {
		background-color: #007bff;
		color: #fff;
	}
</style>
