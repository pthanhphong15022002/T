import { GroupMembers, UserGroup } from '../../models/UserGroups.model';
import {
  Component,
  OnInit,
  Optional,
  ChangeDetectorRef,
  ViewChild,
  Injector,
} from '@angular/core';
import {
  ApiHttpService,
  CallFuncService,
  CodxService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { FormGroup } from '@angular/forms';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { PopRolesComponent } from '../../users/pop-roles/pop-roles.component';
import { tmpTNMD } from '../../models/tmpTenantModules.models';
import { CodxAdService } from '../../codx-ad.service';
import { map } from 'rxjs';
import { tmpformChooseRole } from '../../models/tmpformChooseRole.models';

@Component({
  selector: 'lib-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css'],
})
export class AddApproversComponent extends UIComponent {
  //#region Constructor
  master: any;
  orgData: any;
  members: Array<any> = [];
  detailIDs: string;
  dialog: DialogRef;
  title: string = '';
  action: string = 'add';
  isInValid = true;
  isGroupType3 = false;
  isTemp = true;
  lstChangeFunc: tmpTNMD[] = [];
  lstRoles: tmpformChooseRole[] = [];

  //#region Roles
  dialogRoles: DialogRef;
  //#endregion
  constructor(
    private inject: Injector,
    // private api: ApiHttpService,
    private notiService: NotificationsService,
    // private codxService: CodxService,
    private adService: CodxAdService,
    // private callfc: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.title = dialogData.data[0];
    this.action = dialogData.data[1];
    this.isTemp = this.action == 'add';
    this.master = dialog.dataService!.dataSelected;
    this.orgData = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
  }
  //#endregion

  //#region ViewChild
  @ViewChild('form', { static: true }) form;
  //#endregion

  //#region  Init
  onInit(): void {
    if (this.master.members && this.master.members.length) {
      this.master?.members?.forEach((mem) => {
        mem.userID = mem.memberID;
        mem.isAdded = true;
        mem.isRemoved = false;
      });
      this.members = this.master?.members;
      console.log('details', this.members);

      this.detailIDs = this.master.memberIDs;
    }

    this.dialog.beforeClose.subscribe((res) => {
      if (!res.event && this.action == 'edit') {
        if (this.master.updateColumn) {
          let updateColumn = this.master.updateColumn.split(';');
          updateColumn.forEach((e) => {
            let key = this.codxService.capitalize(e);
            this.master[key] = this.orgData[key];
          });
        }
      }
      if (this.isTemp) {
        this.dialog.close(this.master);
      }
      this.dialog.dataService.clear();
    });
  }

  ngAfterViewInit() {
    if (this.form) {
      this.form?.formGroup?.controls['groupType'].valueChanges.subscribe(
        (crrValue) => {
          this.isGroupType3 = crrValue == '3';
        }
      );
    }
  }
  //#endregion

  //#region event
  eventApply(e) {
    if (!e.data || e.data.length == 0) return;
    else {
      e?.data.dataSelected.forEach((modelShare) => {
        //chua add
        if (
          this.members.findIndex(
            (x) => x.memberID == modelShare.dataSelected.UserID
          ) == -1
        ) {
          modelShare.dataSelected.isAdded = false;
          modelShare.dataSelected.isRemoved = false;
          modelShare.dataSelected.memberID = modelShare.dataSelected.UserID;
          modelShare.dataSelected.userID = modelShare.dataSelected.UserID;
          modelShare.dataSelected.memberName = modelShare.dataSelected.UserName;
          modelShare.dataSelected.positionName =
            modelShare.dataSelected.PositionName;
          modelShare.dataSelected.orgUnitName =
            modelShare.dataSelected.OrgUnitName;

          this.members.push(modelShare.dataSelected);
        }
      });
      console.log(this.members);
    }
    // if (!this.dialog.dataService.hasSaved && this.action == 'add') {
    //   this.dialog.dataService
    //     .save((opt: RequestOption) => this.beforeSave(opt), 0, '', '', false)
    //     .subscribe((res) => {
    //       if (res && !res.error) {
    //         this.master.groupID = this.dialog.dataService.dataSelected.groupID;
    //         this.dialog.dataService.hasSaved = true;
    //         this.beforeSaveMember(e.data);
    //       }
    //       // else {
    //       //   this.api
    //       //     .execSv<any>(
    //       //       'SYS',
    //       //       'AD',
    //       //       'GroupMembersBusiness',
    //       //       'DeleteAsync',
    //       //       this.dialog.dataService.dataSelected.groupID
    //       //     )
    //       //     .subscribe((res) => {
    //       //       if (res) {
    //       //         console.log('del', res);
    //       //       }
    //       //     });
    //       // }
    //     });
    // } else this.beforeSaveMember(e.data);
  }

  onSave() {
    if (this.dialog.dataService.hasSaved) {
      this.dialog.dataService.hasSaved = false;
      if (this.members.length)
        this.dialog.dataService.update(this.master).subscribe();
      this.dialog.close(true);
    } else {
      this.dialog.dataService
        .save((opt: RequestOption) => this.beforeSave(opt), 0)
        .subscribe((res) => {
          if (res && !res.error) {
            this.master.groupID = this.dialog.dataService.dataSelected.groupID;
            this.dialog.dataService.hasSaved = false;
            this.dialog.close(true);
          }
        });
    }
  }

  removeDetail(item) {
    if (!item) return;
    if (item.isAdded == false) {
      this.members = this.members.filter((mem) => mem.userID != item.userID);
    } else {
      let curMem = this.members.find((mem) => mem.userID == item.userID);
      curMem.isRemoved = true;
    }
    this.changeDetectorRef.detectChanges();
    // this.api
    //   .execSv<any>('SYS', 'AD', 'GroupMembersBusiness', 'DeleteAsync', [id])
    //   .subscribe((res) => {
    //     if (res) {
    //       let idx = this.members.findIndex((x) => x.recID == id);
    //       if (idx > -1) {
    //         this.members.splice(idx, 1);
    //         let ids = '';
    //         this.members.forEach((v) => {
    //           ids += v.memberID + ';';
    //         });
    //         this.master['memberIDs'] = ids;
    //         this.master['members'] = this.members;
    //         this.dialog.dataService.update(this.master);
    //       }
    //     }
    //   });
  }
  //#endregion

  //#region Method
  saveMember(data: any) {
    let groupMembers = new Array<GroupMembers>();
    data?.dataSelected?.forEach((e) => {
      let member = new GroupMembers();
      member.groupID = this.master.groupID;
      member.memberID = e.id;
      member.memberType = 'U';
      member.memberName = e.text || e.objectName;
      member.positionName = e?.dataSelected?.PositionName;
      member.orgUnitName = e?.dataSelected?.OrgUnitName;
      groupMembers.push(member);
    });

    this.api
      .execSv<any>('SYS', 'AD', 'GroupMembersBusiness', 'AddAsync', [
        groupMembers,
        this.form?.formGroup?.get('groupType')?.value,
        this.lstRoles,
        this.lstChangeFunc,
      ])
      .subscribe((res) => {
        this.dialog.dataService.hasSaved = true;
        if (res && res.length == 3) {
          this.master.memberType = res[0];
          this.master.memberIDs = this.detailIDs
            ? this.detailIDs + ';' + res[1]
            : res[1];
          this.members = [...this.members, ...res[2]];
          this.master.members = this.members;
          //  this.dialog.dataService.update(this.master).subscribe();
        }
        // else {
        //   this.api
        //     .execSv<any>(
        //       'SYS',
        //       'AD',
        //       'GroupMembersBusiness',
        //       'DeleteAsync',
        //       this.dialog.dataService.dataSelected.groupID
        //     )
        //     .subscribe((res) => {
        //       if (res) {
        //         console.log('del', res);
        //       }
        //     });
        // }
      });
  }

  beforeSaveMember(data: any) {
    if (data?.dataSelected?.length > 0) {
      this.adService.checkExistedUserRoles(data.value).subscribe((res) => {
        if (res != null) {
          this.notiService.alertCode('AD023', null, res).subscribe((e) => {
            if (e?.event?.status == 'Y') {
              this.adService
                .getListValidOrderForModules(
                  this.lstChangeFunc,
                  data?.dataSelected?.length
                )
                .subscribe((lstTNMDs: tmpTNMD[]) => {
                  this.lstChangeFunc = lstTNMDs;
                  if (lstTNMDs == null || lstTNMDs.find((x) => x.isError)) {
                    this.notiService.notifyCode('AD017');
                  } else {
                    this.saveMember(data);
                  }
                });
            }
          });
        } else {
          this.adService
            .getListValidOrderForModules(
              this.lstChangeFunc,
              data?.dataSelected?.length
            )
            .subscribe((lstTNMDs: tmpTNMD[]) => {
              this.lstChangeFunc = lstTNMDs;
              if (lstTNMDs == null || lstTNMDs.find((x) => x.isError)) {
                this.notiService.notifyCode('AD017');
              } else {
                this.saveMember(data);
              }
            });
        }
      });
    } else {
      this.saveMember(data);
    }
  }

  beforeSave(opt: RequestOption) {
    // if (this.master?.members?.length > 0) {

    // ((lstTNMDs: tmpTNMD[]) => {
    //   if (lstTNMDs == null || lstTNMDs.find((x) => x.isError)) {
    //     this.notiService.notifyCode('AD017');
    //     return false;
    //   } else {
    //     opt.service = 'SYS';
    //     opt.assemblyName = 'AD';
    //     opt.className = 'UserGroupsBusiness';

    //     if (this.action == 'add') opt.methodName = 'AddAsync';
    //     else opt.methodName = 'UpdateAsync';

    //     opt.data = this.master;
    //     return true;
    //   }
    // });
    // } else {
    opt.service = 'SYS';
    opt.assemblyName = 'AD';
    opt.className = 'UserGroupsBusiness';

    if (this.action == 'add') opt.methodName = 'AddAsync';
    else opt.methodName = 'UpdateAsync';

    opt.data = this.master;
    return true;
    // }
  }
  //#endregion

  //#region Test
  show() {
    console.log('form', this.form);
  }
  //#endregion

  popRoles(item: any) {
    let option = new DialogModel();
    let obj = {
      formType: this.action,
      data: item,
      userID: this.master.groupID,
      quantity: this.members.length,
      isGroupUser: true,
    };
    this.dialogRoles = this.callfc.openForm(
      PopRolesComponent,
      '',
      1200,
      700,
      '',
      obj,
      '',
      option
    );
    this.dialogRoles.closed.subscribe((e) => {
      this.lstRoles = e?.event[0] ?? [];
      this.lstChangeFunc = e?.event[1] ?? [];
    });
  }
}
