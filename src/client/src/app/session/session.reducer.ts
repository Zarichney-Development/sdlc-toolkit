import { createReducer, on } from '@ngrx/store';
import { sendPromptSuccess, createSessionSuccess, loadSessionResponsesSuccess, fetchLatestSessionSuccess, addUserMessage } from './session.actions';
import { Response } from '../message/message.model';
import { Session } from './session.model';

export interface SessionState {
  sessions: Session[];
  responses: Response[];
  loaded: boolean
}

export const initialState: SessionState = {
  sessions: [],
  loaded: false,
  responses: []
};

export const sessionReducer = createReducer(
  initialState,
  on(createSessionSuccess, (state, { session }) => ({ ...state, sessions: [...state.sessions, session] })),
  on(loadSessionResponsesSuccess, (state, { responses }) => ({ ...state, responses })),
  on(sendPromptSuccess, (state, { response }) => ({ ...state, responses: [...state.responses, response] })),
  on(fetchLatestSessionSuccess, (state, { session }) => ({ ...state, session, loaded: true })),
  on(createSessionSuccess, (state, { session }) => ({ ...state, session })),
  on(addUserMessage, (state, { message }) => ({
    ...state,
    responses: [...state.responses, message]
  }))
);
