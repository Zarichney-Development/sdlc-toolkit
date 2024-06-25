import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SessionState } from './session.reducer';
import { selectCurrentTool } from '../tool/tool.selectors';
import { Session } from './session.model';

export const selectSessionState = createFeatureSelector<SessionState>('sessionState');
export const selectSessions = createSelector(selectSessionState, (state: SessionState) => state.sessions);

// Selector to get the current session based on the current tool
export const selectCurrentSession = createSelector(
    selectSessions,
    selectCurrentTool,
    (sessions, currentTool) => sessions.find(session => session.toolId === currentTool?.id!)
);
export const selectSessionResponses = createSelector(
    selectSessionState,
    selectCurrentSession,
    (state: SessionState, session: Session | undefined) => 
        state.responses
                .filter(r => r.sessionId === session?.id)
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
);
export const selectSessionLoading = createSelector(selectSessionState, (state: SessionState) => state.loading);
export const selectSessionLoaded = createSelector(selectSessionState, (state: SessionState) => state.loaded);
