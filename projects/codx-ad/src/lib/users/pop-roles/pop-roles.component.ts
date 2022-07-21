import { N } from '@angular/cdk/keycodes';
import { variable } from '@angular/compiler/src/output/output_ast';
import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { eventClick } from '@syncfusion/ej2-angular-schedule';
import { DialogData, DialogRef, ApiHttpService, NotificationsService } from 'codx-core';
import { tmpformChooseRole } from '../../models/tmpformChooseRole.models';

@Component({
  selector: 'lib-pop-roles',
  templateUrl: './pop-roles.component.html',
  styleUrls: ['./pop-roles.component.css']
})
export class PopRolesComponent implements OnInit {

  choose1: tmpformChooseRole[] = [];
  choose = new tmpformChooseRole();
  data: any;
  dialog: any;
  dataView:any;
  title = 'Phân quyền người dùng';
  count: number = 0;
  lstFunc = [];
  lstEmp = [];
  listChooseRole =[]
  idClickFunc:any;

  optionFrist= 'ADC01' // Check unselect from list
  optionSecond= 'ADC02' // Check list is null 
  optionThird= 'ADC03' // Check select from list

  constructor(
    private api: ApiHttpService,
    private changeDec: ChangeDetectorRef,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
    @Optional() dataView?: DialogRef,
  ) {
    this.dialog = dialog;
    this.data = dt?.data;
    this.dataView = dataView;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.api.call('ERM.Business.AD', 'UsersBusiness', 'GetListAppByUserRolesAsync', this.choose1).subscribe((res) => {
      if (res && res.msgBodyData[0]) {
        this.lstFunc = res.msgBodyData[0];
        for (var i = 0; i < this.lstFunc.length; i++) {
          this.lstFunc[i].roleName = this.lstFunc[i].roleNames;
          if (this.lstFunc[i].recIDofRole == '00000000-0000-0000-0000-000000000000') {
            this.lstFunc[i].recIDofRole = null;
          }
        }
        this.changeDec.detectChanges();
      }
    })
  }

  onChange(event,item?:any) {
    console.log(item);
    if (event.target.checked === false) {
      this.choose.recIDofRole = null;
      this.count = this.count - 1;
      for (var i = 0; i < this.lstFunc.length; i++) {
        if(item.functionID === this.lstFunc[i].functionID) {
          this.lstFunc[i].recIDofRole = null;
        }       
      }
      if (this.count < 0) {
        this.count = 0;
        this.listChooseRole = [];
      }

      for(var i=0; i<this.listChooseRole.length; i++)
      {
        if(item === this.listChooseRole[i]) 
        {
          this.listChooseRole.splice(i,1);
        
        }
     //   item[i].idChooseRole= i;
     }
      
     for(var i=1; i<= this.listChooseRole.length; i++) {
      this.listChooseRole[i].idChooseRole= i;
     }
    }
    if (event.target.checked === true) {
      this.count = this.count + 1;
      item.idChooseRole = this.count;
      this.listChooseRole.push(item);
    }
    this.changeDec.detectChanges();
  }

  onCbx(event,item?:any){
    if (event.data) {
    item.recIDofRole = event.data[0];
    }
  }
  checkClickValueOfUserRoles(value?:any) {
    if(value == null) {
      return true;
    }
    return false;
  }
  onSave(){

    if(this.CheckListUserRoles() === this.optionFrist) {
    
      this.notiService.notifyCode("AD006");
    }
    else if(this.CheckListUserRoles() === this.optionSecond)  {
      this.notiService.notifyCode('Lưu thành công');
      this.dialog.close(this.listChooseRole);
      this.changeDec.detectChanges();
    }
    else {
      this.notiService.notifyCode('Không có gì thay đổi');


    }
``
  }
  CheckListUserRoles() {
    for(var i=0; i< this.listChooseRole.length; i++)
      {
        if(this.checkClickValueOfUserRoles(this.listChooseRole[i].recIDofRole))
       {
          return this.optionFrist;
       }

    }
    if(this.listChooseRole.length > 0) {
      return this.optionSecond;
    }
    return this.optionThird;
  }


  loadData123() {
    this.api.call('ERM.Business.AD', 'UsersBusiness', 'GetListAppByUserRolesAsync', this.choose1).subscribe((res) => {
      if (res && res.msgBodyData[0]) {
        this.lstFunc = res.msgBodyData[0];
        for (var i = 0; i < this.lstFunc.length; i++) {
          this.lstFunc[i].roleName = this.lstFunc[i].roleNames;
          if (this.lstFunc[i].functionID == 'DM') {
            this.lstFunc[i].recIDofRole = null;
            
          }
        }
        this.changeDec.detectChanges();
      }
    })
  }

}
