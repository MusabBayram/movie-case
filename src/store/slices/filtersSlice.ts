import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FiltersState {
    searchTerm: string;
    selectedTypes: string[];
    year: string;
    minRating: number;
    page: number;
}

const initialState: FiltersState = {
    searchTerm: 'Pokemon',
    selectedTypes: [],
    year: '',
    minRating: 0,
    page: 1,
};

const filtersSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setSearchTerm(state, action: PayloadAction<string>) {
            state.searchTerm = action.payload;
            state.page = 1;
        },
        setSelectedTypes(state, action: PayloadAction<string[]>) {
            state.selectedTypes = action.payload;
            state.page = 1;
        },
        setYear(state, action: PayloadAction<string>) {
            state.year = action.payload;
            state.page = 1;
        },
        setMinRating(state, action: PayloadAction<number>) {
            state.minRating = action.payload;
            state.page = 1;
        },
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
    },
});

export const { setSearchTerm, setSelectedTypes, setYear, setMinRating, setPage } = filtersSlice.actions;
export default filtersSlice.reducer;