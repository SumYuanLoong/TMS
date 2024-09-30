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
	let upButton = '';
	let downButton = '';
	let demoteVisible = false;

	let planChange = false;
	let notesChange = false;

	$: if (dialog && showTaskModal) dialog.showModal();
	$: {
		if (taskState == 'Open') {
			demoteVisible = false;
			upButton = 'Release';
		} else if (taskState == 'Todo') {
			demoteVisible = false;
			upButton = 'Take on';
		} else if (taskState == 'Doing') {
			demoteVisible = true;
			upButton = 'To Review';
			downButton = 'Give up';
		} else if (taskState == 'Done') {
			demoteVisible = true;
			upButton = 'Approve';
			downButton = 'Reject';
		} else {
			demoteVisible = false;
		}
	}

	async function saveClick() {
		dispatch('newPlan', {
			planName: planName
		});
		planName = '';
	}

	async function demoteClick(params) {
		//2 states to manage Doing and Done
		if (taskState == 'Doing') {
			// send to Todo
		} else if (taskState == 'Done') {
			//send to Doing
		}
	}

	async function promoteClick(params) {
		if (taskState == 'Open') {
			if (planChange) {
				//update plan
			}
			if (notesChange) {
				//update Notes
			}
		} else if (taskState == 'Todo') {
		} else if (taskState == 'Doing') {
		} else if (taskState == 'Done') {
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
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
		<form>
			<div class="top_container">
				<div class="left_side">
					<div>
						<p style="width: 100%;">ID : {taskID}</p>
					</div>
					<div>
						<p style="width: 100%;">Name : {taskName}</p>
					</div>
					<div>
						<label for="new group name">Description:</label> <br />
						<textarea style="width: 100%;" bind:value={taskDescription} rows="6" disabled />
					</div>
					<div>
						<p style="width: 100%;">State : {taskState}</p>
					</div>

					<div>
						<label for="create">Plan:</label>
						<select
							bind:value={planName}
							disabled={!flagPlan || flagNone}
							on:change={() => (planChange = true)}
						>
							<option value="">Select group</option>
							{#each plans as plan}
								<option value={plan}>{plan}</option>
							{/each}
						</select>
					</div>
					<div>
						<p style="width: 100%;">Creator : {taskCreator}</p>
					</div>
					<div>
						<p style="width: 100%;">Owner : {taskOwner}</p>
					</div>
					<div>
						<p style="width: 100%;">Created date : {taskCreatedDate}</p>
					</div>
				</div>
				<div class="right_side">
					<label for="new group name">Notes:</label> <br />
					<p class="notes">{taskNotes}</p>
					<textarea
						style="width: 100%;"
						bind:value={newNotes}
						disabled={!flagNotes || flagNone}
						on:change={() => (notesChange = true)}
					/>
				</div>
			</div>
			<div class="bottom_container">
				<!-- TODO: Change the text of the buttons to use the words in the user stories-->
				{#if !flagNone}<button class="submitBtn" on:click={saveClick}>Save</button>{/if}
				{#if demoteVisible && !flagNone}<button class="demoteBtn" on:click={demoteClick}
						>{downButton}</button
					>{/if}
				{#if !flagNone}<button class="promoteBtn" on:click={promoteClick}>{upButton}</button>{/if}
				<!-- svelte-ignore a11y-autofocus -->
				<button on:click={() => dialog.close()}>Close</button>
			</div>
		</form>
	</div>
</dialog>

<style>
	dialog {
		border-radius: 0.2em;
		border: none;
		padding: 0;
		border-radius: 15px;
		width: 72em;
		height: 64em;
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
		width: 8em;
	}
	.submitBtn {
		background-color: #007bff;
		color: white;
		border: none;
	}
	.demoteBtn {
		background-color: red;
		color: white;
		border: none;
	}
	.promoteBtn {
		background-color: green;
		color: white;
		border: none;
	}
	.error {
		color: white;
		background-color: red;
	}
	form {
		flex-direction: column;
		display: flex;
	}
	.top_container {
		display: flex;
		flex-direction: row;
		height: 72em;
		flex: 9;
	}
	.right_side,
	.left_side {
		flex: 1;
		display: flex; /* For vertical alignment within each div */
		flex-direction: column;
		margin: 1em;
	}
	.bottom_container {
		flex: 1;
		display: flex;
		flex-direction: row;
		justify-content: center;
	}
</style>
