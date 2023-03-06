export class Address {
  adressName: any = '';
  adressType: any = '';
  buid: any;
  calendarID: any;
  city: any;
  countryID: any;
  createdBy: any;
  createdOn: any;
  delRouteID: any;
  distance: any;
  districtID: any;
  divisionID: any;
  duration: any;
  email: any;
  employeeID: any;
  faxNo: any;
  interval: any;
  isDefault: any = false;
  lastUpdated: any;
  latitude: any;
  longitude: any;
  mobile: any;
  modifiedBy: any;
  modifiedOn: any;
  note: any;
  objectID: any;
  objectType: any;
  orgUnitID: any;
  owner: any;
  phone: any;
  phoneExt: any;
  positionID: any;
  postalCode: any;
  primaryContact: any;
  provinceID: any;
  recID: any = Guid.newGuid();;
  regionID: any;
  secondContact: any;
  sms: any;
  stop: any;
  street: any;
  timeZone: any;
  updateColumn: any;
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