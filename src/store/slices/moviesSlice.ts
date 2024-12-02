import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MoviesState {
    movies: any[];
    totalResults: number;
}

const initialState: MoviesState = {
    movies: [],
    totalResults: 0,
};

const moviesSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {
        setMovies(state, action: PayloadAction<{ movies: any[]; totalResults: number }>) {
            state.movies = action.payload.movies;
            state.totalResults = action.payload.totalResults;
        },
    },
});

export const { setMovies } = moviesSlice.actions;
export default moviesSlice.reducer;