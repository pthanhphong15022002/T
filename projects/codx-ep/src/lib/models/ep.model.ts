
export class EP_BookingInputParam {
    data: any;
    funcType: string;
    popupTitle: string;
    optionalData: any;
    viewOnly: boolean=false;
    isEP: boolean=true;//Function hiện tại đang thuộc module EP (Tích hợp)
    haveEP: boolean=true;//Người dùng có quyền module EP hay ko (Tích hợp)
    customAttendees: any;
    startTimeCalendar: any;
    endTimeCalendar: any;
    esCategory: any;
    epSetting:EP_Setting;
    listResouces:[];
  }
  
export class EP_Setting {
    
    epParameters : any;
    epCarParameters : any;
    epStationeryParameters : any;
    epRoomParameters : any;
           
  }