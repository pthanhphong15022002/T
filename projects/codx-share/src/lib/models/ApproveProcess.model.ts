export class ApproveProcess { 
  funcID :string ;     //Mã function
  userID :string ;     // User Thực hiện
  module :string ;     // Tên Module (Lấy từ requestReader.Service)
  entityName :string ;     //EntityName của nghiệp vụ
  customEntityName :string ;     //EntityName Custom của nghiệp vụ (ưu tiên cao hơn)
  htmlView :string ;     //Tiêu đề dạng HTML
  status :string ;     //Trạng thái
  reasonID :string ;     //Mã lí do
  recID :string ;     //RecID nghiệp vụ gốc
  tranRecID :string ;     //RecID của ES_ApprovalTran hiện hành
  processID :string ;     //ProcessID của quy trình hiện hành
  data :any ;     //Data của nghiệp vụ gốc
  tenant :string ;     //ProcessID của quy trình hiện hành
  comment :string ;     //Ghi chú
  approvers : Array<Approver> ;     //Danh sách userID của Approver
  category : any ;     //ES_Category của nghiệp vụ
  title : string ;     //Tiêu đề
  curComponent:any;
  template:any;
}
export class Approver {
  roleID: string ;
  roleType: string ='RO';
}

export class ResponseModel {
  rowCount: number;
  msgCodeError: string;
  returnStatus: string;
  isLastStep:boolean;  
}

