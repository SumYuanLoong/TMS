<script>
	export let showPlanModal; // boolean
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let dialog; // HTMLDialogElement
	export let planName = '';
	export let startDate = '';
	export let endDate = '';
	export let editMode = false;
	export let color = '';

	$: if (dialog && showPlanModal) dialog.showModal();

	function convertDateFormat(dateString) {
		const [year, month, day] = dateString.split('-');
		return `${day}-${month}-${year}`;
	}
	function print() {
		console.log(color);
	}
	function btnClick() {
		//do data validation here

		dispatch('newPlan', {
			planName: planName,
			startDate: convertDateFormat(startDate),
			endDate: convertDateFormat(endDate),
			color
		});
		planName = '';
		startDate = '';
		endDate = '';
		dialog.close();
	}
	function updateClick() {
		//do data validation here

		dispatch('updatePlan', {
			planName: planName,
			startDate: convertDateFormat(startDate),
			endDate: convertDateFormat(endDate),
			color
		});
		planName = '';
		startDate = '';
		endDate = '';
		dialog.close();
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => {
		showPlanModal = false;
		color = '#' + Math.floor(Math.random() * 16777215).toString(16);
		dispatch('closePlan');
	}}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation class="container">
		<slot name="header" />
		<form>
			<div>
				<label for="new group name">Name:</label>
				<input
					type="text"
					placeholder="Plan Name"
					style="width: 60%;"
					bind:value={planName}
					disabled={editMode}
				/>
			</div>
			<div>
				<label for="new group name">Start Date:</label>
				<input type="date" bind:value={startDate} />
			</div>
			<div>
				<label for="new group name">End Date:</label>
				<input type="date" bind:value={endDate} />
			</div>
			<div>
				<label for="colourPicker">Colour</label>
				<input type="color" bind:value={color} on:change={print} class="colour_pick" />
			</div>

			<button on:click|preventDefault={editMode ? updateClick : btnClick} class="submitBtn"
				>{editMode ? 'Update Plan' : 'Create Plan'}</button
			>
			<button on:click={() => dialog.close()}>Close</button>
		</form>
		<!-- svelte-ignore a11y-autofocus -->
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
		border-radius: 0.2em;
		border: none;
		padding: 0;
		border-radius: 15px;
		width: 36em;
		height: 24em;
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
		display: inline;
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
	.colour_pick {
		height: 4em;
		width: 4em;
	}
	.submitBtn {
		background-color: #007bff;
		color: white;
		border: none;
	}
</style>
