import { createAction, props } from '@ngrx/store';

export const setUserId = createAction('[User] Set UserId', props<{ userId: string }>());
