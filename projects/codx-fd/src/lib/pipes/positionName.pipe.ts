import { Pipe, PipeTransform } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { Observable, of } from 'rxjs';

@Pipe({
  name: 'positionName'
})
export class PositionName implements PipeTransform {
    constructor(
        private api: ApiHttpService
    ) {}
  transform(value: any): Promise<string> {
    return new Promise<string>((resolve, rejects) => {
        this.api.execSv(
            "HR", 
            "ERM.Business.Core", 
            "DataBusiness", 
            "LoadOneDataCbxAsync",
            [{
                "pageLoading": true,
                "page": 1,
                "pageSize": 20,
                "formName": "Positions",
                "gridViewName": "grvPositions",
                "entityName": "HR_Positions",
                "funcID": "HRT02",
                "entityPermission": "HR_Positions",
                "treeField": "",
                "treeIDValue": "",
                "currentValue": value,
                "comboboxName": "Positions",
                "predicates": "",
                "dataValues": "",
                "entryMode": "",
                "selector": ""
            }]
        ).subscribe((res: any) => {
            if(res && res.length > 0){
                const data = JSON.parse(res[0]);
                if(data && data[0]){
                    resolve(data[0]?.PositionName);
                } else {
                    resolve("");
                }
            } else {
                resolve("");
            }
        });
    });
  }
}