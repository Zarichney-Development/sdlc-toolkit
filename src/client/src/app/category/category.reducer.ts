import { createReducer, on } from '@ngrx/store';
import { loadCategories, loadCategoriesSuccess, loadCategoriesFailure } from './category.actions';
import { Category } from './category.model';

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: any;
}

export const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null
};

export const categoryReducer = createReducer(
  initialState,
  on(loadCategories, state => ({ ...state, loading: true })),
  on(loadCategoriesSuccess, (state, { categories }) => ({ ...state, loading: false, categories })),
  on(loadCategoriesFailure, (state, { error }) => ({ ...state, loading: false, error }))
);
