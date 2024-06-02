
export interface Category {
  id: SdlcPhase;
  name: string | null | undefined;
  description: string | null | undefined;
}

export enum SdlcPhase {
  Planning = 0,
  Analysis = 1,
  Design = 2,
  Implementation = 3,
  Testing = 4,
  Deployment = 5,
  Maintenance = 6
}
