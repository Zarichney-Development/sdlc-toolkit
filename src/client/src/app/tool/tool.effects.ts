import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { of } from 'rxjs';
import { switchMap, map, catchError, withLatestFrom, tap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { loadTools, loadToolsSuccess, loadToolsFailure, loadToolSuccess, loadToolFailure, loadTool, unloadTool } from './tool.actions';
import { selectAllTools } from './tool.selectors';
import { AppState } from '../app.state';
import { Router } from '@angular/router';

@Injectable()
export class ToolEffects {
  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private apiService: ApiService,
    private router: Router
  ) { }

  loadTools$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTools),
      withLatestFrom(this.store.pipe(select(selectAllTools))),
      switchMap(([action, tools]) => {
        if (tools.length === 0) {
          // If no tools in store, fetch from API
          return this.apiService.getTools(action.role, action.category).pipe(
            map(apiTools => loadToolsSuccess({ tools: apiTools })),
            catchError(error => of(loadToolsFailure({ error })))
          );
        }
        // If tools are already in the store, use them
        return of(loadToolsSuccess({ tools }));
      })
    )
  );

  loadTool$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTool),
      withLatestFrom(this.store.pipe(select(selectAllTools))),
      switchMap(([action, tools]) => {
        const tool = tools.find(tool => tool.id === action.toolId);
        if (!tool) {
          // If the specific tool is not in store, fetch from API
          return this.apiService.getTool(action.toolId).pipe(
            map(apiTool => loadToolSuccess({ tool: apiTool })),
            catchError(error => of(loadToolFailure({ error })))
          );
        }
        // If the tool is already in the store, use it
        return of(loadToolSuccess({ tool: tool }));
      })
    )
  );

  navigateToTool$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadToolSuccess),
      tap(action => this.router.navigate(['/tool', action.tool.id]))
    ),
    { dispatch: false }
  );

  unloadTool$ = createEffect(() =>
    this.actions$.pipe(
      ofType(unloadTool),
      tap(() => this.router.navigate(['/']))
    ),
    { dispatch: false }
  );
}
