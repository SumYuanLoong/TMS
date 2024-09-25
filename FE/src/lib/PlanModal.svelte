<script>
	export let showPlanModal; // boolean
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let dialog; // HTMLDialogElement
	let planName = '';
	let startDate = '';
	let endDate = '';
	let color = 'red';

	$: if (dialog && showPlanModal) dialog.showModal();

	function convertDateFormat(dateString) {
		const [year, month, day] = dateString.split('-');
		return `${day}-${month}-${year}`;
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
		color = 'red';
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => (showPlanModal = false)}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<slot name="header" />
		<form on:submit|preventDefault={btnClick}>
			<div>
				<label for="new group name">Name:</label> <br />
				<input type="text" placeholder="Plan Name" style="width: 100%;" bind:value={planName} />
			</div>
			<div>
				<label for="new group name">Start Date:</label> <br />
				<input type="date" bind:value={startDate} />
			</div>
			<div>
				<label for="new group name">End Date:</label> <br />
				<input type="date" bind:value={endDate} />
			</div>
			<div>
				<label for="colourPicker">Colour</label> <br />
				<picture />
			</div>

			<button class="submitBtn" type="submit">Create Plan</button>
		</form>
		<!-- svelte-ignore a11y-autofocus -->
		<button on:click={() => dialog.close()}>Close</button>
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
</style>
