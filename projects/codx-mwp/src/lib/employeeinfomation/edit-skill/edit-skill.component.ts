import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CallFuncService, DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-edit-skill',
  templateUrl: './edit-skill.component.html',
  styleUrls: ['./edit-skill.component.css']
})
export class EditSkillComponent implements OnInit {
  dialog: any;
  title = "Cập nhật thông tin";
  minType= "MinRange";
  skillEmployee : any;
  skillChartEmployee: any = null;
  dataBind: any;
  width = '720';
  height = window.innerHeight;
  showCBB = false;
  constructor(
    private notiService: NotificationsService,
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private df: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) { 
    this.dialog = dialog;
     this.skillEmployee = dt?.data[0]
  }

  ngOnInit(): void {
  }
  sliderChange(e, data) {
    this.skillChartEmployee = [];
    data.rating = data.valueX = e.toString();
    this.api.exec('ERM.Business.HR', 'EmployeesBusiness', 'UpdateEmployeeSkillAsync', [[data]])
      .subscribe((o: any) => {
        var objIndex = this.skillEmployee.findIndex((obj => obj.recID == data.recID));
        this.skillEmployee[objIndex].rating = this.skillEmployee[objIndex].valueX = data.rating;
        this.skillEmployee = [...this.skillEmployee, ...[]];
        this.df.detectChanges();
      });
  }

  beforeSave(op: any) {
    var data = [];
    op.method = 'UpdateEmployeeSkillAsync';
    data = [
      this.skillEmployee,   
    ];
    op.data = data;
    return true;
  }

  OnSaveForm(){
    this.dialog.dataService
    .save((option: any) => this.beforeSave(option))
    .subscribe((res) => {
      if (res.save) {
        this.dialog.close();
        this.notiService.notify('Sửa thành công'); 
      }
    });

    
  }

  popupAddSkill() {
     this.showCBB = true;
     this.df.detectChanges();
    // dialog.closed.subscribe(e => {
    //   console.log(e);
    // })
  }

  saveAddUser(e: any){
    console.log(e);
  }
}
