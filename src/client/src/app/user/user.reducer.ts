import { createReducer, on } from '@ngrx/store';
import { setUserId } from './user.actions';

export interface UserState {
  userId: string;
}

export const initialState: UserState = {
  userId: 'default'
};

export const userReducer = createReducer(
  initialState,
  on(setUserId, (state, { userId }) => ({ ...state, userId }))
);
