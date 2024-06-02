import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { of } from 'rxjs';
import { switchMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { loadCategories, loadCategoriesSuccess, loadCategoriesFailure } from './category.actions';
import { selectAllCategories } from './category.selectors';
import { AppState } from '../app.state';

@Injectable()
export class CategoryEffects {
  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private apiService: ApiService
  ) {}

  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCategories),
      withLatestFrom(this.store.pipe(select(selectAllCategories))),
      switchMap(([action, categories]) => {
        if (categories.length === 0) {
          // If no categories in store, fetch from API
          return this.apiService.getCategories().pipe(
            map(apiCategories => loadCategoriesSuccess({ categories: apiCategories })),
            catchError(error => of(loadCategoriesFailure({ error })))
          );
        }
        // If categories are already in the store, use them
        return of(loadCategoriesSuccess({ categories }));
      })
    )
  );
}
