import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, DialogData, DialogRef, FormModel, ImageViewerComponent, LayoutAddComponent, NotificationsService, Util } from 'codx-core';
import { CodxHrService } from '../../../codx-hr.service';
import moment from 'moment';
import { map } from 'rxjs';

@Component({
  selector: 'hr-popup-add-employee',
  templateUrl: './popup-add-employee.component.html',
  styleUrls: ['./popup-add-employee.component.css']
})
export class PopupAddEmployeeComponent implements OnInit{

  data:any = null;
  headerText:string = "";
  action:string = "";
  formModel:FormModel = null;
  dialogRef:DialogRef = null;
  dialogData:any = null;

  tabInfo: any[] = [
    {
      icon: 'icon-assignment_ind',
      text: 'Thông tin nhân viên',
      name: 'lblEmmployeeInfo',
    },
    {
      icon: 'icon-person',
      text: 'Thông tin cá nhân',
      name: 'lblPersonalInfo',
    },
    {
      icon: 'icon-folder_special',
      text: 'Pháp lý',
      name: 'lblLegalInfo',
    },
  ];

  @ViewChild("codxImg") codxImg:ImageViewerComponent;
  @ViewChild("form") form:LayoutAddComponent;

  constructor(
    private api:ApiHttpService,
    private notifySV:NotificationsService,
    private cache:CacheService,
    private dt: ChangeDetectorRef,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  )
  {
    debugger
    this.dialogRef = dialogRef;
    this.formModel = dialogRef?.formModel;
    this.action = dialogData?.data?.action;
    this.headerText = dialogData?.data?.text;
    this.data = dialogData?.data?.data;
  }
  ngOnInit(): void {
    this.getGrvSetup(this.formModel.formName,this.formModel.gridViewName);
  }


  grvSetUp:any[] = [];
  //get grvSetup
  getGrvSetup(fromName:string , grdViewName:string){
    this.cache.gridViewSetup(fromName,grdViewName).subscribe((grv:any) => {
      if(grv)
      {
        this.grvSetUp = grv;
      }
    });
  }
  //set header text
  setTitle(e) {
    this.headerText += " " + e;
  }


  //value change
  valueChange(event: any) {
    debugger
    if (event?.data) {
      let field = Util.camelize(event.field);
      this.data[field] = event.data;
      if(field === 'birthday'){
        debugger
        if(!this.validateBirthday(event.data)){
          this.notifySV.notifyCode("HR001");
          this.data[field] = null;
          // this.form.formGroup.controls[field].patchValue({field : null});
        }
      }
      // if (field == 'positionID') {
      //   let itemSelected = e.component?.itemsSelected[0];
      //   if (itemSelected) {
      //     if (itemSelected['OrgUnitID']) {
      //       let orgUnitID = itemSelected['OrgUnitID'];
      //       if (orgUnitID != this.data['orgUnitID']) {
      //         this.form.formGroup.patchValue({ orgUnitID: orgUnitID });
      //         this.data['orgUnitID'] = orgUnitID;
      //       }
      //     }
      //     if (itemSelected['DepartmentID']) {
      //       let departmentID = itemSelected['DepartmentID'];
      //       if (departmentID != this.data['departmentID']) {
      //         this.form.formGroup.patchValue({ departmentID: departmentID });
      //         this.data['departmentID'] = departmentID;
      //       }
      //     }
      //     if (itemSelected['DivisionID']) {
      //       let divisionID = itemSelected['DivisionID'];
      //       if (divisionID != this.data['divisionID']) {
      //         this.form.formGroup.patchValue({ divisionID: divisionID });
      //         this.data['divisionID'] = divisionID;
      //       }
      //     }
      //     if (itemSelected['CompanyID']) {
      //       let companyID = itemSelected['CompanyID'];
      //       if (companyID != this.data['companyID']) {
      //         this.form.formGroup.patchValue({ companyID: companyID });
      //         this.data['companyID'] = companyID;
      //       }
      //     }
      //   }
      // }
    }
  }

  // validate age > 18
  validateBirthday(birthday:any)
  {
    debugger
    let ageDifMs = Date.now() - Date.parse(birthday);
    let ageDate = new Date(ageDifMs);
    let age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 18;
  }
  //click Button Save
  clickBtnSave(){
    debugger
    if(this.checkValidate()){
      this.action != "edit" ? this.save(this.data,this.formModel.funcID) : this.update(this.data); 
      this.dt.detectChanges();
    }
  }

  //check validate
  checkValidate(){
    debugger
    let arrField =  Object.values(this.grvSetUp).filter((x:any) => x.isRequire);
    let fieldRequired = arrField.map((x:any) => x.fieldName);
    if(fieldRequired.length > 0)
    {
      let strFieldUnValid:string = "";
      fieldRequired.forEach((key) => {
        let field = Util.camelize(key);
        if (!this.data[field])
          strFieldUnValid += this.grvSetUp[key]['headerText'] + ";";
      });
      if(strFieldUnValid)
      {
        this.notifySV.notifyCode("SYS009",0,strFieldUnValid);
        return false;
      }
    }
    return true;
  }

  save(data:any,funcID:string)
  {
    debugger
    if(data){
      this.api.execSv("HR","ERM.Business.HR","EmployeesBusiness","SaveAsync",[data,funcID])
      .subscribe((res:any) => {
        debugger
        if(res)
        {
          this.codxImg.updateFileDirectReload(data.employeeID).subscribe();
        }
        let mssg = res ? "SYS006" : "SYS023";
        this.notifySV.notifyCode(mssg)
        this.dialogRef.close(res);
      });
    }
  }
  //update data
  update(data:any){
    debugger
    if(data){
      this.api.execSv("HR","ERM.Business.HR","EmployeesBusiness","SaveAsync",[data])
      .subscribe((res:any) => {
        let mssg = res ? "SYS006" : "SYS023";
        this.notifySV.notifyCode(mssg);
        this.dialogRef.close(res);
      });
    }
  }
}
