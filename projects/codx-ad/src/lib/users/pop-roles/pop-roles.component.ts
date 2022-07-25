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
  countService: number = 0;
  countApp: number = 0;
  lstFunc = [];
  lstEmp = [];
  listRestore = [];
  listChooseRole: tmpformChooseRole[] = [];
  // listChooseRole:tmpformChooseRole[] =[];
  idClickFunc: any;
  listRoles: tmpformChooseRole[] = [];
  optionFrist = 'ADC01' // Check unselect from list
  optionSecond = 'ADC02' // Check list is null
  optionThird = 'ADC03' // Check select from list
  checkApp = false;
  checkService = true;
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

  loadData(dataChecked?: any) {
    this.adService.getListAppByUserRoles(this.choose1)
      .subscribe((res) => {
        if (res) {
          this.lstFunc = res[0];
          this.listRoles = res[1];
          this.lstEmp = res[2];

          this.getListLoadDataAppAndService(this.lstFunc, dataChecked, this.checkApp);
          this.getListLoadDataAppAndService(this.lstEmp, this.listRestore, this.checkService);
          // for (var i = 0; i < this.lstFunc.length; i++) {
          //   this.lstFunc[i].roleName = this.lstFunc[i].roleNames;
          //   if (this.lstFunc[i].recIDofRole != null) {
          //     this.lstFunc[i].recIDofRole = null;
          //   }
          // }
          // if(dataChecked.length >0) {
          //   for (var i = 0; i < this.lstFunc.length; i++) {
          //     for(var j = 0; j < dataChecked.length; j++)
          //     {
          //       if(dataChecked[j].functionID === this.lstFunc[i].functionID) {
          //         this.lstFunc[i].ischeck = true;
          //         this.lstFunc[i].recIDofRole = dataChecked[j].recIDofRole;
          //       }
          //       this.count =j;
          //     }
          //   }
          //   this.count = this.count+1;
          // }

          this.changeDec.detectChanges();
        }
      })

    this.changeDec.detectChanges();
  }

  getListLoadDataAppAndService(listData?: tmpformChooseRole[], listDataChecked?: tmpformChooseRole[], check?: Boolean) {
    for (var i = 0; i < listData.length; i++) {
      if (listData[i].recIDofRole != null) {
        listData[i].recIDofRole = null;
      }
    }
    if (listDataChecked.length > 0 && !check) {
      for (var i = 0; i < listData.length; i++) {
        for (var j = 0; j < listDataChecked.length; j++) {
          if (listDataChecked[j].functionID === listData[i].functionID && listDataChecked[j].isPortal == false && listData[i].isPortal == false) {
            listData[i].ischeck = true;
            listData[i].recIDofRole = listDataChecked[j].recIDofRole;
            this.countApp = j;
          }       
        }
      }
      this.countApp = this.countApp + 1;
    }
    else {
      for (var i = 0; i < listData.length; i++) {
        for (var j = 0; j < listDataChecked.length; j++) {
          if (listDataChecked[j].functionID === listData[i].functionID && listDataChecked[j].isPortal == true && listData[i].isPortal == true) {
            listData[i].ischeck = true;
            listData[i].recIDofRole = listDataChecked[j].recIDofRole;
            this.countService = j;
          }
         
        }
      }
      this.countService = this.countService + 1;
    }
  }

  onChange(event, item?: any) {
    if (item.ischeck) {
      event.target.checked = true;
    }
    else {
      event.target.checked = false;
    }
    if(!item.isPortal) {
      if (event.target.checked === false) {
        item.ischeck = false;
        this.countApp = this.countApp - 1;
        for (var i = 0; i < this.lstFunc.length; i++) {
          if (item.functionID === this.lstFunc[i].functionID) {
            this.lstFunc[i].recIDofRole = null;
            this.lstFunc[i].recRoleName = null;
            this.lstFunc[i].color = null;
          }
        }
        if (this.countApp < 0) {
          this.countApp = 0;
          this.listChooseRole = [];
        }

        for (var i = 0; i < this.listChooseRole.length; i++) {
          if (item.functionID === this.listChooseRole[i].functionID) {
            this.listChooseRole.splice(i, 1);
          }
        }
      }
      else {
        this.countApp = this.countApp + 1;
        item.idChooseRole = this.countApp;
        var checkExist = true;
        this.listChooseRole.forEach(element => {
          if (element.functionID == item.functionID) {
            checkExist = false;
          }
        });
        if (checkExist) {
          this.listChooseRole.push(item);
        }
        item.ischeck = true;

      }
    }
    else {
      if (event.target.checked === false) {
        item.ischeck = false;
        this.countService = this.countService - 1;
        for (var i = 0; i < this.lstEmp.length; i++) {
          if (item.functionID === this.lstEmp[i].functionID) {
            this.lstEmp[i].recIDofRole = null;
            this.lstEmp[i].recRoleName = null;
            this.lstEmp[i].color = null;
          }
        }
        if (this.countService < 0) {
          this.countService = 0;
          this.listChooseRole = [];
        }

        for (var i = 0; i < this.listChooseRole.length; i++) {
          if (item.functionID === this.listChooseRole[i].functionID) {
            this.listChooseRole.splice(i, 1);
          }
        }
      }
      else {
        this.countService = this.countService + 1;
        item.idChooseRole = this.countService;
        var checkExist = true;
        this.listChooseRole.forEach(element => {
          if (element.functionID == item.functionID) {
            checkExist = false;
          }
        });
        if (checkExist) {
          this.listChooseRole.push(item);
        }
        item.ischeck = true;
      }
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
