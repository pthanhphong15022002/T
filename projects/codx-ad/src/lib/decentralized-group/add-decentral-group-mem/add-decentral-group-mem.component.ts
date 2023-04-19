import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  LayoutAddComponent,
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

  isSaved = false;

  formType = 'add';
  @ViewChild('form') form: LayoutAddComponent;

  constructor(
    private inject: Injector,
    private adServices: CodxAdService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.groupData = dialog.dataService!.dataSelected;
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

    // this.cache.functionList(this.formModel.funcID).subscribe((res) => {
    //   if (res) {
    //     this.header = this.title;
    //   }
    // });
  }

  clickAddMemeber() {
    this.popAddMemberState = !this.popAddMemberState;
    this.detectorRef.detectChanges();
  }

  openPopRoles() {
    let option = new DialogModel();
    let needValidate = this.groupData.memberIDs?.split(';')?.length > 0;
    let lstUserIDs = [this.groupData.groupID];
    if (needValidate) {
      lstUserIDs.push(this.groupData.memberIDs?.split(';'));
    }

    let obj = {
      formType: this.formType,
      data: this.groupData.groupRoles,
      lstMemIDs: lstUserIDs,
      needValidate: needValidate,
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

  changeLstMembers(event) {
    this.popAddMemberState = !this.popAddMemberState;
    if (event == null) return;
    this.groupData.members = [];

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
      this.groupData.members.push(tmpGroupMem);
    });
    this.groupData.memberIDs = event?.id;
  }

  removeMember(item) {
    this.groupData.members = this.groupData.members.filter(
      (mem) => mem.memberID != item.memberID
    );
    let tmpMemberIDs = [];
    this.groupData.members.forEach((mem) => {
      tmpMemberIDs.push(mem.memberID);
    });
    this.groupData.memberIDs = tmpMemberIDs.join(';');
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
            this.openPopRoles();
          }
        }
      });
  }
}
