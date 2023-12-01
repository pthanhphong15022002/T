import { Pipe, PipeTransform } from '@angular/core';
import { ApiHttpService, DataRequest } from 'codx-core';
import { mergeMap, of } from 'rxjs';

@Pipe({
  name: 'totalMoney'
})
export class TotalMoneyPipe implements PipeTransform {

  constructor(private api : ApiHttpService){

  }

  transform(value: any, formModel,predicates, dataValues): any {
   var num = Number.parseFloat(value);
   if(num) return of(num)
   let service = formModel.service ;
   let className = "DealsBusiness";  //gan tam
   let method = "GetTotalDealValueAsync" ;//gan tam
   let gridModel =  new DataRequest()
    gridModel.formName = formModel.formName;
    gridModel.entityName = formModel.entityName;
    gridModel.funcID = formModel.funcID;
    gridModel.gridViewName = formModel.gridViewName;
    gridModel.pageLoading = false;
    gridModel.predicates = predicates ;
    gridModel.dataValue = dataValues ;
    return  this.api.execSv<any>(service , service ,className , method ,gridModel).pipe( mergeMap((total) => {
      return of(total || '0');
    }))
    
  }

}
