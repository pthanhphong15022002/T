export class UMConversion {
  assign: true;
  bS_UnitsOfMearsure_FromUMID: any;
  bS_UnitsOfMearsure_ToUMID: any;
  buid: any;
  conversion: any;
  createdBy: any;
  createdOn: any;
  delete: any;
  divisionID: any;
  employeeID: any;
  fromUMID: any;
  idiMany: any;
  idiM1: any;
  idiM2: any;
  idiM3: any;
  includeTables: any;
  inverted: any = 0;
  itemID: any;
  modifiedBy: any;
  modifiedOn: any;
  note: any;
  orgUnitID: any;
  owner: any;
  positionID: any;
  recID: any = Guid.newGuid();;
  share: any;
  toUMID: any;
  unbounds: any;
  updateColumns: any;
  write: any;
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
