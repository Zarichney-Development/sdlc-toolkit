
export interface Role {
  id: Position;
  name?: string | null;
}

export enum Position {
  Developer = 0,
  Tester = 1,
  Manager = 2,
  Analyst = 3,
  Other = 4
}
