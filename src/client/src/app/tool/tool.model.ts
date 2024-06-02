import { SdlcPhase } from "../category/category.model";
import { Position } from "../role/role.model";

export interface Tool {
  id: ToolkitOption;
  name?: string | null;
  useCase?: string | null;
  expectedInput?: string | null;
  expectedOutput?: string | null;
  processingMethod?: string | null;
  systemPrompt?: string | null;
  positions: Position[];
  intendedUsers?: string | null;
  categoryId: SdlcPhase;
  category?: string | null;
  suggestedGuidance: string;
}

export enum ToolkitOption {
  Option1 = 0,
  Option2 = 1,
  Option3 = 2
}
