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
  ImageViewerComponent,
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
  @ViewChild('imageUpload') imageUpload?: ImageViewerComponent;

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
      // if (this.isTemp) {
      //   this.dialog.close(this.master);
      // }
      this.dialog.dataService.clear();
    });
  }

  ngAfterViewInit() {
    if (this.form) {
      if (this.form?.formGroup?.controls['groupType'].value == '3') {
        this.isGroupType3 = true;
      }
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
    }
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
            this.beforeSaveMember();
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
  }
  //#endregion

  //#region Method
  saveMember(groupType) {
    this.api
      .execSv<any>('SYS', 'AD', 'GroupMembersBusiness', 'AddUpdateAsync', [
        this.members,
        groupType,
        this.lstRoles,
        this.lstChangeFunc,
      ])
      .subscribe((res) => {
        if (res) {
          // this.dialog.dataService.hasSaved = true;
          this.dialog.dataService.hasSaved = false;
          this.master.members = res[2];
          this.master.memberIDs = res[1];
          // this.dialog.dataService.update(this.master).subscribe((res2) => {
          this.dialog.close(this.master);
          this.imageUpload
          .updateFileDirectReload(this.master.recID)
          .subscribe((result) => {
            if (result) {
              console.log('res', result);
            }
          });
          // });
        } else {
          this.dialog.dataService.hasSaved = true;
        }

        // else {
        //   this.dialog.close();
        // }
      });
  }

  beforeSaveMember() {
    let groupType = this.form?.formGroup?.get('groupType')?.value;
   
    if (this.members?.length > 0) {
      let lstMemID = [];
      this.members?.forEach((mem) => {
        mem.groupID = this.master.groupID;
        lstMemID.push(mem.memberID);
      });
      //co phan quyen

      if (groupType == '3') {
        if (this.lstChangeFunc.length != 0) {
          this.adService
            .getListValidOrderForModules(
              this.lstChangeFunc,
              this.members?.length
            )
            .subscribe((lstTNMDs: tmpTNMD[]) => {
              this.lstChangeFunc = lstTNMDs;
              if (lstTNMDs == null || lstTNMDs.find((x) => x.isError)) {
                this.notiService.notifyCode('AD017');
                this.dialog.dataService.hasSaved = true;
              } else {
                this.saveMember(groupType);
              }
            });
        } else {
          this.saveMember(groupType);
        }
        // this.adService.checkExistedUserRoles(lstMemID).subscribe((res) => {
        //   if (res != null) {
        //     this.notiService.notifyCode('AD022', null, res);
        //   } else {
        //     if (this.lstChangeFunc.length != 0) {
        //       this.adService
        //         .getListValidOrderForModules(
        //           this.lstChangeFunc,
        //           this.members?.length
        //         )
        //         .subscribe((lstTNMDs: tmpTNMD[]) => {
        //           this.lstChangeFunc = lstTNMDs;
        //           if (lstTNMDs == null || lstTNMDs.find((x) => x.isError)) {
        //             this.notiService.notifyCode('AD017');
        //           } else {
        //             this.saveMember(groupType);
        //           }
        //         });
        //     } else {
        //       this.saveMember(groupType);
        //     }
        //   }
        // });
      } else {
        this.saveMember(groupType);
      }
    } else {
      this.saveMember(groupType);
    }
  }

  beforeSave(opt: RequestOption) {
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
