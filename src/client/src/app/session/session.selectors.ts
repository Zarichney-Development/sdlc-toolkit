import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SessionState } from './session.reducer';
import { selectCurrentTool } from '../tool/tool.selectors';

export const selectSessionState = createFeatureSelector<SessionState>('sessionState');
export const selectSessions = createSelector(selectSessionState, (state: SessionState) => state.sessions);
// Selector to get the current session based on the current tool
export const selectCurrentSession = createSelector(
    selectSessions,
    selectCurrentTool,
    (sessions, currentTool) => sessions.find(session => session.toolId === currentTool?.id)
);
export const selectSessionResponses = createSelector(selectSessionState, (state: SessionState) => state.responses);
export const selectSessionLoaded = createSelector(selectSessionState, (state: SessionState) => state.loaded);
