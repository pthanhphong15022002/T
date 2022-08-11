export class CO_MeetingTemplates{
  recID: string;
  templateID: string;
  templateType: string;
  templateGroup: string;
  templateName: string;
  desciptions: string;
  isCustomize: string;
  content: CO_Content[];
  sorting: number;
  comments: number;
  attachments: number;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class CO_Content{
  recID: string;
  lineType: string;
  icon: string;
  textColor: string;
  format: string;
  memo: string;
  status: string;
  refType: string;
  refID: string;
  sorting: number;
  comments: number;
  attachments: number;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}
