import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { tab } from '@syncfusion/ej2-angular-grids';
import { ApiHttpService, DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-reportingline-detail',
  templateUrl: './reportingline-detail.component.html',
  styleUrls: ['./reportingline-detail.component.css']
})
export class ReportinglineDetailComponent implements OnInit {

  dialogData:any;
  dialogRef:DialogRef = null;
  title:string = "Chi tiết"
  data:any = null;
  tabSelected = 1;
  positionSkill:any[] = [];
  parameter:any = null;
  valueX:object = {valueType: 'Category'};
  valueY:object = {
    minimum: 0, maximum: 10
  };
  constructor(
    private api:ApiHttpService,
    private notifySV:NotificationsService,
    private dt:ChangeDetectorRef,
    @Optional() dialogData?:DialogData,
    @Optional() dialogRef?:DialogRef
  ) 
  {
    this.data = dialogData.data;
    this.dialogRef = dialogRef;
  }

  ngOnInit(): void {
    this.getPositonInfoByID(this.data.positionID);
    this.getParameterAsync("HRParameters","1");
  }

  getPositonInfoByID(positionID:string){
    if(positionID){
      this.api.execSv("HR",
      "ERM.Business.HR",
      "PositionsBusiness",
      "GetPositionByIDAsync",
      [positionID])
      .subscribe((res:any) =>{
        if(res)
        {
          this.data = res;
          console.log(res);
        }
      });
    }
  }

  getJobCompetencesByPositionID(positionID:string,parentName:string){
    if(positionID && parentName){
      this.api.execSv(
        "HR",
        "ERM.Business.HR",
        "JobsBusiness",
        "GetJobCompetencesByPositionIDAsync",
        [positionID,parentName])
        .subscribe((res:any) => {
        if(res){
          this.positionSkill = [...res];
          console.log(this.positionSkill);
          this.dt.detectChanges();
        }
      })
    }
  }

  
  getParameterAsync(formName:string,category:string)
  {
    if(!formName || !category) return;
    this.api.execSv("SYS",
    "ERM.Business.SYS",
    "SettingValuesBusiness",
    "GetParameterAsync",
    [formName,category]).
    subscribe((res:any) => {
      if(res)
      {
        this.parameter = JSON.parse(res); 
        console.log(this.parameter);
        this.dt.detectChanges();
      }
    });
  }

  clickClosePopup(){
    this.dialogRef.close();
  }

  selectTab(tabIndex:number)
  {
    if(!tabIndex){
      this.tabSelected = 1;
      return;
    }
    else
    {
      if(tabIndex == 2)
      {
        this.getJobCompetencesByPositionID(this.data.positionID,"Positions");
      }
      this.tabSelected = tabIndex;
      this.dt.detectChanges();

    }
  }

}
