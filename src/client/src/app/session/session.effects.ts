import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ApiService } from '../services/api.service';
import { createSession, createSessionSuccess, createSessionFailure, loadSessionResponses, loadSessionResponsesSuccess, loadSessionResponsesFailure, sendPromptSuccess, sendPromptFailure, sendPrompt, fetchLatestSession, fetchLatestSessionSuccess, fetchLatestSessionFailure } from './session.actions';
import { catchError, filter, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../user/user.selectors';
import { selectCurrentTool } from '../tool/tool.selectors';
import { NavigationEnd, Router } from '@angular/router';

@Injectable()
export class SessionEffects {

  constructor(
    private actions$: Actions,
    private router: Router,
    private apiService: ApiService,
    private store: Store
  ) { }

  createSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createSession),
      withLatestFrom(
        this.store.select(selectUser),
        this.store.select(selectCurrentTool),
        this.router.events.pipe(
          filter(event => event instanceof NavigationEnd),
          map(() => this.router.routerState.snapshot.root.firstChild?.params['id'])
        )
      ),
      mergeMap(([action, user, tool, id]) => {

        let toolId = tool?.id ?? id;
        if (!(toolId >= 0)) {
          return of(createSessionFailure({ error: 'Tool ID not found' }));
        }

        return this.apiService.createSession(user.userId, tool?.id!).pipe(
          map(session => createSessionSuccess({ session })),
          catchError(error => of(createSessionFailure({ error })))
        );
      })
    )
  );

  loadSessionResponses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSessionResponses),
      mergeMap(action => this.apiService.getSessionResponses(action.sessionId).pipe(
        map(responses => loadSessionResponsesSuccess({ responses })),
        catchError(error => of(loadSessionResponsesFailure({ error })))
      ))
    )
  );

  sendPrompt$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sendPrompt),
      switchMap(action =>
        this.apiService.sendPrompt(action.sessionId, action.message).pipe(
          map(response => sendPromptSuccess({ response })),
          catchError(error => of(sendPromptFailure({ error })))
        )
      )
    )
  );

  fetchLatestSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchLatestSession),
      mergeMap(action => this.apiService.getLatestSession(action.userId, action.toolId).pipe(
        map(session => fetchLatestSessionSuccess({ session })),
        catchError(error => of(fetchLatestSessionFailure({ error })))
      ))
    )
  );
}
