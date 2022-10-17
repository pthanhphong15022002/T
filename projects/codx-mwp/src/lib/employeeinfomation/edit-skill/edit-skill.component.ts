import { E } from '@angular/cdk/keycodes';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
} from '@angular/core';
import { ELEMENTS } from '@syncfusion/ej2-angular-inplace-editor';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';

@Component({
  selector: 'lib-edit-skill',
  templateUrl: './edit-skill.component.html',
  styleUrls: ['./edit-skill.component.css'],
})
export class EditSkillComponent implements OnInit {
  dialogRef: any;
  title = 'Chỉnh sửa kỹ năng';
  minType = 'MinRange';
  skillEmployee: any;
  skillChartEmployee: any = null;
  dataBind: any;
  width = '720';
  height = window.innerHeight;
  showCBB = false;
  dataValue = '';
  parentIdField = '';
  skill = [];
  tooltip:any = {};
  ticks:any = {};
  employeeID:String = "";
  constructor(
    private notifiSV: NotificationsService,
    private cache: CacheService,
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private df: ChangeDetectorRef,
    @Optional() dialogRef?: DialogRef,
    @Optional() dialog?: DialogData
  ) {
    this.dialogRef = dialogRef;
    this.skillEmployee = dialog?.data.skill;
    this.employeeID = dialog?.data.employeeID;
  }
  
  ngOnInit(): void {
    this.tooltip = { placement: 'Before', isVisible: true, showOn: 'Always' };
    // this.ticks = { placement: 'After', largeStep: 1, smallStep: 10, showSmallTicks: true };
  }
  sliderChange(e, data) {
    this.skillChartEmployee = [];
    data.rating = data.valueX = e.toString();
    // this.api.exec('ERM.Business.HR', 'EmployeesBusiness', 'UpdateEmployeeSkillAsync', [[data]])
    //   .subscribe((o: any) => {
    //     var objIndex = this.skillEmployee.findIndex((obj => obj.recID == data.recID));
    //     this.skillEmployee[objIndex].rating = this.skillEmployee[objIndex].valueX = data.rating;
    //     this.skillEmployee = [...this.skillEmployee, ...[]];
    //     this.df.detectChanges();
    //   });
  }

  OnSaveForm() {
    this.api
      .exec(
        'ERM.Business.HR',
        'EmployeesBusiness',
        'UpdateEmployeeSkillAsync',
        [this.skillEmployee]
      )
      .subscribe((o: any) => {
        console.log(o);
      });
    this.dialogRef.close(this.skillEmployee);
  }

  popupAddSkill() {
    this.showCBB = true;
    this.df.detectChanges();
  }
  addSkill(event: any) {
    if(!event || !event?.dataSelected) return;
    let data = event.dataSelected;
    let skills = [];
    if(this.skillEmployee && this.skillEmployee.length > 0 ){
      data.map((element:any) =>  {
        let isExsitElement = this.skillEmployee.some(x => x.competenceID == element.CompetenceID)
         if(!isExsitElement){
          skills.push(element.CompetenceID);
         }
      });
    }
    else
    {
      data.map((e:any) => skills.push(e.CompetenceID));
    }
    if(skills.length > 0)
    {
      this.api.execSv(
        "HR",
        "ERM.Business.HR",
        "EmployeesBusiness",
        "AddSkillsEmployeeAsync",
        [this.employeeID, skills]
        ).subscribe((res:boolean) => {
          if(res)
          {
            this.notifiSV.notifyCode("SYS006");
            this.dialogRef.close(skills);
          }
          else{
            this.notifiSV.notifyCode("SYS023");
          }
        });
    }
    else
    {
      this.notifiSV.notifyCode("SYS023");
    }
  }

  removeSkill(data) 
  {
  }
}
