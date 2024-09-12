import axiosO from 'axios';

export const axios = axiosO.create({
	baseURL: 'http://localhost:3000/'
});

axios.defaults.withCredentials = true;

// withCredentials: true,
// headers: {
//     'Access-Control-Allow-Credentials': '*',
//     'Content-Type': 'application/json'
// }
