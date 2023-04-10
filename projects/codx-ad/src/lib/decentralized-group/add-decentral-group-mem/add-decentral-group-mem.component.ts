import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  DialogData,
  DialogRef,
  FormModel,
  LayoutAddComponent,
  UIComponent,
} from 'codx-core';
import { tmpformChooseRole } from '../../models/tmpformChooseRole.models';

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
  memberIDs: string[] = [];
  @ViewChild('form') form: LayoutAddComponent;

  constructor(
    private inject: Injector,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.groupData = dialog.dataService!.dataSelected;
  }
  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.cache.functionList(this.formModel.funcID).subscribe((res) => {
      if (res) {
        this.header =
          this.title +
          ' ' +
          res?.customName.charAt(0).toLocaleLowerCase() +
          res?.customName.slice(1);
      }
    });
  }
  clickAddMemeber() {
    this.popAddMemberState = !this.popAddMemberState;
    this.detectorRef.detectChanges();
  }

  openPopRoles() {}
  changeLstMembers(event) {
    this.popAddMemberState = !this.popAddMemberState;
    console.log('change members', event);
  }
}
