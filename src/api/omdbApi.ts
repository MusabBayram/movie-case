import axios from 'axios';

const API_KEY = process.env.REACT_APP_OMDB_API_KEY;
const omdbApi = axios.create({
    baseURL: 'https://www.omdbapi.com/',
    params: {
        apikey: API_KEY,
    },
});

export default omdbApi;