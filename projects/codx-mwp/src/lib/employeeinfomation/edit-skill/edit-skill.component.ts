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
  skillEmployee: any[] = [];
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
  employeeID:string = "";
  dialogData:any = null;
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
    this.dialogData = dialog?.data?.skill;
    this.employeeID = dialog?.data.employeeID;
    if(this.dialogData && this.dialogData.length > 0){
      this.dialogData.map((e) => this.skillEmployee.push({...e}));
    }
  }
  
  ngOnInit(): void {
    this.tooltip = { placement: 'Before', isVisible: true, showOn: 'Always' };
  }
  valueSliderChange(value:any,competence:any){
    if(competence)
    {
      this.skillEmployee.forEach((e:any) => {
        if(e.competenceID == competence.competenceID)
        {
          e.rating = value;
          return;
        }
      });
      this.df.detectChanges();
    }
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
          this.dialogRef.close(this.skillEmployee);
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
            competenceID: element.CompetenceID,
            competenceName: element.CompetenceName,
            valueX: 0,
            rating: "0"
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
