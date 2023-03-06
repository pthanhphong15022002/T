export class Contact {
  alternative: any;
  anniversary: any;
  assistant: any;
  assistantPhone: any;
  bankAcctNo: any;
  bankID: any;
  birthPlace: any;
  birthday: any;
  branchID: any;
  buid: any;
  city: any;
  contactID: any = Math.floor(Math.random() * 100000).toString();
  contactName: any = '';
  contactType: any = '';
  countryID: any;
  counts: any = 0;
  createdBy: any;
  createdOn: any;
  department: any;
  districtID: any;
  divisionID: any;
  education: any;
  email: any = '';
  employeeID: any;
  ethnicGroup: any;
  faxNo: any;
  firstName: any;
  fullAddress: any;
  gender: any;
  homePhone: any;
  idCardNo: any;
  idType: any;
  income: any = 0;
  isDefault: any;
  issuedBy: any;
  issuedOn: any;
  jobTitle: any = '';
  lastName: any;
  latitude: any = 0;
  longitude: any = 0;
  loyaltyGroupID: any;
  manager: any;
  managerPhone: any;
  maritalStatus: any;
  middleName: any;
  mobile: any;
  modifiedBy: any;
  modifiedOn: any;
  nationality: any;
  note: any;
  occupation: any;
  orgUnitID: any;
  owner: any;
  personalEmail: any;
  phone: any = '';
  phoneExt: any;
  pictureLocation: any;
  positionID: any;
  postalCode: any;
  provinceID: any;
  recID: any = Guid.newGuid();
  reference: any;
  referenceType: any;
  regionID: any;
  religion: any;
  salutation: any;
  searchName: any;
  sms: any;
  spouseName: any;
  stop: any;
  street: any;
  timeZone: any;
  updateColumn: any;
  userID: any;
  vip: any;
  webPage: any;
}
class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}