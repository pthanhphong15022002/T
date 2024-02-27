import { Component, Injector, Optional } from '@angular/core';
import { CodxAdService } from '../../codx-ad.service';
import {
  ApiHttpService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';

@Component({
  selector: 'lib-add-decentral-group',
  templateUrl: './add-decentral-group.component.html',
  styleUrls: ['./add-decentral-group.component.css'],
})
export class AddDecentralGroupComponent {
  //#region  Constructor
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-playlist_add_check', text: 'Phân quyền', name: 'Roles' },
  ];
  dialog!: DialogRef;
  data: any;
  height = window.innerHeight;
  popAddMemberState: boolean = false;
  constructor(
    private api: ApiHttpService,
    private adServices: CodxAdService,
    private notify: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.dialog = dialog;
    this.data = dialog.dataService?.dataSelected;
  }
  //#endregion

  //#region Function
  onCbxSelected(event) {}

  removeMember(data) {}

  onSave() {}
  //#endregion
}
