import { createReducer, on } from '@ngrx/store';
import { sendPromptSuccess, createSessionSuccess, loadSessionResponsesSuccess, fetchLatestSessionSuccess, addUserMessage, createSession, loadSessionResponses, updateSystemPrompt } from './session.actions';
import { Response } from '../message/message.model';
import { Session } from './session.model';

export interface SessionState {
  sessions: Session[];
  responses: Response[];
  loading: boolean,
  loaded: boolean
}

export const initialState: SessionState = {
  sessions: [],
  responses: [],
  loading: false,
  loaded: false,
};

export const sessionReducer = createReducer(
  initialState,
  on(createSession, (state, { }) => ({ ...state, loading: true, loaded: false })),
  on(createSessionSuccess, (state, { session }) => {
    return ({
      ...state,
      loading: false,
      loaded: true,
      // Replace the latest session with the same toolId
      sessions: [...state.sessions.filter(s => s.toolId != session.toolId), session],
    });
  }),

  on(loadSessionResponses, (state, { }) => {
    return ({ ...state, loading: true });
  }),

  on(loadSessionResponsesSuccess, (state, { responses }) => {

    const responsesMap = new Map<string, Response>();

    // Create map from existing responses
    state.responses.forEach(response => {
      if (response.id) {
        responsesMap.set(response.id, response)
      }
    });

    // Include only the new ones
    responses.forEach(newResponse => {
      if (!responsesMap.has(newResponse.id)) {
        responsesMap.set(newResponse.id, newResponse);
      }
    });

    return ({ ...state, loading: false, responses: Array.from(responsesMap.values()) });
  }),

  on(sendPromptSuccess, (state, { response }) => ({ ...state, responses: [...state.responses, response] })),

  on(fetchLatestSessionSuccess, (state, { session }) => {

    if (!session) {
      return ({ ...state, loaded: true });
    }

    return ({ ...state, sessions: [...state.sessions, session], loaded: true });
  }),

  on(addUserMessage, (state, { message }) => ({
    ...state,
    responses: [...state.responses, message]
  })),

  on(updateSystemPrompt, (state, { session, systemPrompt }) =>
  ({
    ...state,
    sessions: [...state.sessions.filter(s => s.id !== session.id), { ...session, systemPrompt: systemPrompt }]
  }))
);
