export class HiddenFieldName {
  drAcctControl: string;
  crAcctControl: string;
  projectControl: string;
  assetControl: string;

  constructor(
    drAcctControl?: string,
    crAcctControl?: string,
    projectControl?: string,
    assetControl?: string
  ) {
    this.drAcctControl = drAcctControl ?? 'DRAcctID';
    this.crAcctControl = crAcctControl ?? 'CRAcctID';
    this.projectControl = projectControl ?? 'ProjectID';
    this.assetControl = assetControl ?? 'AssetID';
  }
}
