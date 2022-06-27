import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { ApiHttpService, AuthStore, NotificationsService, ResponseModel, TenantStore } from "codx-core";
import { agency } from "../models/agency.model";
import { dispatch, extendDeadline, forwarDis, gridModels, permissionDis, updateDis } from "../models/dispatch.model";

@Injectable({
  providedIn: 'root'
})
export class AgencyService implements OnDestroy {
  constructor(private http: HttpClient,
    private rouer: Router,
    private api: ApiHttpService,
    private notifi: NotificationsService,
    private authStore: AuthStore,
    private tenant: TenantStore) {
  }

  
  ngOnDestroy(): void {
      
  }

  //Thêm mới cơ quan
  SaveAgency(obj:agency)
  {
    return this.api.exec<any>('OD', 'AgenciesBusiness', 'SaveAgencyAsync', obj);
  }

  //loadDataAgencyCbx
  loadDataAgencyCbx()
  {
    return this.api.exec<any>('OD', 'AgenciesBusiness', 'LoadDataAgencyCbxAsync');
  }

  //loadDataAgencyCbx
  loadDataDepartmentCbx(parentID:any)
  {
    return this.api.exec<any>('OD', 'AgenciesBusiness', 'LoadDataDepartmentCbxAsync',parentID);
  }
}
