import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FiltersState {
    selectedTypes: string[]; // Birden fazla tür seçimi
    yearRange: { startYear: string; endYear: string }; // Yıl aralığı
    minRating: string; // IMDb puanı
}

const initialState: FiltersState = {
    selectedTypes: [],
    yearRange: { startYear: '', endYear: '' },
    minRating: '',
};

const filtersSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setSelectedTypes(state, action: PayloadAction<string[]>) {
            state.selectedTypes = action.payload;
        },
        setYearRange(state, action: PayloadAction<{ startYear: string; endYear: string }>) {
            state.yearRange = action.payload;
        },
        setMinRating(state, action: PayloadAction<string>) {
            state.minRating = action.payload;
        },
    },
});

export const { setSelectedTypes, setYearRange, setMinRating } = filtersSlice.actions;
export default filtersSlice.reducer;