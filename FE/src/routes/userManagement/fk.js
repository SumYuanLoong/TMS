import { axios } from '$lib/config';

export async function load() {
	try {
		const res = await axios.get(`/users/getall`);
		if (res.data.success) {
			console.log(res.data);
			//save username to stores
			return {
				users: res.data.userList
			};
		}
	} catch (err) {
		console.log(err);
	}
	return { random: 'test' };
}
