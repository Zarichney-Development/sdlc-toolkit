import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CategoryState } from './category.reducer';

export const selectCategoryState = createFeatureSelector<CategoryState>('categoryState');

export const selectAllCategories = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.categories
  );

export const selectCategoriesLoading = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.loading
  );

export const selectCategoriesError = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.error
  );
