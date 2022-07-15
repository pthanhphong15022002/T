export class AD_User{
    userID: string;
    userType: string;
    userName: string;
    userGroup: string;
    email: string;
    buid: string;
    activeOn: Date;
    mobile: string;
    employeeID: string;
    stop: boolean;
    status: string;
    groupName: string;
    resource: string;
    buName: string;
    createdOn: Date;
    modifiedOn: Date;
    sessionID: string;
    owner: String;



  recID:string
  ;firstName:string
  ;middleName:string
  ;lastName:string
  ;searchName:string
  ;description:string
  ;domainUser:string
  ;picture:string
  ;isSystem: boolean
  ;administrator: boolean
  ;systemAdmin: boolean
  ;functionAdmin: boolean
  ;password:string
  ;pWQuestion:string
  ;pWAnswer:string
  ;neverExpire: boolean
  ;firstChange: boolean
  ;cantChange: boolean
  ;SystemFormat:string
  ;activeTrackLog: boolean
  ;activeAuditTrail: boolean
  ;personalizeView: boolean
  ;printConsolidate: boolean
  ;favouriteView:string
  ;autoRefresh:string
  ;disconnect:string
  ;defaultPath:string
  ;loginSystem:string
  ;failedPWAttempt:string
  ;failedAnswerAttempt:string
  ;failedPWLast:Date
  ;isOnline:boolean
  ;isLocking:boolean
  ;lastLogin:Date
  ;lastPWChange:Date
  ;trackerID:string
  ;latitude:string
  ;longitude:string
  ;lastUpdated:Date
  ;attachments:string
  ;comments:string
  ;createdBy:string
  ;modifiedBy:string


}

export class AD_Roles{
  createdBy: string;
  createOn: Date;
  comments: number;
  attachments: number;
  note: string;
  roleType: string;
  roleID: string;
  recID: string;
  roleName: string;
}
