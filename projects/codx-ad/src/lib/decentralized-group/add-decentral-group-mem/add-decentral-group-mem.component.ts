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
  header = '';
  title = '';
  groupData: any = {};
  dialog!: DialogRef;
  formModel: FormModel;

  lstAddedRoles: tmpformChooseRole[] = [];
  lstCurRoles: tmpformChooseRole[] = [];

  isTwoWays: boolean = true;
  popAddMemberState = false;
  width = 720;
  height = window.innerHeight;
  memberIDs: string = '';

  isSaveTemp: boolean = false;

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
    this.memberIDs = this.groupData.memberIDs;
    this.formType = dt?.data?.formType;
    this.title = dt?.data?.title;
  }

  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.cache.functionList(this.formModel.funcID).subscribe((res) => {
      if (res) {
        this.header = this.title;
      }
    });
  }

  clickAddMemeber() {
    this.popAddMemberState = !this.popAddMemberState;
    this.detectorRef.detectChanges();
  }

  openPopRoles() {
    if (!this.isSaveTemp) {
      console.log('group data', this.groupData);
    }
    let option = new DialogModel();
    let obj = {
      formType: this.formType,
      data: this.lstCurRoles,
      userID: this.groupData.groupID,
      quantity: 1,
      isGroupUser: true,
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
      this.lstCurRoles = e?.event[0] ?? [];
    });
  }

  changeLstMembers(event) {
    this.popAddMemberState = !this.popAddMemberState;
    console.log('change members', event);
  }

  beforeSave(opt: RequestOption) {
    opt.service = 'SYS';
    opt.assemblyName = 'AD';
    opt.className = 'UserGroupsBusiness';

    if (this.formType == 'add') opt.methodName = 'AddAsync';
    else opt.methodName = 'UpdateAsync';
    opt.data = [this.groupData];
    return true;
  }

  onSave() {
    this.dialog.dataService
      .save((opt: RequestOption) => this.beforeSave(opt), 0)
      .subscribe((res: any) => {
        if (res && !res.error) {
          this.groupData.groupID = this.dialog.dataService.dataSelected.groupID;
          this.dialog.close(this.groupData);
        }
      });
  }
}
