import { createAction, props } from '@ngrx/store';
import { Tool } from './tool.model';

export const loadTools = createAction('[Catalog] Load Tools', props<{ role: number | null, category: number | null }>());
export const loadToolsSuccess = createAction('[Catalog] Load Tools Success', props<{ tools: Tool[] }>());
export const loadToolsFailure = createAction('[Catalog] Load Tools Failure', props<{ error: any }>());

export const loadTool = createAction('[Tool] Load Tool', props<{ toolId: number }>());
export const loadToolSuccess = createAction('[Tool] Load Tool Success', props<{ tool: Tool }>());
export const loadToolFailure = createAction('[Tool] Load Tool Failure', props<{ error: any }>());

export const unloadTool = createAction('[Tool] Unload Tool');
