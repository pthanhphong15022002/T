import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'shareSetting',
})
export class ShareSettingPipe implements PipeTransform {
  transform(recID: any, setting: any[], dataValue: any): any {
    let dtReturn = {};
    if (!recID || !setting || !dataValue) return dtReturn;
    var settingChild = setting.filter((res) => {
      if (res.refLineID === recID) {
        if (res.dataFormat === 'Type')
          dtReturn['objectType'] = dataValue[res.fieldName];
        if (res.dataFormat === 'ID')
          dtReturn['objectID'] = dataValue[res.fieldName];
        if (res.dataFormat === 'Name')
          dtReturn['objectName'] = dataValue[res.fieldName];
        return res;
      }
    });
    return dtReturn;
  }
}
