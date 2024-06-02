import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AppState } from "../app.state";
import { Store, select } from "@ngrx/store";
import { setUserId } from "./user.actions";
import { tap, withLatestFrom } from "rxjs";
import { selectCurrentTool } from "../tool/tool.selectors";
import { createSession } from "../session/session.actions";

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private store: Store<AppState>
  ) { }

  setUserId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setUserId),
      tap(action => {
        this.store.dispatch(createSession());
      })
    ),
    { dispatch: false }
  );

}
