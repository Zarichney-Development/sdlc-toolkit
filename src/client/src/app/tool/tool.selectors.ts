import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ToolState } from './tool.reducer';
import { Tool } from './tool.model';

export const selectToolState = createFeatureSelector<ToolState>('toolState');

export const selectAllTools = createSelector(
  selectToolState,
  (state: ToolState) => state.tools
);

export const selectToolsLoading = createSelector(
  selectToolState,
  (state: ToolState) => state.loading
);

export const selectToolsError = createSelector(
  selectToolState,
  (state: ToolState) => state.error
);

export const selectToolLoaded = createSelector(
  selectToolState,
  (state: ToolState) => state.loaded
)

export const selectToolStates = createSelector(selectToolState, (state: ToolState) => state);
export const selectCurrentTool = createSelector(selectToolState, (state: ToolState) => state.currentTool);
