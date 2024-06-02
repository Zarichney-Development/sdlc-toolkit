import { createReducer, on } from '@ngrx/store';
import { loadRoles, loadRolesSuccess, loadRolesFailure } from './role.actions';
import { Role } from './role.model';

export interface RoleState {
  roles: Role[];
  loading: boolean;
  error: any;
}

export const initialState: RoleState = {
  roles: [],
  loading: false,
  error: null
};

export const roleReducer = createReducer(
  initialState,
  on(loadRoles, state => ({ ...state, loading: true })),
  on(loadRolesSuccess, (state, { roles }) => ({ ...state, loading: false, roles })),
  on(loadRolesFailure, (state, { error }) => ({ ...state, loading: false, error }))
);
