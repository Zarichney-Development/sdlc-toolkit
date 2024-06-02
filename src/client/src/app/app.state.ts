import { RoleState } from './role/role.reducer';
import { CategoryState } from './category/category.reducer';
import { ToolState } from './tool/tool.reducer';
import { UserState } from './user/user.reducer';
import { SessionState } from './session/session.reducer';

export interface AppState {
  roleState: RoleState;
  categoryState: CategoryState;
  toolState: ToolState;
  userState: UserState;
  sessionState: SessionState;
}
