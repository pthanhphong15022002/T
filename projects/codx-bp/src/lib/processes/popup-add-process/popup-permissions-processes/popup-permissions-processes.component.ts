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
  assign: boolean;
  update: boolean;
  delete: boolean;
  // publish: boolean;
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
        this.lstPermissions[oldIndex].full = this.full;
        this.lstPermissions[oldIndex].read = this.read;
        this.lstPermissions[oldIndex].create = this.create;
        this.lstPermissions[oldIndex].update = this.update;
        // this.lstPermissions[oldIndex].publish = this.publish;
        this.lstPermissions[oldIndex].delete = this.delete;
        this.lstPermissions[oldIndex].assign = this.assign;
        this.lstPermissions[oldIndex].isActive = true;

        // this.permissions[oldIndex].startDate = this.startDate;
        // this.lstPermissions[oldIndex].endDate = this.endDate;
      }
    }

    if (this.lstPermissions[index] != null) {
      this.full =
        this.lstPermissions[index].read &&
        this.lstPermissions[index].create &&
        this.lstPermissions[index].update &&
        this.lstPermissions[index].delete &&
        this.lstPermissions[index].assign;
      // this.lstPermissions[index].publish;
      this.read = this.lstPermissions[index].read;
      this.create = this.lstPermissions[index].create;
      this.update = this.lstPermissions[index].update;
      // this.publish = this.lstPermissions[index].publish;
      this.delete = this.lstPermissions[index].delete;
      this.assign = this.lstPermissions[index].assign;

      this.currentPemission = index;
    } else {
      this.full = false;
      this.read = false;
      this.create = false;
      this.update = false;
      // this.publish = false;
      this.delete = false;
      this.assign = false;
      this.currentPemission = index;
    }
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region  change
  valueChange($event, type) {
    var data = $event.data;
    switch (type) {
      case 'full':
        this.full = data;
        if (this.isSetFull) {
          this.read = data;
          this.create = data;
          this.update = data;
          // this.publish = data;
          this.delete = data;
          this.assign = data;
        }
        break;
      default:
        this.isSetFull = false;
        this[type] = data;
        break;
    }

    if (type != 'full' && data == false) this.full = false;

    if (
      this.read &&
      this.create &&
      this.update &&
      // this.publish &&
      this.delete &&
      this.assign
    )
      this.full = true;

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
      this.lstPermissions[this.currentPemission].full = this.full;
      this.lstPermissions[this.currentPemission].read = this.read;
      this.lstPermissions[this.currentPemission].create = this.create;
      this.lstPermissions[this.currentPemission].assign = this.assign;
      this.lstPermissions[this.currentPemission].delete = this.delete;
      this.lstPermissions[this.currentPemission].update = this.update;
      this.lstPermissions[this.currentPemission].isActive = true;
      // this.lstPermissions[this.currentPemission].publish = this.publish;
    }
    this.dialog.close(this.lstPermissions);
    this.notiSv.notifyCode('SYS034');
  }
}
