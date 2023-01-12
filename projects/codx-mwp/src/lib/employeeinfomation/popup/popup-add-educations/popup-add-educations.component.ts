import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, AuthStore, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { HR_EmployeeEducations } from '../../../model/HR_EmployeeEducations';

@Component({
  selector: 'hr-popup-add-educations',
  templateUrl: './popup-add-educations.component.html',
  styleUrls: ['./popup-add-educations.component.css']
})
export class PopupAddEducationsComponent implements OnInit {

  dialogData:any = null;
  dialogRef:DialogRef = null;
  employeeID:any = null;
  user:any = null;
  data:HR_EmployeeEducations = null;
  headerText:string = "";
  isAdd:boolean = true;
  grvSetup:any = null;

  constructor(
    private api:ApiHttpService,
    private notifySV:NotificationsService,
    private auth:AuthStore,
    private dt:ChangeDetectorRef,
    @Optional() dialogData:DialogData,
    @Optional() dialogRef:DialogRef,
  ) 
  {
    this.dialogData = dialogData?.data;
    this.dialogRef = dialogRef;
    this.user = this.auth.get();
  }

  ngOnInit(): void {
    this.setData();
  }

  // set data
  setData(){
    if(this.dialogData)
    {
      this.headerText = this.dialogData.headerText;
      this.isAdd = this.dialogData.isAdd;
      this.grvSetup = this.dialogData.grv;
      this.data = this.dialogData.data;
    }
  }
  // value change
  valueChange(event:any){
    if(event){
      let _field = event.field;
      let _value = event.data;
      if((_field == "fromDate" || _field == "toDate" || _field == "issuedOn" || _field == "expiredOn"))
      {
        _value = _value ? _value.fromDate.toISOString() : null;
        this.data[_field] = _value;
      }
      else
      {
        this.data[_field] = _value;
      }
    }
  }

  // close popup
  clickClosePopup(){
    this.dialogRef.close();
  }


  // btn save click
  clickSave(){
    if(this.isAdd){
      this.api.execSv("HR","ERM.Business.HR","EducationsBusiness","InsertAsync",[this.data])
      .subscribe((res:any) => {
        if(res){
          this.notifySV.notifyCode("SYS006");
        }
        else
        {
          this.notifySV.notifyCode("SYS023");
        }
        this.dialogRef.close(res);
      });
    }
    else{  //edit
      this.api.execSv("HR","ERM.Business.HR","EducationsBusiness","UpdateAsync",[this.data])
      .subscribe((res:any) => {
        if(res){
          this.notifySV.notifyCode("SYS007");
        }
        else
        {
          this.notifySV.notifyCode("SYS021");
        }
        this.dialogRef.close(res);
      });
    }
  }

}
