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
        'UpdateSkillAsync',
        [this.employeeID, this.skillEmployee]
      )
      .subscribe((res:boolean) => {
        if(res)
        {
          this.dialogRef.close();
        }
      });
  }

  popupAddSkill() {
    this.showCBB = true;
    this.df.detectChanges();
  }
  addSkill(event: any) {
    if(!event || !event?.dataSelected) return;
    let data = event.dataSelected;
    if(data && data.length > 0 ){
      data.map((element:any) =>  {
        let isExsitElement = this.skillEmployee
        .some((x:any) => x.competenceID == element.CompetenceID)
         if(!isExsitElement)
         {
          let skill = {
            RecID: Guid.newGuid(),
            CompetenceID: element.CompetenceID,
            CompetenceName: element.CompetenceName,
            ValueX: 0,
            Rating: "0"
          }
          this.skillEmployee.push(skill);
         }
      });
    }
  }

  removeSkill(data) 
  {
  }


  
}

class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
