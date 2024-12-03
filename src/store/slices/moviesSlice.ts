import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Movie } from '../../types/Movie';

interface MoviesState {
    movies: Movie[];
    totalResults: number;
    loading: boolean;
    error: string | null;
}

const initialState: MoviesState = {
    movies: [],
    totalResults: 0,
    loading: false,
    error: null,
};

const moviesSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {
        fetchMoviesStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchMoviesSuccess(state, action: PayloadAction<{ movies: Movie[]; totalResults: number }>) {
            state.movies = action.payload.movies;
            state.totalResults = action.payload.totalResults;
            state.loading = false;
        },
        fetchMoviesFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const { fetchMoviesStart, fetchMoviesSuccess, fetchMoviesFailure } = moviesSlice.actions;
export default moviesSlice.reducer;