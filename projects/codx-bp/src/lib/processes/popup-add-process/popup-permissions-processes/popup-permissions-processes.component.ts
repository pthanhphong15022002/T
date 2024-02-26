import { ChangeDetectorRef, Component, Optional } from '@angular/core';
import { BP_Processes_Permissions } from '../../../models/BP_Processes.model';
import {
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';

@Component({
  selector: 'lib-popup-permissions-processes',
  templateUrl: './popup-permissions-processes.component.html',
  styleUrls: ['./popup-permissions-processes.component.css'],
})
export class PopupPermissionsProcessesComponent {
  lstPermissions: BP_Processes_Permissions[] = [];
  dialog: any;
  title = '';
  currentPemission = 0;
  //Role
  full: boolean = false;
  read: boolean;
  share: boolean;
  create: boolean;
  //Date
  startDate: Date;
  endDate: Date;
  isSetFull = false;

  constructor(
    private detectorRef: ChangeDetectorRef,
    private notiSv: NotificationsService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.lstPermissions = JSON.parse(JSON.stringify(dt?.data?.permissions));
    this.title = dt?.data?.title;
  }

  ngOnInit(): void {
    if (this.lstPermissions != null && this.lstPermissions.length > 0) {
      this.changePermission(0);
    }
  }

  //#region changePermissions click current
  async changePermission(index) {
    if (this.currentPemission > -1) {
      let oldIndex = this.currentPemission;
      if (
        oldIndex != index &&
        oldIndex > -1 &&
        this.lstPermissions[oldIndex] != null
      ) {
        this.lstPermissions[oldIndex].roleType = this.full ? 'O' : 'P';
        this.lstPermissions[oldIndex].read = this.read;
        this.lstPermissions[oldIndex].create = this.create;
        // this.lstPermissions[oldIndex].publish = this.publish;
        this.lstPermissions[oldIndex].share = this.share;
        this.lstPermissions[oldIndex].isActive = true;
        this.lstPermissions[oldIndex] = this.defaultRole(
          this.lstPermissions[oldIndex],
          this.lstPermissions[oldIndex].roleType
        );
        // this.permissions[oldIndex].startDate = this.startDate;
        // this.lstPermissions[oldIndex].endDate = this.endDate;
      }
    }

    if (this.lstPermissions[index] != null) {
      this.full = this.lstPermissions[index].roleType == 'O';
      // this.lstPermissions[index].publish;
      this.read = this.lstPermissions[index].read;
      this.create = this.lstPermissions[index].create;
      this.share = this.lstPermissions[index].share;
      this.currentPemission = index;
    } else {
      this.full = false;
      this.read = false;
      this.create = false;
      this.share = false;
      this.currentPemission = index;
    }
    this.detectorRef.detectChanges();
  }

  defaultRole(perm: BP_Processes_Permissions, roleType: string) {
    perm.update = roleType == 'O' ? true : false;
    perm.assign = roleType == 'O' ? true : false;
    perm.delete = roleType == 'O' ? true : false;
    perm.download = roleType == 'O' ? true : false;
    perm.allowPermit = roleType == 'O' ? true : false;
    perm.publish = roleType == 'O' ? true : false;
    perm.isActive = roleType == 'O' ? true : false;

    return perm;
  }
  //#endregion

  //#region  change
  valueChange($event, type) {
    var data = $event.data;
    switch (type) {
      case 'full':
        this.full = data;
        if (this.full) {
          this.read = true;
          this.create = true;
          this.share = true;
        }
        break;
      default:
        this.isSetFull = false;
        this[type] = data;
        break;
    }

    if (type != 'full' && data == false) this.full = false;
    this.lstPermissions[this.currentPemission].roleType = this.full ? 'O' : 'P';
    this.detectorRef.detectChanges();
  }

  controlFocus(isFull) {
    this.isSetFull = isFull;
    this.detectorRef.detectChanges();
  }

  checkAdminUpdate() {
    return false;
  }
  //#endregion

  onSave() {
    if (
      this.currentPemission > -1 &&
      this.lstPermissions[this.currentPemission] != null
    ) {
      this.lstPermissions[this.currentPemission].read = this.read;
      this.lstPermissions[this.currentPemission].create = this.create;
      this.lstPermissions[this.currentPemission].share = this.share;
      this.lstPermissions[this.currentPemission] = this.defaultRole(
        this.lstPermissions[this.currentPemission],
        this.lstPermissions[this.currentPemission].roleType
      );

      // this.lstPermissions[this.currentPemission].publish = this.publish;
    }
    this.dialog.close(this.lstPermissions);
    this.notiSv.notifyCode('SYS034');
  }
}
