<script>
	import { onMount } from 'svelte';
	import { axios } from '$lib/config';
	let users = [];

	onMount(async () => {
		try {
			const res = await axios.get(`/users/getall`);
			if (res.data.success) {
				//save username to stores
				users = res.data.userList;
			}
		} catch (err) {
			console.log(err);
		}
	});

	let newGroups = ''; //change based on what the dropdown requires
	let newUsername = '';
	let newPassword = '';
	let newEmail = '';
	let newActive = false;

	function createUser() {
		const groupsArray = newGroups.split(',').map((g) => g.trim());
		users = [
			...users,
			{
				username: newUsername,
				password: '******', // For simplicity, we'll obfuscate the password in the table
				email: newEmail,
				groups: groupsArray,
				active: newActive
			}
		];

		// Reset form fields
		newUsername = '';
		newPassword = '';
		newEmail = '';
		newGroups = '';
		newActive = false;
	}

	let newGroup = '';

	function addGroup() {
		alert(`New Group: ${newGroup} created`);
		newGroup = '';
	}

	function editUser(index) {
		alert(`Edit user: ${users[index].username}`);
	}
</script>

<div>
	<!-- Create New Group Button -->
	<h2>User Management</h2>
	<button on:click={addGroup}>Create New Group</button>

	<!-- User Table -->
	<table class="user-table">
		<thead>
			<tr>
				<th>Username</th>
				<th>Password</th>
				<th>Email</th>
				<th>Groups</th>
				<th>Active</th>
				<th>Action</th>
			</tr>
		</thead>
		<tbody>
			{#each users as user, index}
				<tr>
					<td>{user.username}</td>
					<td>xxxxxxx</td>
					<td>{user.email}</td>
					<td>{user.groups.join(', ')}</td>
					<td>{user.active ? 'Yes' : 'No'}</td>
					<td><button on:click={() => editUser(index)}>Edit</button></td>
				</tr>
			{/each}
		</tbody>
	</table>

	<form on:submit|preventDefault={createUser}>
		<input type="text" placeholder="Username" bind:value={newUsername} />
		<input type="password" placeholder="Password" bind:value={newPassword} />
		<input type="text" placeholder="Email" bind:value={newEmail} />
		<select bind:value={newGroups}>
			<option value="">Select Group</option>
			<option value="Project Lead">Project Lead</option>
			<option value="Developer">Developer</option>
			<!-- Add more groups as needed -->
		</select>
		<select bind:value={newActive}>
			<option value={true}>Yes</option>
			<option value={false}>No</option>
		</select>
		<button on:click={createUser}>Create User</button>
	</form>
</div>

<style>
	.user-table,
	input,
	select,
	button {
		width: 100%;
		box-sizing: border-box;
	}

	.user-table {
		border-collapse: collapse;
		margin-bottom: 20px;
	}

	th,
	td {
		border: 1px solid #ccc;
		padding: 8px;
		text-align: left;
	}

	th {
		background-color: #f3f3f3;
	}

	button {
		background-color: #007bff;
		color: white;
		border: none;
		padding: 10px;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}
</style>
