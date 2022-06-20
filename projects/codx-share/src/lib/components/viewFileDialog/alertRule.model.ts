export class alertRule {
  recID: string;
  ruleType: string;
  tableName: string;
  fieldName: string;
  updatedFields: string;
  eventType: string;
  eventValue: string;
  description: string;
  baseOn: string;
  baseOnFilter: string;
  url: string;
  dataValue: string;
  emailTemplate: string;
  sendTo: string;
  sendToObjects: string;
  isAlert: boolean;
  isMail: boolean;
  isSMS: boolean;
  stop: boolean;
  owner: string;
  bUID: string;
  createdOn: any;
  createdBy: string;
  modifiedOn: any;
  modifiedBy: string;
  smsMessage: string;
  baseOnPredicate: string;
  emailSubject: string;

  emailBody: string;
}

export class fieldChoose {
  id: string;
  name: string;
  select: boolean;

  constructor(_id: string, _name: string, _select: boolean) {
    this.id = _id;
    this.name = _name;
    this.select = _select;
  }
}

export class opCondition {
  static EQ = {
    id: "EQ",
    name: "Bằng với",
    cString: "{0}!=null && {0}.Equals({1})",
    cBool: "{0}!=null && {0}.Equals({1})",
    cNumber: "{0}!=null && {0}.Equals({1})",
  };
  static NEQ = {
    id: "NEQ",
    name: "Không Bằng với",
    cString: "{0}!=null && !{0}.Equals({1})",
    cBool: "{0}!=null && !{0}.Equals({1})",
    cNumber: "{0}!=null && {0}.Equals({1})",
  };
  static CONTAINTS = {
    id: "CONTAINTS",
    name: "Có chứa",
    cString: "{0}!=null && {0}.Contains({1})",
  };
  static NOTCONTAINTS = {
    id: "NOTCONTAINTS",
    name: "Không chứa",
    cString: "{0}!=null && {0}.Contains({1})",
  };
  static IN = {
    id: "IN",
    name: "Thuộc tập hợp",
    cString: "{0}!=null && {0}.In({1})",
  };
  static EMPTY = { id: "EMPTY", name: "Rỗng", cString: "{0}==null" };
  static NOTEMPTY = { id: "NOTEMPTY", name: "Khác rỗng", cString: "{0}!=null" };
  static ANYTIME = { id: "ANYTIME", name: "Bất kỳ lúc nào", cDate: "1==1" };
  static YESTERDAY = { id: "YESTERDAY", name: "Hôm qua", cDate: "1==1" };
  static TODAY = { id: "TODAY", name: "Hôm nay", cDate: "1==1" };
  static LASTWEEK = { id: "LASTWEEK", name: "Tuần trước", cDate: "1==1" };
  static THISWEEK = { id: "THISWEEK", name: "Tuần này", cDate: "1==1" };
  static LASTMONTH = { id: "LASTMONTH", name: "Tháng trước", cDate: "1==1" };
  static THISMONTH = { id: "THISMONTH", name: "Tháng này", cDate: "1==1" };
  static LAST24H = { id: "LAST24H", name: "24 giờ trước", cDate: "1==1" };
  static LAST7D = { id: "LAST7D", name: "7 ngày trước", cDate: "1==1" };
  static LAST30D = { id: "LAST30D", name: "30 ngày trước", cDate: "1==1" };
  static LAST30M = { id: "LAST30M", name: "30 phút trước", cDate: "1==1" };
  static LAST2H = { id: "LAST2H", name: "2 giờ trước", cDate: "1==1" };
  static ISBEFORE = { id: "ISBEFORE", name: "Trước ngày", cDate: "1==1" };
  static ISAFTER = { id: "ISAFTER", name: "Sau ngày", cDate: "1==1" };
  static BETWEEN = { id: "BETWEEN", name: "Giữa", cDate: "1==1" };
  static PERIOD = { id: "PERIOD", name: "Khoảng thời gian", cDate: "1==1" };
  static ALL = { id: "ALL", name: "Tất cả", cNumber: "1==1" };
  static ST = { id: "ST", name: "Nhỏ hơn hoặc bằng", cNumber: "{0}<={1}" };
  static GL = { id: "GL", name: "Lớn hơn hoặc bằng", cNumber: "{0}>={1}" };
}
export class objectPara {
  formName: string;
  entityName: string;
  gridView: string;
  defaultSetup: any;
  inputValue: any;
  fileID: string;
  fileName: string;
  extension: string;
  moreAction: any;
  data: any;
}

export class SaveAdvSearch {
  FunctionID: String;
  EntityName: String;
  ViewName: String;
  FavoriteType: number;
  TextSearch: String;
  IsDefault: boolean;
  IsSystem: boolean;
}

export class fieldAdv {
  id: string;
  name: string;
  type: string;
  refType: string;
  refID: string;
  opString = [
    opCondition.EQ,
    opCondition.NEQ,
    opCondition.CONTAINTS,
    opCondition.NOTCONTAINTS,
    opCondition.EMPTY,
    opCondition.NOTEMPTY,
  ];
  opDate = [
    opCondition.ANYTIME,
    opCondition.YESTERDAY,
    opCondition.TODAY,
    opCondition.LASTWEEK,
    opCondition.THISWEEK,
    opCondition.LASTMONTH,
    opCondition.THISMONTH,
    opCondition.LAST24H,
    opCondition.LAST7D,
    opCondition.LAST30D,
    opCondition.LAST30M,
    opCondition.LAST2H,
    opCondition.ISBEFORE,
    opCondition.ISAFTER,
    opCondition.BETWEEN,
    opCondition.EMPTY,
    opCondition.NOTEMPTY,
    opCondition.PERIOD,
  ];
  opBool = [opCondition.EQ, opCondition.NEQ];
  opNumber = [
    opCondition.ALL,
    opCondition.ST,
    opCondition.GL,
    opCondition.EQ,
    opCondition.NEQ,
    opCondition.BETWEEN,
  ];
  opValue: any = opCondition.EQ;
  opConditions: any = [
    { id: "and", name: "và" },
    { id: "or", name: "hoặc" },
  ];
  condition: any;
  value: any;
  value1: any;
  datas: [];
  isQuickSearch: boolean;
  isSearchable: string;

  text: any;
  constructor(
    _id: string,
    _name: string,
    _type: string,
    _refType: string,
    _refID: string,
    _isQuickSearch: boolean,
    _isSearchable: string
  ) {
    this.id = _id;
    this.name = _name;
    this.type = _type;
    this.refType = _refType;
    this.refID = _refID;
    this.isQuickSearch = _isQuickSearch;
    this.isSearchable = _isSearchable;
    this.condition = this.opConditions[0];
    if (this.refType == "combobox") {
      this.opString.push(opCondition.IN);
    }
    if (this.isSearchable != null) {
      this.opValue = opCondition[this.isSearchable];
    } else {
      if (this.type == "string") {
        this.opValue = this.opString[0];
      } else if (this.type == "number") {
        this.opValue = this.opNumber[0];
      } else if (this.type == "date") {
        this.opValue = this.opDate[0];
      } else if (this.type == "bool") {
        this.opValue = this.opBool[0];
      }
    }
  }
}
