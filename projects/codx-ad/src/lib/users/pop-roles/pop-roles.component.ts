import { N } from '@angular/cdk/keycodes';
import { variable } from '@angular/compiler/src/output/output_ast';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { eventClick } from '@syncfusion/ej2-angular-schedule';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  NotificationsService,
  FormModel,
  CodxFormComponent,
  CacheService,
} from 'codx-core';
import { CodxAdService } from '../../codx-ad.service';
import { AD_Roles } from '../../models/AD_Roles.models';
import { tmpformChooseRole } from '../../models/tmpformChooseRole.models';

@Component({
  selector: 'lib-pop-roles',
  templateUrl: './pop-roles.component.html',
  styleUrls: ['./pop-roles.component.css'],
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
  listRoles: AD_Roles[] = [];
  optionFirst = 'ADC01'; // Check unselect from list
  optionSecond = 'ADC02'; // Check list is null
  optionThird = 'ADC03'; // Check select from list
  checkApp = false;
  checkService = true;
  formType = '';
  isCheck = true;
  checkRoleIDNull = false;
  userID: any;

  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private api: ApiHttpService,
    private changeDec: ChangeDetectorRef,
    private notiService: NotificationsService,
    private adService: CodxAdService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialogSecond = dialog;
    this.data = dt?.data.data;
    this.formType = dt?.data.formType;
    if (dt?.data.data?.length > 0)
      this.userID = JSON.parse(JSON.stringify(dt.data?.userID));
  }
  ngOnInit(): void {
    if (this.data?.length > 0) this.listChooseRole = JSON.parse(JSON.stringify(this.data));
    this.loadData();
  }

  ngAfterViewInit() {}

  loadData() {
    this.adService.getListAppByUserRoles(this.choose1).subscribe((res) => {
      if (res) {
        this.lstFunc = res[0];
        this.listRoles = res[1];
        this.lstEmp = res[2];
        this.getListLoadDataApp();
        this.getListLoadDataService();
        this.changeDec.detectChanges();
      }
    });

    this.changeDec.detectChanges();
  }

  getListLoadDataApp() {
    for (var i = 0; i < this.lstFunc.length; i++) {
      if (this.lstFunc[i].recIDofRole != null) {
        this.lstFunc[i].recIDofRole = null;
      }
    }
    if (this.listChooseRole.length > 0) {
      for (var i = 0; i < this.lstFunc.length; i++) {
        for (var j = 0; j < this.listChooseRole.length; j++) {
          if (
            this.listChooseRole[j].functionID === this.lstFunc[i].functionID
          ) {
            this.lstFunc[i].ischeck = true;
            this.lstFunc[i].recIDofRole = this.listChooseRole[j].recIDofRole;
            this.countApp++;
          }
        }
      }
    }
  }
  getListLoadDataService() {
    for (var i = 0; i < this.lstEmp.length; i++) {
      if (this.lstEmp[i].recIDofRole != null) {
        this.lstEmp[i].recIDofRole = null;
      }
    }
    if (this.listChooseRole.length > 0) {
      for (var i = 0; i < this.lstEmp.length; i++) {
        for (var j = 0; j < this.listChooseRole.length; j++) {
          if (this.listChooseRole[j].functionID === this.lstEmp[i].functionID) {
            this.lstEmp[i].ischeck = true;
            this.lstEmp[i].recIDofRole = this.listChooseRole[j].recIDofRole;
            this.countService++;
          }
        }
      }
    }
  }

  onChange(event, item?: any) {
    if (item.ischeck) {
      event.target.checked = true;
    } else {
      event.target.checked = false;
    }
    if (!item.isPortal) {
      if (event.target.checked === false) {
        item.ischeck = false;
        this.countApp = this.countApp - 1;
        for (var i = 0; i < this.lstFunc.length; i++) {
          if (item.functionID === this.lstFunc[i].functionID) {
            this.lstFunc[i].recIDofRole = null;
            this.lstFunc[i].roleName = null;
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
      } else {
        this.countApp = this.countApp + 1;
        item.idChooseRole = this.countApp;
        var checkExist = true;
        this.listChooseRole.forEach((element) => {
          if (element.functionID == item.functionID) {
            checkExist = false;
          }
        });
        if (checkExist) {
          this.listChooseRole.push(item);
        }
        item.ischeck = true;
      }
    } else {
      if (event.target.checked === false) {
        item.ischeck = false;
        this.countService = this.countService - 1;
        for (var i = 0; i < this.lstEmp.length; i++) {
          if (item.functionID === this.lstEmp[i].functionID) {
            this.lstEmp[i].recIDofRole = null;
            this.lstEmp[i].roleName = null;
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
      } else {
        this.countService = this.countService + 1;
        item.idChooseRole = this.countService;
        var checkExist = true;
        this.listChooseRole.forEach((element) => {
          if (element.functionID == item.functionID) {
            checkExist = false;
          }
        });
        if (checkExist) {
          item.recIDofRole = '';
          this.listChooseRole.push(item);
        }
        item.ischeck = true;
      }
    }
    this.changeDec.detectChanges();
  }
  onCbx(event, item?: any) {
    if (event.data) {
      var dataTemp = JSON.parse(JSON.stringify(item));
      item.recIDofRole = event.data;
      this.listRoles.forEach((element) => {
        if (element.recID == item.recIDofRole) {
          item.roleName = element.roleName;
          item.color = element.color;
        }
      });
      var lstTemp = JSON.parse(JSON.stringify(this.listChooseRole));
      lstTemp.forEach((res) => {
        if (res.functionID == dataTemp.functionID) {
          res.roleID = item.recIDofRole;
          res.recIDofRole = item.recIDofRole;
          res.roleName = item.roleName;
          res.color = item.color;
          res.userID = this.userID;
        }
      });
      this.listChooseRole = lstTemp;
    }
  }
  checkClickValueOfUserRoles(value?: any) {
    if (value == null) {
      return true;
    }
    return false;
  }

  onSave() {
    this.checkRoleIDNull = false;
    if (this.listChooseRole) {
      this.listChooseRole.forEach((res) => {
        if (res?.recIDofRole == null) {
          var a = this.notiService.notifyCode(
            'AD006',
            null,
            "'" + res.customName + "'"
          );
          this.checkRoleIDNull = true;
          return;
        }
      });
    }
    if (this.checkRoleIDNull == false) {
      if (this.CheckListUserRoles() === this.optionFirst) {
        this.notiService.notifyCode('AD006');
      } else if (this.CheckListUserRoles() === this.optionSecond) {
        this.dialogSecond.close(this.listChooseRole);
        this.changeDec.detectChanges();
      } else {
        this.notiService.notifyCode('Không có gì thay đổi');
        this.dialogSecond.close(this.listChooseRole);
      }
    }
  }

  CheckListUserRoles() {
    for (var i = 0; i < this.listChooseRole.length; i++) {
      if (this.checkClickValueOfUserRoles(this.listChooseRole[i].recIDofRole)) {
        return this.optionFirst;
      }
    }
    if (this.listChooseRole.length > 0) {
      return this.optionSecond;
    }
    return this.optionThird;
  }

  // addLine(template: any, data = null) {
  //   this.dialog.dataService.save().subscribe(res => {
  //     if (!res?.save?.error || !res?.update?.error) {
  //       if (!this.dialog.dataService.dataSelected.isNew())
  //         this.dialog.dataService.hasSaved = true;
  //       if (data)
  //         this.line = data;
  //       else {
  //         this.line.recID = Util.uid();
  //         this.line.rangeID = this.master.rangeID;
  //         this.codxService.setAddNew(this.line, 'recID')
  //       }
  //       this.callfc.openForm(template, '', 500, 400);
  //     }
  //   });
  // }
}
