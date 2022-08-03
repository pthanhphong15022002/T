
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
    contents: string;
    permissions: string;
    resources: Resources[];
    refType: string;
    refID: string;
    dateType: string;
    fromDate: Date;
    toDate: Date;
    autoCreate: boolean;
    repeated: boolean;
    scheduleID: string;
    comments: number;
    attachments: string;
    createOn: Date;
    createBy: string;
    modifiedBy: Date;
    online: boolean;
    avataResource: string;
}

export class Resources{
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
