export class TabModel {
  name: 'attachment' | 'history' | 'comment' | 'reference' | 'approve' | string;
  textDefault: string;
  isActive: boolean = false;
}
