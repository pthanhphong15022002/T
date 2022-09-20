//signAreas Model
export class tmpSignArea {
  signer: string;
  labelType: string;
  labelValue: string;
  isLock: boolean;
  signDate: boolean;
  dateFormat: string;
  location: {
    top: number;
    left: number;
    width: number;
    height: number;
    pageNumber: number;
  };
  fontStyle: string;
  fontFormat: string;
  fontSize: number;
  signatureType: number;
  comment: string;
  createdOn?: Date;
  createdBy: string;
  modifiedOn?: Date;
  modifiedBy: string;
  stepNo: number;
  recID?: string;
}

export class tmpAreaName {
  Signer: string;
  PageNumber: number;
  StepNo: number;
  LabelType: string;
}
