export class BP_Processes {
  processNo: string;
  processName: string;
  processName2: string;
  processType: string;
  memo: string;
  groupID: string;
  activedOn: Date;
  expiredOn: Date;
  attachments: number;
}

export class BP_ProcessSteps {
  id : string ;
  recID : string ;
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
}

export class BP_ProcessOwners {
  id : string ;
  recID : string ;
  parentID: string;
  stepID : string ;
  objectType: string ;
  objectID :string ;
  rACID :string ;
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

