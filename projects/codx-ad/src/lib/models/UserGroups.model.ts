export class GroupMembers {
  groupID: string;
  roleType: string;
  memberType: string;
  memberID: string;
  memberName: string;
  description: string;
}

export class UserGroup {
  recID: string;
  groupID: string;
  groupName: string;
  groupType: string;
  note: string;
  stop: string;
  reatedOn: any;
  createdBy: string;
  members: any;
}
