import { createAction, props } from '@ngrx/store';
import { Category } from './category.model';

export const loadCategories = createAction('[Catalog] Load Categories');
export const loadCategoriesSuccess = createAction('[Catalog] Load Categories Success', props<{ categories: Category[] }>());
export const loadCategoriesFailure = createAction('[Catalog] Load Categories Failure', props<{ error: any }>());
