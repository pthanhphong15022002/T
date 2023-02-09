import { OMCONST } from './codx-om.constant';
import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  DataRequest,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import { ModelPage } from 'projects/codx-ep/src/public-api';
import { finalize, map, Observable, share } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxOmService {
  public caches = new Map<string, Map<string, any>>();
  private cachedObservables = new Map<string, Observable<any>>();
  constructor(
    private cache: CacheService,
    private auth: AuthStore,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private api: ApiHttpService,
    private notificationsService: NotificationsService
  ) {}
  //#region Get from FunctionList
  getFormModel(functionID): Promise<FormModel> {
    return new Promise<FormModel>((resolve, rejects) => {
      this.cache.functionList(functionID).subscribe((funcList) => {
        var formModel = new FormModel();
        if (funcList) {
          formModel.entityName = funcList?.entityName;
          formModel.formName = funcList?.formName;
          formModel.gridViewName = funcList?.gridViewName;
          formModel.funcID = funcList?.functionID;
          formModel.entityPer = funcList?.entityPer;
        }
        resolve(formModel);
      });
    });
  }

  getModelPage(functionID): Promise<ModelPage> {
    return new Promise<ModelPage>((resolve, rejects) => {
      this.cache.functionList(functionID).subscribe((funcList) => {
        var modelPage = new ModelPage();
        if (funcList) {
          modelPage.entity = funcList?.entityName;
          modelPage.formName = funcList?.formName;
          modelPage.gridViewName = funcList?.gridViewName;
          modelPage.functionID = funcList?.functionID;
        }
        resolve(modelPage);
      });
    });
  }

  // getFormGroup(formName, gridView): Promise<FormGroup> {
  //   return new Promise<FormGroup>((resolve, reject) => {
  //     this.cache
  //     .gridViewSetup(formName, gridView)
  //     .subscribe((gv: any) => {
  //       if (gv) {
  //         debugger;
  //         var gridview = Util.camelizekeyObj(gv);
  //         var arrgv = Object.values(gridview) as any[];
          
  //         const group: any = {};
  //         for (const key in gridview) {
  //           const element = gridview[key];
  //           var keytmp = Util.camelize(gridview[element].fieldName);
  //           console.log(gridview[element].fieldName,":", keytmp);
  //           var value = null;
  //           var type = element.dataType.toLowerCase();
  //           if (type === 'bool') value = false;
  //           if (type === 'datetime') value = new Date();
  //           if (type === 'int' || type === 'decimal') value = 0;

  //           group[keytmp] = element.isRequire
  //             ? new FormControl(value, Validators.required)
  //             : new FormControl(value);
  //         };
        
  //         group['updateColumn'] = new FormControl('');
  //        var formGroup = new FormGroup(group);
  //        resolve(formGroup);
  //       }
       
  //     });
  //     // this.cache
  //     //   .gridViewSetup(formName, gridView)
  //     //   .subscribe((grvSetup: any) => {
  //     //     let gv = Util.camelizekeyObj(grvSetup);
  //     //     var model = {};
  //     //     model['write'] = [];
  //     //     model['delete'] = [];
  //     //     model['assign'] = [];
  //     //     model['share'] = [];
  //     //     if (gv) {
  //     //       const user = this.auth.get();
  //     //       for (const key in gv) {
  //     //         const element = gv[key];
  //     //         element.fieldName = Util.camelize(element.fieldName);
  //     //         model[element.fieldName] = [];
  //     //         let modelValidator = [];
  //     //         if (element.isRequire) {
  //     //           modelValidator.push(Validators.required);
  //     //         }
  //     //         if (element.fieldName == 'email') {
  //     //           modelValidator.push(Validators.email);
  //     //         }
  //     //         if (modelValidator.length > 0) {
  //     //           model[element.fieldName].push(modelValidator);
  //     //         }
  //     //       }
  //     //       model['write'].push(false);
  //     //       model['delete'].push(false);
  //     //       model['assign'].push(false);
  //     //       model['share'].push(false);
  //     //     }
       
      
         
  //     //   });
  //   });
  // }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe((gv: any) => {
        var model = {};
        model['write'] = [];
        model['delete'] = [];
        model['assign'] = [];
        model['share'] = [];
        if (gv) {
          const gridview = Util.camelizekeyObj(gv);
          const user = this.auth.get();
          for (const key in gridview) {
            const element = gridview[key];
            element.fieldName =key;
            model[element.fieldName] = [];
            if (element.fieldName == 'owner') {
              model[element.fieldName].push(user.userID);
            } else if (element.fieldName == 'buid') {
              model[element.fieldName].push(user['buid']);
            } else if (element.fieldName == 'createdOn') {
              model[element.fieldName].push(new Date());
            } else if (element.fieldName == 'stop') {
              model[element.fieldName].push(false);
            } else if (element.fieldName == 'orgUnitID') {
              model[element.fieldName].push(user['buid']);
            } else if (
              element.dataType == 'Decimal' ||
              element.dataType == 'Int'
            ) {
              model[element.fieldName].push(0);
            } else if (
              element.dataType == 'Bool' ||
              element.dataType == 'Boolean'
            )
              model[element.fieldName].push(false);
            else if (element.fieldName == 'createdBy') {
              model[element.fieldName].push(user.userID);
            } else {
              model[element.fieldName].push(null);
            }

            let modelValidator = [];
            if (element.isRequire) {
              modelValidator.push(Validators.required);
            }
            if (element.fieldName == 'email') {
              modelValidator.push(Validators.email);
            }
            if (modelValidator.length > 0) {
              model[element.fieldName].push(modelValidator);
            }
          }
          model['write'].push(false);
          model['delete'].push(false);
          model['assign'].push(false);
          model['share'].push(false);
        }
        resolve(this.fb.group(model, { updateOn: 'blur' }));
      });
    });
  }
  getComboboxName(formName, gridView): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      var obj: { [key: string]: any } = {};
      this.cache.gridViewSetup(formName, gridView).subscribe((gv) => {
        if (gv) {
          for (const key in gv) {
            if (Object.prototype.hasOwnProperty.call(gv, key)) {
              const element = gv[key];
              if (element?.referedValue != null) {
                obj[key] = element.referedValue;
              }
            }
          }
        }
      });
      resolve(obj);
    });
  }
  notifyInvalid(
    formGroup: FormGroup,
    formModel: FormModel,
    gridViewSetup: any = null
  ) {
    const invalid = [];
    const controls = formGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
        break;
      }
    }
    let fieldName = invalid[0].charAt(0).toUpperCase() + invalid[0].slice(1);
    if (gridViewSetup == null) {
      this.cache
        .gridViewSetup(formModel.formName, formModel.gridViewName)
        .subscribe((res) => {
          if (res) {
            gridViewSetup = res;
            this.notificationsService.notifyCode(
              'SYS009',
              0,
              '"' + gridViewSetup[fieldName].headerText + '"'
            );
          }
        });
    } else {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + gridViewSetup[fieldName].headerText + '"'
      );
    }
  }

  
  
  loadFunctionList(funcID:any): Observable<any>
  {
    let paras = ["FuncID",funcID];
    let keyRoot = "FuncID" + funcID;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key);
    }
    let observable = this.cache.functionList(funcID).pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null;
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }

  loadGridView(formName: any, gridViewName: any): Observable<any> {
    let paras = [formName, gridViewName];
    let keyRoot = formName + gridViewName;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key);
    }
    let observable = this.cache.gridViewSetup(formName, gridViewName).pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null;
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }
  //#Setting SYS
  getSettingValue(para: any) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'GetByModuleAsync',
      para
    );
  }
  //region OKR Plan
  getOKRPlandAndOChild(recID:string) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKRPlan,
      'GetOKRPlandAndOChildAsync',
      [recID]
    );
  }
  //Lấy danh sách Bộ mục tiêu
  getOKRPlans(periodID: string, interval: string, year: any) {    
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKRPlan,
      'GetAsync', 
      [periodID, interval, year,]);
  }
  
  //Chia sẻ bộ mục tiêu
  shareOKRPlans(recID: any , okrsShare: any) {
    //periodID = '2023'; //Tạm để cứng chờ khi tạo được periodID
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKRPlan,
      'ShareAsync', 
      [recID, okrsShare]);
  }
  //endregion

  //region: KR
  
  checkInKR(recID:string,checkIn:any) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.KR,
      'CheckInKRAsync',
      [recID, checkIn]
    );
  }
  addOB(ob:any) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR,
      'SaveOMAsync',
      [ob]
    );
  }
  editOB(ob:any) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR,
      'UpdateOKRAsync',
      [ob]
    );
  }
  addKR(kr:any) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.KR,
      'AddKRAsync',
      [kr]
    );
  }
  copyKR(kr:any) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.KR,
      'AddKRAsync',
      [kr]
    );
  }
  editKR(kr:any) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.KR,
      'EditKRAsync',
      [kr]
    );
  }
  deleteKR(kr:any) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.KR,
      'DeleteKRAsync',
      [kr]
    );
  }
  //endregion: KR

  //region: OKR
  distributeOKR(recID:string,distributeToType:string, listDistribute:any,isAdd:boolean){
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR,
      'DistributeOKRAsync',
      [recID,distributeToType,listDistribute,isAdd]
    );
  }
  editOKRWeight(recID:string, type:string, listOKRWeight:any) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR,
      'EditOKRWeightAsync',
      [recID,type,listOKRWeight]
    );
  }
  //-------------------------Get Data OKR---------------------------------//
  //Lấy okr mới
  genNewOKR() {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR,
      'GenNewOKRAsync',
      []
    );
  }
  //Lấy ds OKR_Links theo OKR RecID
  getOKRByORGUnit(recID:string,orgUnit:string,okrLevel:string) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR,
      'GetOKRByORGUnitAsync',
      [recID,orgUnit,okrLevel]
    );
  }
  //Lấy danh sách chi tiết KR từ recID OKR
  getKRByOKR(recID: any) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR,
      'GetChildByIDAsync',
      recID
    );
  }
  //Lấy danh sách mục tiêu
  getOKR(dataRequest: DataRequest) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR, 
      'GetAsync', 
      dataRequest
    );
  }
  getAllOKROfPlan(recID: string) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR, 
      'GetAllOKROfPlanAsync', 
      recID
    );
  }
  //Lấy danh sách liên kết/phụ thuộc OKR 
  getListAlignAssign(recID:string,refType:string) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR,
      'GetListAlignAssignAsync',
      [recID,refType]
    );
  }
  //Thêm một mục tiêu
  addOKR(okr:any) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR,
      'SaveOMAsync',
      okr
    );
  }

  //Chỉnh sửa mục tiêu
  updateOKR(okr:any) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR,
      'UpdateOKRAsync',
      okr
    );
  }
  //Lấy OB và tất cả KR con theo ID của OB
  getObjectAndKRChild(recID:string) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR,
      'GetObjectAndKRChildAsync',
      [recID]
    );
  }
  //Lấy một KR và OB cha của KR đó theo ID của KR (Lấy data cho việc phân bổ KR top-down)
  getKRAndOBParent(recID:string) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR,
      'GetKRAndOBParentAsync',
      [recID]
    );
  }
  //Lấy một OKR theo ID
  getOKRByID(recID:string) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR,
      'GetOKRByIDAsync',
      [recID]
    );
  }
  //Lấy ds OKR_Links theo OKR RecID
  getOKRLink(recID:string) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR,
      'GetOKRLinkAsync',
      [recID]
    );
  }
  //Lấy sơ đồ cây OKR
  getOrgTreeOKR(planRecID:any, orgUnitID:string,okrLevelChild:string) {
    return this.api.execSv(
      OMCONST.SERVICES,
      OMCONST.ASSEMBLY,
      OMCONST.BUSINESS.OKR,
      'GetOrgTreeOKRAsync',
      [planRecID,orgUnitID,okrLevelChild]
    );
  }
  //endregion

  //region get Data from HR
  getlistOrgUnit(orgID:any) {
    return this.api.execSv(
      'HR',
      'HR',
      'OrganizationUnitsBusiness',
      'GetOrgIDHierarchyByOrgIDAsync',
      [orgID]
    );
  }
  
  //endregion
}
