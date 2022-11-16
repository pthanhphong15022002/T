
export class CO_Meetings{
    id: string;
    recID: string;
    meetingID: string;
    meetingType: string;
    meetingName: string;
    status: string;
    tags: string;
    startDate: Date;
    endDate: Date;
    location: string;
    isOnline: boolean;
    link: string;
    link2: string;
    memo: string;
    templateID: string;
    contents: any = [];
    permissions: string;
    resources: CO_Resources[];
    refType: string;
    refID: string;
    dateType: string;
    fromDate: Date;
    toDate: Date;
    autoCreate: boolean;
    repeated: boolean;
    scheduleID: string;
    comments: number;
    attachments: number;
    createOn: Date;
    createBy: string;
    modifiedBy: Date;
    online: boolean;
    avataResource: string;
    userName: string;
    reminder: number;
}

export class CO_Resources{
    recID: string;
    resourceID: string;
    resourceName: string;
    roleType: string;
    note: string;
    taskControl: boolean;
    isRequire: boolean;
    status: string;
    createOn: Date;
    createBy: string;
    modifiedOn: Date;
    modifiedBy: string;
    positionName: string;
}

export class EP_Boooking{
  resourceID:string;
  status: string;
  startDate: Date;
  endDate: Date;
  bookingOn: Date;
  location: string;
  link: string;
  link2: string;
  memo: string;
  autoCreate: boolean;
  repeated: boolean;
  attachments: number;
  createOn: Date;
  online=false;
  title:string='';
  reasonID:string='';
  approveStatus:string;
  resourceType:string;
  refID: string;
}
export class EP_BookingAttendees {
  userID: string;
  userName: string;
  roleType: string;
  status: string;
  optional: boolean;
}
export class TabControl{
  name: 'Nội dung họp' | 'Thảo luận' |string;
  textDefault: string;
  isActive: boolean;
}

export class TmpRoom{
  resourceID: string;
  location: string;
}

