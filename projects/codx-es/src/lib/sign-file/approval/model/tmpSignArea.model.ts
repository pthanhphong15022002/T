//signAreas Model
export class tmpSignArea {
  RecID: string;
  TransID: string;
  FileID: string;
  Signer: string;
  LabelType: string;
  LabelValue: string;
  FixedWidth: boolean;
  SignDate: boolean;
  DateFormat: Date;
  Location: object;
  FontStyle: string;
  FontFormat: string;
  FontSize: number;
  SignatureType: number;
  Comment: string;
  CreatedOn: Date;
  CreatedBy: string;
  ModifiedOn: Date;
  ModifiedBy: string;
}
