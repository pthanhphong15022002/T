export class ApproveProcess {
  funcID: string; //Mã function
  userID: string; // User Thực hiện
  module: string; // Tên Module (Lấy từ requestReader.Service)
  entityName: string; //EntityName của nghiệp vụ
  customEntityName: string; //EntityName Custom của nghiệp vụ (ưu tiên cao hơn)
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
  curComponent: any;//this: component gọi hàm
  template: any;//ES_SignFile Template 
  exportData: ExportData;//biến lấy data export (funcID: Để lấy bộ EntityName,FormName,GridViewName; recID : Để lấy ra data cần Export)
  customParam:string;//Json string chứa tham số tùy chỉnh (Ex:JSON.stringify(object))
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
