import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { of } from 'rxjs';
import { switchMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { loadRoles, loadRolesSuccess, loadRolesFailure } from './role.actions';
import { selectAllRoles } from './role.selectors';
import { AppState } from '../app.state';

@Injectable()
export class RoleEffects {
  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private apiService: ApiService
  ) {}

  loadRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadRoles),
      withLatestFrom(this.store.pipe(select(selectAllRoles))),
      switchMap(([action, roles]) => {
        if (roles.length === 0) {
          // If no roles in store, fetch from API
          return this.apiService.getRoles().pipe(
            map(apiRoles => loadRolesSuccess({ roles: apiRoles })),
            catchError(error => of(loadRolesFailure({ error })))
          );
        }
        // If roles are already in the store, use them
        return of(loadRolesSuccess({ roles }));
      })
    )
  );
}
