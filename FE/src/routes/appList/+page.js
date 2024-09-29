import { axios } from '$lib/config';
import { title } from '$lib/stores.js';

let apps = [];
let isPL = false;
let groups = [];

export const load = async ({ depends }) => {
	title.set('App List');
	//insert something to find if user is "PL" group and "PM" group
	depends('app:appList');
	console.log('applist page.js');
	try {
		const res1 = await axios.get('/tms/apps/all');
		if (res1.data.success) {
			apps = res1.data.applist;
		}

		const res2 = await axios.post('/auth/role', {
			role: 'PL'
		});
		if (res2.data.success) {
			isPL = res2.data.authorised;
		}
		if (res2.data.authorised) {
			groups = [];
			console.log('trying to get group');
			let res3 = await axios.get('/groups/getAll');
			if (res3.data.success) {
				res3.data.grouplist.forEach((element) => {
					groups.push(element.group_name);
				});
			}
		}
		return { apps, isPL, groups };
	} catch (error) {
		console.log(error.response);
	}
};

export const ssr = false;
