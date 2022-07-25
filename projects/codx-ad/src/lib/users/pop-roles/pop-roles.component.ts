import { N } from '@angular/cdk/keycodes';
import { variable } from '@angular/compiler/src/output/output_ast';
import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { eventClick } from '@syncfusion/ej2-angular-schedule';
import { DialogData, DialogRef, ApiHttpService, NotificationsService } from 'codx-core';
import { CodxAdService } from '../../codx-ad.service';
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
  dialogSecond: any;
  dataView: any;
  title = 'Phân quyền người dùng';
  count: number = 0;
  lstFunc = [];
  lstEmp = [];
  listChooseRole:tmpformChooseRole[] =[];
  idClickFunc: any;
  listRoles:tmpformChooseRole[] =[];
 // viewChooseRoleSelected: tmpformChooseRole;
  optionFrist = 'ADC01' // Check unselect from list
  optionSecond = 'ADC02' // Check list is null
  optionThird = 'ADC03' // Check select from list

  constructor(
    private api: ApiHttpService,
    private changeDec: ChangeDetectorRef,
    private notiService: NotificationsService,
    private adService: CodxAdService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
    this.dialogSecond = dialog;
    this.data = dt?.data;
  }
  ngOnInit(): void {
  this.listChooseRole = this.data;  // 
  this.loadData(this.listChooseRole); 
    
  }

  loadData(dataChecked?:any) {
    this.adService.getListAppByUserRoles(this.choose1)
      .subscribe((res) => {
        if (res) {
          this.lstFunc = res[0];
          this.listRoles = res[1];
          console.log(this.listRoles);
          for (var i = 0; i < this.lstFunc.length; i++) {
            this.lstFunc[i].roleName = this.lstFunc[i].roleNames;
            if (this.lstFunc[i].recIDofRole != null) {
              this.lstFunc[i].recIDofRole = null;
            }
          }
          if(dataChecked !=null) {
            for (var i = 0; i < this.lstFunc.length; i++) {
              for(var j = 0; j < dataChecked.length; j++)
              {
                if(dataChecked[j].functionID === this.lstFunc[i].functionID) {
                  this.lstFunc[i].ischeck = true;
                  this.lstFunc[i].recIDofRole = dataChecked[j].recIDofRole;
                }
                this.count =j;
              }
            }
            this.count = this.count+1;
          }
       
          this.changeDec.detectChanges();
        }
      })
    
    this.changeDec.detectChanges();
  }
  loadedData(dataChecked?:any) {
    for (var i = 0; i < this.lstFunc.length; i++) {
      for(var j = 0; j < dataChecked.length; j++)
      {
        if(dataChecked[j].recIDofRole === this.lstFunc[i].recIDofRole) {
          this.lstFunc[i].ischeck = true;
        }
      }
    }
  }

  onChange(event, item?: any) {
  if(item.ischeck) {
    event.target.checked = true;
  }
  else {
    event.target.checked = false;
  }
    if (event.target.checked === false) {
      item.ischeck = false;
      this.count = this.count - 1;
      for (var i = 0; i < this.lstFunc.length; i++) {
        if (item.functionID === this.lstFunc[i].functionID) {
          this.lstFunc[i].recIDofRole = null;
          this.lstFunc[i].recRoleName = null;
          this.lstFunc[i].color = null;
        }
      }
      if (this.count < 0) {
        this.count = 0;
        this.listChooseRole = [];
      }

      for (var i = 0; i < this.listChooseRole.length; i++) {
        if (item.functionID === this.listChooseRole[i].functionID) {
          this.listChooseRole.splice(i, 1);
        }
      }
    }
    else {
      this.count = this.count + 1;
      item.idChooseRole = this.count;
      var checkExist= true;
      this.listChooseRole.forEach(element => {
        if(element.functionID == item.functionID) {
          checkExist= false;
        }
      });
      if(checkExist)
      {
        this.listChooseRole.push(item);
      }
     
      item.ischeck = true;
    }
    
    this.changeDec.detectChanges();
  }

  onCbx(event, item?: any) {
    if (event.data) {
      item.recIDofRole = event.data[0];
      this.listRoles.forEach(element => {
        if (element.recIDofRole == item.recIDofRole) {
          item.recRoleName = element.roleNames;
          item.color = element.color;
        }
      });
    }
  }
  checkClickValueOfUserRoles(value?: any) {
    if (value == null) {
      return true;
    }
    return false;
  }

  onSave() {

    if (this.CheckListUserRoles() === this.optionFrist) {

      this.notiService.notifyCode("AD006");
    }
    else if (this.CheckListUserRoles() === this.optionSecond) {
      this.notiService.notifyCode('Lưu thành công');
      this.dialogSecond.close(this.listChooseRole);
      this.changeDec.detectChanges();
    }
    else {
      this.dialogSecond.close();
      this.notiService.notifyCode('Không có gì thay đổi');
    }

  }

  CheckListUserRoles() {
    for (var i = 0; i < this.listChooseRole.length; i++) {
      if (this.checkClickValueOfUserRoles(this.listChooseRole[i].recIDofRole)) {
        return this.optionFrist;
      }
    }
    if (this.listChooseRole.length > 0) {
      return this.optionSecond;
    }
    return this.optionThird;
  }

}
