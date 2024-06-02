import { createAction, props } from '@ngrx/store';
import { Response } from '../message/message.model';
import { Session } from './session.model';

export const loadSessionResponses = createAction('[Session] Load Session Responses', props<{ sessionId: string }>());
export const loadSessionResponsesSuccess = createAction('[Session] Load Session Responses Success', props<{ responses: Response[] }>());
export const loadSessionResponsesFailure = createAction('[Session] Load Session Responses Failure', props<{ error: any }>());

export const sendPrompt = createAction('[Tool] Send Prompt', props<{ sessionId: string, message: string }>());
export const sendPromptSuccess = createAction('[Tool] Send Prompt Success', props<{ response: Response }>());
export const sendPromptFailure = createAction('[Tool] Send Prompt Failure', props<{ error: any }>());

export const createSession = createAction('[Session] Create Session');
export const createSessionSuccess = createAction('[Session] Create Session Success', props<{ session: Session }>());
export const createSessionFailure = createAction('[Session] Create Session Failure', props<{ error: any }>());

export const fetchLatestSession = createAction('[Session] Fetch Latest Session', props<{ userId: string, toolId: number | null }>());
export const fetchLatestSessionSuccess = createAction('[Session] Fetch Latest Session Success', props<{ session: Session }>());
export const fetchLatestSessionFailure = createAction('[Session] Fetch Latest Session Failure', props<{ error: any }>());

export const addUserMessage = createAction('[Session] Add User Message', props<{ message: Response }>());
