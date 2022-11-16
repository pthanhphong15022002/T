import { Injectable } from '@angular/core';
import { ApiHttpService, AuthService } from 'codx-core';
import { BehaviorSubject, catchError, map, Observable, finalize, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodxMwpService {
  user: any;
  employeeID: any = "";
  EmployeeInfomation: any;
  infoLeftComponent: any;
  employeeComponent: any;
  urlback = '';
  currentSection: any = "InfoPersonal";
  private id = new BehaviorSubject<string>(null);
  empInfo = new BehaviorSubject<any>(null);
  loadID = this.id.asObservable();
  dataEdit = new BehaviorSubject<any>(null);
  dtEditChange = this.dataEdit.asObservable();

  refreshActive = new BehaviorSubject<any>(null);

  experienceEdit = new BehaviorSubject<any>(null);
  experienceChange = this.experienceEdit.asObservable();

  educationEdit = new BehaviorSubject<any>(null);
  educationChange = this.educationEdit.asObservable();

  relationEdit = new BehaviorSubject<any>(null);
  relationChange = this.relationEdit.asObservable();

  hobbyEdit = new BehaviorSubject<any>(null);
  hobbyChange = this.hobbyEdit.asObservable();

  dataObj: any;
  isUser: any = false;
  isEdit: any = true;
  employee: any;

  modeEdit = new BehaviorSubject<boolean>(false);
  constructor(
    private auth: AuthService,
    private api: ApiHttpService
  ) {

  }

  async GetUser() {
    var data: any = await this.auth.user$;
    this.user = data.source.value;
    if (!this.dataObj) {
      if (this.employeeID) {
        this.dataObj = "EmployeeID|" + this.employeeID;
        this.isEdit = false;
      } else this.dataObj = "UserID|" + data.source.value.userID;
    }
    //this.dataObj = "UserID|" + data.source.value.userID;
    this.isUser = true;
  }

  appendID(ID: any) {
    this.id.next(ID);
  }

  editInfo(data: any) {
    this.dataEdit.next(data);
  }

  LoadData(employeeID = "", userID = "", type = ""): Observable<any> {
    return this.api
      .call("ERM.Business.HR", "EmployeesBusiness", "GetByUserAsync", [
        employeeID,
        userID,
        type,
      ])
      .pipe(
        map((data) => {
          if (data.error) return;
          return data.msgBodyData[0];
        }),
        catchError((err) => {
          return of(undefined);
        }),
        finalize(() => null)
      );
  }

  getMoreFunction(data) {
    return this.api.execSv<any>(
      'SYS',
      'SYS',
      'MoreFunctionsBusiness',
      'GetWithPermAsync',
      data
    );
  }

  addNewSignature(data: any) {
    return this.api.execSv('ES', 'ES', 'SignaturesBusiness', 'AddNewAsync', [
      data,
    ]);
  }

  editSignature(data: any) {
    return this.api.execSv('ES', 'ES', 'SignaturesBusiness', 'EditAsync', [
      data,
    ]);
  }
}
