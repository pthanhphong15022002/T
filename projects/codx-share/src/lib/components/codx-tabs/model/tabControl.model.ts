export class TabModel {
  name: 'attachment' | 'history' | 'comment' | 'reference' | 'approve' | string;
  textDefault: string;
  template?: any;
  isActive: boolean = false;
}
