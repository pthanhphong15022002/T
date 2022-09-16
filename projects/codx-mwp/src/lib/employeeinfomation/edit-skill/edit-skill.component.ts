import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
} from '@angular/core';
import {
  ApiHttpService,
  CallFuncService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';

@Component({
  selector: 'lib-edit-skill',
  templateUrl: './edit-skill.component.html',
  styleUrls: ['./edit-skill.component.css'],
})
export class EditSkillComponent implements OnInit {
  dialog: any;
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

  constructor(
    private notiService: NotificationsService,
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private df: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.dialog = dialog;
    this.skillEmployee = dt?.data;
  }

  ngOnInit(): void {}
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
    this.dialog.close(this.skillEmployee);
  }

  popupAddSkill() {
    this.showCBB = true;
    this.df.detectChanges();
    // dialog.closed.subscribe(e => {
    //   console.log(e);
    // })
  }

  saveAddSkill(e: any) {
    let data = e.dataSelected;
    if (data && data.length > 0) {
      this.skillEmployee = data;
      this.skillChartEmployee = data;
      data.forEach((e:any) => {
        let s = {
          objectID: e.CompetenceID,
          objectName: e.CompetenceName,
          objectType: e.idField
        }
        this.skill.push(s);
      })
    }
    // e.dataSelected.forEach((e:any) => {
      // let s = {
      //   CompetenceID: e.id,
      //   CompetenceName: e.text,
      //   idField: e.type
      // };
      // this.skillEmployee.push(s);
    // });
    this.showCBB = false;
    this.df.detectChanges();
  }

  deleteSkill(data) {
    // this.view.dataService.dataSelected = data;
    // this.view.dataService.delete([this.view.dataService.dataSelected], true, (opt,) =>
    //   this.beforeDel(opt)).subscribe((res) => {
    //     if (res[0]) {
    //       this.itemSelected = this.view.dataService.data[0];
    //     }
    //   }
    //   );
  }
}
