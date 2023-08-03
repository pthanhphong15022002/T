import { IJournalPermission } from '../interfaces/IJournalPermission.interface';

export class JournalPermission implements IJournalPermission {
  recID: string;
  journalNo: string;
  roleType: string;
  objectType: string;
  objectID: string;
  add: string | boolean = '0';
  read: string = '0';
  edit: string = '0';
  delete: string = '0';
  assign: string = '0';
  share: string = '0';
  approval: string = '0';
  post: string | boolean = '0';
  unPost: string = '0';
  startDate: string;
  endDate: string;
  note: string;
  stop: boolean;
  createdOn: string;
  createdBy: string;
  modifiedOn: string;
  modifiedBy: string;

  objectName?: string;

  constructor(
    roleType: string,
    objectType: string,
    objectId: string,
    objectName?: string
  ) {
    this.objectType = objectType;
    this.objectID = objectId;
    this.roleType = roleType;
    this.objectName = objectName;

    if (roleType == '1') {
      this.add = '1';
      this.read = '1';
      this.edit = '1';
      this.delete = '1';
      this.assign = '1';
    } else if (roleType == '2') {
      this.approval = '1';
    } else if (roleType == '3') {
      this.post = '1';
    } else if (roleType == '4') {
      this.unPost = '1';
    } else if (roleType == '6') {
      this.share = '1';
    }
  }
}
