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
  tenant: string; //ProcessID của quy trình hiện hành
  comment: string; //Ghi chú
  approvers: Array<Approver>; //Danh sách userID của Approver
  category: any; //ES_Category của nghiệp vụ
  title: string; //Tiêu đề
  curComponent: any;
  template: any;
}
export class Approver {
  roleID: string;
  roleType: string = 'RO';
}

export class ResponseModel {
  rowCount: number;
  msgCodeError: string;
  returnStatus: string;
  isLastStep: boolean;
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
