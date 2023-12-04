import { Pipe, PipeTransform } from '@angular/core';
import { ApiHttpService, DataRequest } from 'codx-core';
import { mergeMap, of } from 'rxjs';

@Pipe({
  name: 'totalMoney',
})
export class TotalMoneyPipe implements PipeTransform {
  constructor(private api: ApiHttpService) {}

  transform(value: any, formModel, predicates = null, dataValues = null): any {
    var num = Number.parseFloat(value);
    if (num) return of(num);
    let service = 'CM';
    let className = 'DealsBusiness'; //gan tam
    let method = 'GetTotalDealValueColumnsAsync'; //gan tam
    let gridModel = new DataRequest();
    gridModel.formName = formModel.formName;
    gridModel.entityName = formModel.entityName;
    gridModel.funcID = formModel.funcID;
    gridModel.gridViewName = formModel.gridViewName;
    gridModel.pageLoading = false;
    // gridModel.predicates = predicates;
    // gridModel.dataValue = dataValues;
    gridModel.predicate = 'StepID=@0';
    gridModel.dataValue = value;
    gridModel.onlySetPermit = false; //goi qua phan quyền pes
    return this.api
      .execSv<any>(service, service, className, method, gridModel)
      .pipe(
        mergeMap((total) => {
          return of(total || '0');
        })
      );
  }
}
