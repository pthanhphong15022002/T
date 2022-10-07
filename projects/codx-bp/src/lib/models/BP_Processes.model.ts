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
  parentID: string;
  stepName: string;
  stepName2: string;
  memo: string;
  duration: string;
  location: string;
  owners: string;
  stepType: string;
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

