export class BP_Processes {
  recID :string ;
  category  :string ;
  processNo: string;
  processName: string;
  processName2: string;
  processType: string;
  memo: string;
  groupID: string;
  status : string;
  flowchart: string
  activedOn: Date;
  expiredOn: Date;
  stopOn :Date ;
  note :string ;
  url :string;
  revision :boolean ;
  revisionID : string ;
  versionNo : string ;
  versionOn : Date
  versions :  BP_ProcessRevisions[];
  phases : number ;
  activities : number;
  views :number ;
  attachments: number;
  comments : number;
  rattings :string ;
  positionID :string ;
  deptID :string ;
  divisionID :string ;
  companyID:string ;
  owner :string ;
  bUID :string ;
  approvedOn :Date;
  approvedBy :string;
  createdOn :Date
  createdBy :string
  modifiedOn :Date
  modifiedBy :string
}

export class BP_ProcessSteps {
  id : string ;
  recID : string ;
  processID :string ;
  parentID: string;
  stepNo : number ;
  stepName :string ;
  stepName2 :string ;
  stepType : string ;
  reference: string ;
  memo :string ;
  location :string ;
  duration : number ;
  interval :string ;
  perUnit  :string ;
  eventBase  :string ;
  reminder  :string ;
  reminderBy  :string ;
  note :string ;
  stopOn:Date ;
  attachments : number ;
  comments : number
  refID :string ;
  refLineID :string ;
  createdOn : Date ;
  createdBy : string ;
  modifiedOn : Date ;
  modifiedBy : string ;
  owners :Array<BP_ProcessOwners> ;
}
export class BP_ProcessRevisions{
  recID: string;
  versionNo: string;
  activedOn: Date;
  comment: string;
  approveStatus: string;
  approvedBy: string;
  approvedOn: Date;
  createdOn: Date;
  createdBy: string;
}
export class BP_ProcessOwners {
  id : string ;
  recID : string ;
  objectType: string ;
  objectID :string ;
  rAIC :string ;
  note :string ;
  createdOn : Date ;
  createdBy : string ;
  modifiedOn : Date ;
  modifiedBy : string ;
}
// Thông tin Email để gửi
export class tmpInforSentEMail
{
    subject : string
    content : string
    from : string
    to : string
    tenant : string
    saveTemplate :boolean
}

