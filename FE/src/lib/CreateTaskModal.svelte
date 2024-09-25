<script>
	export let showCreateModal; // boolean
	import { createEventDispatcher } from 'svelte';
	import MultiSelect from 'svelte-multiselect';
	const dispatch = createEventDispatcher();

	let dialog; // HTMLDialogElement
	let planName = '';
	let startDate = '';
	let endDate = '';
	let color = '';

	$: if (dialog && showCreateModal) dialog.showModal();

	function btnClick() {
		dispatch('newPlan', {
			planName: planName
		});
		planName = '';
		startDate = '';
		endDate = '';
		color = '';
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => (showCreateModal = false)}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<slot name="header" />
		<form on:submit|preventDefault={btnClick}>
			<div>
				<label for="new group name">Name:</label> <br />
				<input type="text" placeholder="Group name" style="width: 100%;" bind:value={planName} />
			</div>
			<div>
				<label for="new group name">Description</label> <br />
				<textarea maxlength="255" />
			</div>
			<div>
				<label for="new group name">Plan</label> <br />
				<MultiSelect options={['something']}></MultiSelect>
			</div>
			<div>
				<label for="colourPicker">Notes</label> <br />
				<textarea />
			</div>

			<button class="submitBtn" type="submit">Create Task</button>
		</form>
		<!-- svelte-ignore a11y-autofocus -->
		<button on:click={() => dialog.close()} class="close">Close</button>
	</div>
</dialog>

<style>
	dialog {
		max-width: 36em;
		border-radius: 0.2em;
		border: none;
		padding: 0;
		border-radius: 15px;
		width: 800px;
		height: 300px;
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
		width: 100%;
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
