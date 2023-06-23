export class ApproveProcess { 
  funcID :string ;     //Mã function
  userID :string ;     // User Thực hiện
  module :string ;     // Tên Module (Lấy từ requestReader.Service)
  entityName :string ;     //EntityName của nghiệp vụ
  customEntityName :string ;     //EntityName Custom của nghiệp vụ (ưu tiên cao hơn)
  htmlView :string ;     //Tiêu đề 
  status :string ;     //Trạng thái
  reasonID :string ;     //Mã lí do
  recID :string ;     //RecID nghiệp vụ gốc
  tranRecID :string ;     //RecID của ES_ApprovalTran hiện hành
  processID :string ;     //ProcessID của quy trình hiện hành
  data :string ;     //Data của nghiệp vụ gốc
  tenant :string ;     //ProcessID của quy trình hiện hành
  comment :string ;     //Data của nghiệp vụ gốc
}