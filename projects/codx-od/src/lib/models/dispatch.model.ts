//Chia sẻ công văn
class permissionDis
{
    to             : string[];
    recID          : string;
    objID          : string;
    objType        : string;
    edit           : boolean;
    share          : boolean;
    download       : boolean;
    formDate       : Date;
    toDate         : Date
    sendMail       : boolean = false;
    description    : string;
    funcID         : string;
    inforSentEMail : inforSentEMail 
}

class ShowData {
    x: any;
    y: any;
    text: any;
}

class ChartData 
{
    y: any;
    status: any;
    category: any;
    source: any;
    deptID: any;   
    sourceName: any;
    statusName: any;
    categoryName: any;
    deptName: any;
}

//Chuyển tiếp công văn
class forwarDis
{
    userID         : string;
    comment        : string;
    sendMail       : boolean;
    inforSentEMail : inforSentEMail 
}

//Cập nhật tiến độ
class updateDis
{
    recID          : string;
    updatedOn      : Date;
    percentage     : Number;
    comment        : string;
    reporting      : boolean;
    sendEmail      : boolean;
    inforSentEMail : inforSentEMail 
}

// Thêm mới công văn
class dispatch
{
    RecID          : string;
    DispatchType   : string
    DispatchOn     : Date
    Title          : string
    AgencyID       : string
    AgencyName     : string
    RefNo          : string
    RefDate        : Date
    Urgency        : string
    Status         : string
    PersonalFolder : string
    Category       : string
    Security       : string
    ApproveStatus  : string
    Source         : string
    Copies         : Number
    Pages          : Number
    Tags           : string
    SendMode       : string
    Deadline       : Date
    Owner          : string
    BUID           : string
    PositionID     : string
    DeptID         : string
    DivisionID     : string 
    CompanyID      : string
    File           : Array<any>
}

class dispatchEdit
{
    recID          : string
    dispatchType   : string
    dispatchOn     : Date
    title          : string
    agencyID       : string
    agencyName     : string
    refNo          : string
    refDate        : Date
    urgency        : string
    status         : string
    personalFolder : string
    category       : string
    security       : string
    approveStatus  : string
    source         : string
    copies         : Number
    pages          : Number
    tags           : string
    sendMode       : string
    deadline       : Date
    owner          : string
    buid           : string
    positionID     : string
    deptID         : string
    divisionID     : string 
    companyID      : string
}
// Thông tin Email để gửi
class inforSentEMail
{
    subject : string
    content : string
    from : string
    to : string
    tenant : string
    saveTemplate :boolean
}

//Thu hồi quyền
class extendDeadline
{
    recID         : string
    extendOn      : Date
    reason        : string
    sendMail      : boolean
    inforSentEMail : inforSentEMail 
}

class gridModels
{
    PageLoading : boolean
    Page : number
    PageSize: number
    DataValue: string
}

class ChartLine {
    x: any;
    y: any;
    name: any;
    order: any;
}

class assignTask
{
    recID           : string;
    date            : Date;
    isReport        : boolean;
    isSendMail      : boolean;
    inforSentEmail  : inforSentEMail; 
}

export{
    permissionDis,
    forwarDis,
    updateDis,
    dispatch,
    extendDeadline,
    inforSentEMail,
    gridModels,
    assignTask,
    dispatchEdit,
    ChartData,
    ShowData,
    ChartLine
}