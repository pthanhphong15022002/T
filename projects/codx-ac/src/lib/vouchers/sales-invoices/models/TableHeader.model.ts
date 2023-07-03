export enum SumFormat {
  Normal = 'Normal',
  Currency = 'Currency',
}

export class TableColumn {
  labelName: string;
  field: string;
  headerText: string;
  headerClass: string;
  footerText: string;
  footerClass: string;
  hasSum: boolean = false;
  sum: number = 0;
  sumFormat: string = SumFormat.Normal;

  constructor(init?: Partial<TableColumn>) {
    Object.assign(this, init);
  }
}
