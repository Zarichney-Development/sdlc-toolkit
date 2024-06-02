import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RoleState } from './role.reducer';

export const selectRoleState = createFeatureSelector<RoleState>('roleState');

export const selectAllRoles = createSelector(
  selectRoleState,
  (state: RoleState) => state.roles
);

export const selectRolesLoading = createSelector(
  selectRoleState,
  (state: RoleState) => state.loading
);

export const selectRolesError = createSelector(
  selectRoleState,
  (state: RoleState) => state.error
);
