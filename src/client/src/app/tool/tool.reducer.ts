import { createReducer, on } from '@ngrx/store';
import { loadTools, loadToolsSuccess, loadToolsFailure, loadTool, loadToolSuccess, loadToolFailure, unloadTool } from './tool.actions';
import { Tool } from './tool.model';

export interface ToolState {
  tools: Tool[];
  loading: boolean;
  loaded: boolean;
  error: any;
  currentTool: Tool | null;
}

export const initialState: ToolState = {
  tools: [],
  loading: false,
  loaded: false,
  error: null,
  currentTool: null
};

export const toolReducer = createReducer(
  initialState,
  on(loadTools, state => ({ ...state, loading: true })),
  on(loadToolsSuccess, (state, { tools }) => ({
    ...state,
    loading: false,
    tools: [...state.tools, ...tools.filter(tool => !state.tools.find(t => t.id === tool.id))]
  })),
  on(loadToolsFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(loadTool, state => ({ ...state, currentTool: null, loading: true, loaded: false })),
  on(loadToolSuccess, (state, { tool }) => ({
    ...state,
    loading: false,
    loaded: true,
    currentTool: tool,
    tools: [...state.tools.filter(t => t.id !== tool.id), tool]
  })
  ),
  on(loadToolFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(unloadTool, state => ({ ...state, currentTool: null, loaded: false }))
);
