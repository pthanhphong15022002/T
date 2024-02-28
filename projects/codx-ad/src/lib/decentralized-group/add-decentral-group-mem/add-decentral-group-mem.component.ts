import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  LayoutAddComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { tmpformChooseRole } from '../../models/tmpformChooseRole.models';
import { PopRolesComponent } from '../../users/pop-roles/pop-roles.component';
import { CodxAdService } from '../../codx-ad.service';
import { GroupMembers } from '../../models/UserGroups.model';
@Component({
  selector: 'lib-add-decentral-group-mem',
  templateUrl: './add-decentral-group-mem.component.html',
  styleUrls: ['./add-decentral-group-mem.component.scss'],
})
export class AddDecentralGroupMemComponent extends UIComponent {
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-playlist_add_check', text: 'Phân quyền', name: 'Roles' },
  ];
  groupData: any = {};
  dialog!: DialogRef;
  formModel: FormModel;

  lstAddedRoles: tmpformChooseRole[] = [];

  popAddMemberState = false;
  width = 720;
  height = window.innerHeight;
  lstInvalidMemberNames = [];
  isSaved = false;
  formType = 'add';
  @ViewChild('form') form: LayoutAddComponent;

  constructor(
    private inject: Injector,
    private adServices: CodxAdService,
    private notify: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.groupData = dialog.dataService!.dataSelected;
    if (!this.groupData.members) {
      this.groupData.members = [];
    }
    console.log('constructor', this.groupData);

    this.formType = dt?.data?.formType;
    switch (this.formType) {
      case 'add':
      case 'update':
        this.isSaved = false;
        break;
      case 'edit':
        this.isSaved = true;
        break;
      default:
        break;
    }
  }

  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }

  clickAddMemeber() {
    this.popAddMemberState = !this.popAddMemberState;
    this.detectorRef.detectChanges();
  }

  openPopRoles() {
    let option = new DialogModel();

    let needValidate = false;
    if (this.groupData.memberIDs && this.groupData.memberIDs != '') {
      needValidate = true;
    }
    let lstUserIDs = [this.groupData.groupID];
    if (needValidate && this.groupData.memberIDs?.split(';').length > 0) {
      lstUserIDs.push(...this.groupData.memberIDs?.split(';'));
    }

    let obj = {
      formType: this.formType,
      data: this.groupData.groupRoles,
      lstMemIDs: lstUserIDs,
      needValidate: needValidate,
      autoCreated: true,
    };
    let dialogRoles = this.callfc.openForm(
      PopRolesComponent,
      '',
      1200,
      700,
      '',
      obj,
      '',
      option
    );
    dialogRoles.closed.subscribe((e) => {
      this.groupData.groupRoles = e?.event[0] ?? [];
    });
  }

  addGroupMembers(event) {
    if (event?.id != '') {
      if (this.groupData?.groupRoles?.length > 0) {
        this.adServices
          .validateGroupMemberRoles(event?.id)
          .subscribe((lstInvalidMemberIDs: string[]) => {
            if (lstInvalidMemberIDs?.length > 0) {
              let lstInvalidMemberNames = [];
              event?.dataSelected?.forEach((x) => {
                if (lstInvalidMemberIDs.includes(x.UserID)) {
                  lstInvalidMemberNames.push(x.UserName);
                }
              });
              //canh bao muon ghi de quyen khong
              this.notify
                .alertCode(
                  `Tài khoản ${lstInvalidMemberNames.join(
                    ', '
                  )}, bạn có muốn ghi đè quyền`
                )
                .subscribe((e) => {
                  let isOverrideRoles = false;
                  if (e?.event?.status == 'Y') {
                    isOverrideRoles = true;
                  }

                  this.addMember(event, isOverrideRoles);
                });
            } else {
              this.addMember(event, false);
            }
          });
      } else {
        this.addMember(event, false);
      }
    }
  }

  changeLstMembers(event) {
    this.popAddMemberState = !this.popAddMemberState;
    if (event == null) return;
    if (!this.isSaved) {
      // this.groupData.memberIDs = event.id;
      this.adServices
        .addUserGroupAsync(this.groupData)
        .subscribe((res: any) => {
          this.groupData.groupID = res.groupID;
          this.isSaved = true;
          this.addGroupMembers(event);
        });
    } else {
      this.addGroupMembers(event);
    }
  }

  addMember(event: any, isOverrideRoles: boolean) {
    let lstMemberIDs = this.groupData.memberIDs;
    this.groupData.memberIDs = event?.id;
    this.detectorRef.detectChanges();
    this.adServices
      .addUserGroupMemberAsync(this.groupData, isOverrideRoles)
      .subscribe((result) => {
        if (result) {
          event?.dataSelected?.forEach((mem) => {
            let tmpGroupMem: GroupMembers = {
              memberID: mem.UserID,
              memberName: mem.UserName,
              memberType: 'U',
              groupID: '',
              roleType: '',
              description: '',
              positionName: mem.PositionName,
              orgUnitName: mem.OrgUnitName,
            };
            if (!this.groupData.members.find((x) => x.memberID == mem.UserID)) {
              this.groupData.members.push(tmpGroupMem);
            }
          });
        } else {
          this.groupData.memberIDs = lstMemberIDs;
        }
      });
  }

  addMemberv2(isOverrideRoles: boolean) {
    let lstMemberIDs = this.groupData.memberIDs;
    this.detectorRef.detectChanges();
    this.adServices
      .addUserGroupMemberAsync(this.groupData, isOverrideRoles)
      .subscribe((result) => {
        if (result) {
          this.groupData.members.forEach((mem) => {
            let tmpGroupMem: GroupMembers = {
              memberID: mem.UserID,
              memberName: mem.UserName,
              memberType: 'U',
              groupID: '',
              roleType: '',
              description: '',
              positionName: mem.PositionName,
              orgUnitName: mem.OrgUnitName,
            };
            if (!this.groupData.members.find((x) => x.memberID == mem.UserID)) {
              this.groupData.members.push(tmpGroupMem);
            }
            this.dialog.close(this.groupData);
          });
        } else {
          this.groupData.memberIDs = lstMemberIDs;
        }
      });
  }

  removeMember(member) {
    let lstMDID = [];
    let lstMDS = [];

    this.groupData?.groupRoles?.forEach((role) => {
      lstMDID.push(role.module);
      if (!lstMDS.includes(role.moduleSales)) {
        lstMDS.push(role.moduleSales);
      }
    });
    this.adServices
      .removeGroupMember(lstMDID, lstMDS, this.groupData.groupID, [
        member.memberID,
      ])
      .subscribe((result) => {
        if (result) {
          this.groupData.members = this.groupData.members.filter(
            (mem) => mem.memberID != member.memberID
          );
          let tmpMemberIDs = [];
          this.groupData.members.forEach((mem) => {
            tmpMemberIDs.push(mem.memberID);
          });
          this.groupData.memberIDs = tmpMemberIDs.join(';');
        }
      });
  }

  beforeSave(opt: RequestOption) {
    opt.service = 'SYS';
    opt.assemblyName = 'AD';
    opt.className = 'UserGroupsBusiness';

    if (this.isSaved) {
      opt.methodName = 'UpdateAsync';
    } else {
      opt.methodName = 'AddAsync';
    }
    opt.data = [this.groupData];
    return true;
  }

  onSave(closePopup: boolean) {
    if (this.form?.formGroup?.status == 'INVALID') {
      return;
    }
    if (this.form?.formGroup?.dirty) {
      this.dialog.dataService
        .save((opt: RequestOption) => this.beforeSave(opt), 0)
        .subscribe((res: any) => {
          if (res && !res.error) {
            if (!this.isSaved) {
              this.groupData.groupID =
                this.dialog.dataService.dataSelected.groupID;
              this.groupData.members?.forEach((mem) => {
                mem.groupID = this.dialog.dataService.dataSelected.groupID;
              });

              this.isSaved = true;
            }

            if (closePopup) {
              this.dialog.close(this.groupData);
            } else {
              this.validateGroupMemberRoles();
              this.openPopRoles();
            }
          }
        });
    } else {
      if (closePopup) {
        if (this.lstInvalidMemberNames.length > 0) {
          this.notify
            .alertCode(
              `Tài khoản ${this.lstInvalidMemberNames.join(
                ', '
              )}, bạn có muốn ghi đè quyền`
            )
            .subscribe((e) => {
              if (e?.event?.status == 'Y') {
                this.addMemberv2(true);
              } else this.dialog.close(this.groupData);
            });
        } else this.dialog.close(this.groupData);
      } else {
        this.validateGroupMemberRoles();
        this.openPopRoles();
      }
    }
  }

  validateGroupMemberRoles() {
    this.adServices
      .validateGroupMemberRoles(this.groupData.memberIDs)
      .subscribe((r: any) => {
        if (r?.length > 0) {
          this.groupData.members.forEach((x) => {
            if (r.includes(x.memberID)) {
              this.lstInvalidMemberNames.push(x.memberName);
            }
          });
        }
      });
  }
}
