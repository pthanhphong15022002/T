export class ApproveProcess {
  funcID: string; //Mã function
  userID: string; // User Thực hiện
  module: string; // Tên Module (Lấy từ requestReader.Service)
  entityName: string; //EntityName của nghiệp vụ
  processType: string; //EntityName Custom của nghiệp vụ (ưu tiên cao hơn)
  htmlView: string; //Tiêu đề dạng HTML
  status: string; //Trạng thái
  reasonID: string; //Mã lí do
  recID: string; //RecID nghiệp vụ gốc
  tranRecID: string; //RecID của ES_ApprovalTran hiện hành
  processID: string; //ProcessID của quy trình hiện hành
  data: any; //Data của nghiệp vụ gốc
  comment: string; //Ghi chú
  approvers: Array<Approver>; //Danh sách userID của Approver
  category: any; //ES_Category của nghiệp vụ
  title: string; //Tiêu đề
  cert: string; //Certificate (viettel)
  curComponent: any;//this: component gọi hàm
  template: any;//ES_SignFile Template 
  supplier: any;//Nhà cung cấp chữ ký :1:Codx;3:VNPT;4:Viettel;5:USB
  exportData: ExportData;//biến lấy data export (funcID: Để lấy bộ EntityName,FormName,GridViewName; recID : Để lấy ra data cần Export)
  customParam:string;//Json string chứa tham số tùy chỉnh (Ex:JSON.stringify({ParentID:"xxxxx"}))
}
export class Approver {
  approver: string;
  roleType: string;
}

export class ResponseModel {
  rowCount: number;//Số dòng thực thi
  msgCodeError: string;//Mã lỗi nếu có
  returnStatus: string;//Trạng thái sau cùng
  isLastStep: boolean;//Kiểm tra bước duyệt cuối
}

export class ExportUpload {
  title: string;
  dataJson: string;
  convertToPDF: boolean;
  entityName: string;
  language: string;
  module: string;
  objectID: string;
  objectType: string;
  referType: string;
  functionID: string;
  templates : Array<TemplateInfo>;
  exportData: ExportData;
}

export class TemplateInfo {
  templateID: string;
  templateType: string;
  reportID: string;
  exportFileName: string;
}

export class ExportData {
  funcID: string;
  recID: string;
  data:string; 
  entityName: string=null; 
  formName: string=null;
  gridViewName: string=null;
}

export const ShareType = {
  //Hiện tĩnh - khi có data từ form nghiệp vụ thì lấy data động để hiện:
  //--Lấy data được truyền
  ResourceOwner : 'RO', //	Chủ sở hữu nguồn lực
  Owner: 'OWN', //	Người sở hữu
  Employee: 'E', //	Nhân viên
  
  //--Lấy data dựa vào User hiện hành
  Created: 'S', //	Người tạo
  DR: 'DR', //	Báo cáo trực tiếp
  IR: 'IR', //	Báo cáo gián tiếp
  TeamLead: 'TL', //	Trưởng nhóm
  AM: 'AM', //	Thư ký phòng
  DM: 'DM', //	Phó phòng
  MA: 'MA', //	Trưởng phòng
  AD: 'AD', //	Thư ký Giám đốc khối
  DD: 'DD', //	Phó Giám đốc khối
  DI: 'DI', //	Giám đốc khối


  //Mở form để nhập data
  Partner: 'PA', //	Đối tác

  //Lấy data tĩnh từ combobox
  User: 'U', //	Người dùng
  
  //Hiện data động - lưu giá trị tham chiếu tĩnh
  Position: 'P', //	Chức danh công việc
  AC: 'AC', //	Thư ký Giám đốc công ty  
  DC: 'DC', //	Phó Giám đốc công ty
  CEO: 'CEO', //	Giám đốc công ty
};

export class ES_SignFile {
  abstract: string = null;
  approveControl: string = '3';
  approveStatus: string = '1';
  approveSteps: string = null;
  assign: boolean = true;
  attachments: number = 0;
  autoCreated: boolean = false;
  buid: string = null;
  categoryID: string = null;
  category: string = null;
  categoryName: string = null;
  comments: number = 0;
  companyID: string = null;
  copies: number = 0;
  createdBy: string = null;
  createdOn: Date = new Date();
  delete: boolean = true;
  deptID: string = null;
  divisionID: string = null;
  employeeID: string = null;
  files: ES_File[] = null;
  includeTables = null;
  isTemplate: boolean = false;
  memo: string = null;
  modifiedBy: string = null;
  modifiedOn = null;
  moved: boolean = false;
  orgUnitID: string = null;
  owner: string = null;
  pages: number = 0;
  permissions = null;
  personalFolder = null;
  priority = '1';
  processID: string = null;
  qrCode = null;
  recID: string = null;
  refDate = null;
  refID: string = null;
  refNo: string = null;
  refType: string = null;
  share: boolean = true;
  signAreas = null;
  tags = null;
  title: string;
  updateColumns = '';
  write = true;
  templateID: string;
  templateType:string;
}

export class ES_File {
  recID: string;
  fileID: string;
  fileName: string;
  eSign: boolean = false;
  areas: object = null;
  comment: string = null;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class tempLoadPDF {
  recID: string;
  transRecID: string;
  isApproveMode: boolean;
  isTemplateMode: boolean;
  isSettingMode: boolean;
  dynamicApprovers: Array<Approver>;
}
export class tempSignPDFInput {
  taskID: string;
  cert: string;
  supplier: string;
  signatureRecID: string;
  fileIDs: string;
  approver: string;
}