import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { DataReturn } from "@shared/models/file.model";
import { ApiHttpService, AuthStore, DataRequest, NotificationsService, ResponseModel, TenantStore } from "codx-core";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { assignTask, ChartData, dispatch, extendDeadline, forwarDis, gridModels, inforSentEMail, permissionDis, updateDis } from "../models/dispatch.model";
import { DataManager, Query } from '@syncfusion/ej2-data';

@Injectable({
  providedIn: 'root'
})
export class DispatchService implements OnDestroy {
  public DataChart: any;
  public DataChartOld: any;
  public IgnoreChart: string;
  public DataChart1: any;
  public DataChart2: any;
  public DataChart3: any;
  public DataChart4: any;
  public DataChart5: any;
  public DataChart6: any;
  public DataChart7: any;
  public DataChart8: any;
  public DataChart9: any;
  public DataChart10: any;
  public DataChart11: any;

  public Roles = new BehaviorSubject<string>(null);
  isRoles = this.Roles.asObservable();
  
  public ChangeData = new BehaviorSubject<boolean>(null);
  isChangeData = this.ChangeData.asObservable();

  public FillDataChartAgency = new BehaviorSubject<string>(null);
  isFillDataChartAgency = this.FillDataChartAgency.asObservable();

  public FillDataChartCate = new BehaviorSubject<string>(null);
  isFillDataChartCate = this.FillDataChartCate.asObservable();

  constructor(
    private http: HttpClient,
    private rouer: Router,
    private api: ApiHttpService,
    private notifi: NotificationsService,
    private authStore: AuthStore,
    private tenant: TenantStore
    ) {
      this.authStore.get();
  }

  
  ngOnDestroy(): void {
      
  }
  
  // result = [];
  // array.reduce(function(res, value) {
  //   if (!res[value.Id]) {
  //     res[value.Id] = { Id: value.Id, qty: 0 };
  //     result.push(res[value.Id])
  //   }
  //   res[value.Id].qty += value.qty;
  //   return res;
  // }, {});

  // groupBy = (arr, key) => {
  //   const initialValue = {};
  //   return arr.reduce((acc, cval) => {
  //     const myAttribute = cval[key];
  //     acc[myAttribute] = [...(acc[myAttribute] || []), cval]
  //     return acc;
  //   }, initialValue);
  // };

  // groupBy(objectArray, property) {
  //   return objectArray.reduce(function (acc, obj) {
  //     var key = obj[property];
  //     if (!acc[key]) {
  //       acc[key] = [];
  //     }
  //     acc[key].push(obj);
  //     return acc;
  //   }, {});
  // }

  SumDataForChart(type: any) {
    var data = "";
    if (type != this.IgnoreChart) {
      switch(type) {     
        case "8":        
          var result8 = [];     
          this.DataChart8 = [];   
          //var data: any;
          var item = (this.DataChart.reduce(function(res, value) {       
            var index = 0;
            if (result8.findIndex(item => item.x == value.statusName) == -1) {
              index = result8.length;
              res[index] = { x: value.statusName, y: 0, text: value.statusName, status: value.status };
             // result.push(res[index])
              result8.push(Object.assign({},  res[index]));
            }
            res[index].y += value.y;     
            return res;
          }, {}));     
  
          this.DataChart8 = Object.values(item);
          break;  
  
        case "9":
          var result9 = [];
          var result2 = [];
          this.DataChart9 = [];
          this.DataChart2 = [];
          this.DataChart9 = Object.values(this.DataChart.reduce(function(res, value) {
            var index = 0;
            if (result9.findIndex(item => item.x == value.deptName) == -1) {
              index = result9.length;
              res[index] = { x: value.deptName, y: 0, text: value.deptName };
              result9.push(Object.assign({},  res[index]));
            }
            res[index].y += value.y;          
            return res;
          }, {}));           
          // chart 2
          this.DataChart2 = Object.values(this.DataChart.reduce(function(res, value) {
            var index = 0;
            if (result2.findIndex(item => item.name == value.deptName && item.x == value.createdOn) == -1) {
              index = result2.length;
              res[index] = { x: value.createdOn, y: 0, name: value.deptName };
              result2.push(Object.assign({},  res[index]));
            }
            res[index].y += value.y;          
            return res;
          }, {}));     
       
          break;  
  
        case "10":
          var result10 = [];
          this.DataChart10 = []
          this.DataChart10 = Object.values(this.DataChart.reduce(function(res, value) {
            var index = 0;
            if (result10.findIndex(item => item.x == value.categoryName) == -1) {
              index = result10.length;
              res[index] = { x: value.categoryName, y: 0, text: value.categoryName };
              result10.push(Object.assign({},  res[index]));
            }
            res[index].y += value.y;           
            return res;
          }, {}));     
       
          break;  

        case "11":
          var result11 = [];
          this.DataChart11 = []
          this.DataChart11 = Object.values(this.DataChart.reduce(function(res, value) {
            var index = 0;
            if (result11.findIndex(item => item.x == value.sourceName) == -1) {
              index = result11.length;
              res[index] = { x: value.sourceName, y: 0, text: value.sourceName };
              result11.push(Object.assign({},  res[index]));
            }
            res[index].y += value.y;   
                 
            return res;
          }, {}));     
           this.DataChart7 = this.DataChart11.sort((a,b) => a.y - b.y).slice(0,10);
          break;  
      }       
    }   
    this.FillDataChartAgency.next(type);    
   // return data;
  }

  // SaveAgency1(obj)
  // {
  //   return this.api.exec<any>('OD', 'DispatchesBusiness', 'SaveAsync', obj);
  // }

  addToFolder(id, folder) {
    //ExtendDeadlineAsync
    return this.api.exec<any>('OD', 'DispatchesBusiness', 'UpdateDispatchFolderAsync', [id, folder]);
  }

  //Gia hạn deadline
  extendDeadLinee(obj:extendDeadline) {
      //ExtendDeadlineAsync
    return this.api.exec<any>('OD', 'DispatchesBusiness', 'ExtendDeadlineAsync', obj);
  }

  //Chia sẻ văn bản
  shareDispatch(obj: permissionDis)
  {
    return this.api.exec<any>('OD', 'DispatchesBusiness', 'ShareDispatchAsync', obj);
  }

  //Thu hồi quyền chia sẻ của user
  recallSharing(resID: any , objID: any)
  {
    return this.api.exec<any>('OD', 'DispatchesBusiness', 'RecallSharingAsync', [resID , objID]);
  }
  //Thu hồi quyền chia sẻ của user
  recallRelation(resID: any)
  {
    return this.api.exec<any>('OD', 'DispatchesBusiness', 'RecallRelationAsync', resID);
  }
  //Chuyển tiếp công văn
  forwardDispatch(recID:any , obj: forwarDis)
  {
    return this.api.exec<any>('OD', 'DispatchesBusiness', 'ForwardDispatchAsync', [recID,obj]);
  }

  //Cập nhật kết quả
  updateResultDispatch(obj: updateDis)
  {
    return this.api.exec<any>('OD', 'DispatchesBusiness', 'UpdateResultAsync', obj);
  }

   //Thêm mới công văn
   saveDispatch(dataRq : DataRequest ,obj: dispatch)
   {
     return this.api.exec<any>('OD', 'DispatchesBusiness', 'SaveDispatchAsync', [dataRq , obj]);
   }
    //cập nhật công văn
    updateDispatch(obj: dispatch , isDlFile: boolean)
    {
      return this.api.exec<any>('OD', 'DispatchesBusiness', 'UpdateDispatchAsync', [obj,isDlFile]);
    }

   //Add link
   addLink(recID : string , refID : string , url: string , note: string)
   {
     return this.api.exec<any>('OD', 'DispatchesBusiness', 'AddLinkAsync', [recID , refID, url, note]);
   }

   countDispatchOverDate(cate: any)
   {
      return this.api.exec<any>('OD', 'DispatchesBusiness', 'CountItemByOverDateAsync', [cate]);
   }

   getDataForCharts(fromDate: any, toData: any, view: any, type: any)
   {
      return this.api.exec<ChartData[]>('OD', 'DispatchesBusiness', 'GetDataForChartsAsync', [fromDate, toData, view, type]);
   }
// 
   countDispatchByStatus(status: any, cate:any)
   {
      return this.api.exec<any>('OD', 'DispatchesBusiness', 'CountItemByStatusAsync', [status, cate]);
   }

   countDispatchEmergency(cate: any)
   {
      return this.api.exec<any>('OD', 'DispatchesBusiness', 'CountItemByEmergencyAsync', [cate]);
   }

   //Đếm công văn theo loại
   countDispatchByType(status: any, type: any)
   {
      return this.api.exec<any>('OD', 'DispatchesBusiness', 'CountItemByTypeAsync', [status, type]);
   }

   //Đếm công văn theo ngày
   countDispatchByDate(date:Date)
   {
      return this.api.exec<any>('OD', 'DispatchesBusiness', 'CountItemByDateAsync', date);
   }

    //Lấy danh sách công văn đến theo status
    GetListDispatchByStatus(model: DataRequest)
    {
       return this.api.exec<any>('OD', 'DispatchesBusiness', 'GetListByStatusAsync', model);
    }

    //Lấy chi tiết 1 công văn
    getDetailDispatch(recID:any , objectType:any , isEntities=false)
    {
       return this.api.exec<any>('OD', 'DispatchesBusiness', 'GetItemByIDAsync', [recID,objectType,isEntities]);
    }

    //Xóa công văn
    deleteDispatch(recID:any)
    {
      return this.api.exec<any>('OD', 'DispatchesBusiness', 'DeleteByIDAsync', recID);
    }

    //bookmark
    bookMark(recID:any)
    {
      return this.api.exec<any>('OD', 'DispatchesBusiness', 'BookmarkAsync', recID);
    }
    // Assign Task
    assignTask(data: assignTask)
    {
      return this.api.exec<any>('OD', 'DispatchesBusiness', 'AssignTaskAsync',data);
    }
    //Check quyền user
    checkUserPermiss(recID: string , userID : string)
    {
        return this.api.exec<any>('OD' ,'DispatchesBusiness', 'UserPermissionAsync' , [recID , userID] )
    }
    //Send Email
    sendMail(recID : string , infor : inforSentEMail )
    {
      return this.api.exec<any>('OD' ,'DispatchesBusiness', 'SendMailDispatchAsync' , [recID , infor] )
      
    }
     //Send Email
     getTaskByRefID(recID : string )
     {
       return this.api.execSv<any>('TM','ERM.Business.TM','TaskBusiness','GetListTaskTreeByRefIDAsync', recID)
     }
     //Completed
     complete(recID:string , comment:string)
     {
       return this.api.exec<any>('OD','DispatchesBusiness','CompletedAsync', [recID,comment])
     }
    
}
