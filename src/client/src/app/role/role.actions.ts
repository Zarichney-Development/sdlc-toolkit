import { createAction, props } from '@ngrx/store';
import { Role } from './role.model';

export const loadRoles = createAction('[Catalog] Load Roles');
export const loadRolesSuccess = createAction('[Catalog] Load Roles Success', props<{ roles: Role[] }>());
export const loadRolesFailure = createAction('[Catalog] Load Roles Failure', props<{ error: any }>());
