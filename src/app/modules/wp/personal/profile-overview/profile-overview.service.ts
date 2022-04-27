import { Injectable } from '@angular/core';
import { ApiHttpService, AuthService } from 'codx-core';
//import { ApiHttpService, AuthService, UserModel } from "@core/services";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, map } from "rxjs/operators";
//import { ProfileCardComponent } from "../_components/profile-card/profile-card.component";
import { ProfileOverviewComponent } from "./profile-overview.component";

@Injectable({
  providedIn: 'root'
})
export class ProfileOverviewService {
  user: any;
  employeeID: any = "";
  profileOverviewComponent: ProfileOverviewComponent;
  //profileCardComponent: ProfileCardComponent;
  employeeComponent: any;
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

  constructor(private auth: AuthService, private api: ApiHttpService) {
    // this.GetUser();
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

  LoadData(employeeID = "", type = ""): Observable<any> {
    return this.api
      .call("ERM.Business.HR", "EmployeesBusiness", "GetByUserAsync", [
        employeeID,
        "",
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
}
