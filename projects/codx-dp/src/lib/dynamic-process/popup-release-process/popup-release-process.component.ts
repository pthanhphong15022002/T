import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CodxComboboxComponent,
  CodxFormComponent,
  CodxInputComponent,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { CodxDpService } from '../../codx-dp.service';

@Component({
  selector: 'lib-popup-release-process',
  templateUrl: './popup-release-process.component.html',
  styleUrls: ['./popup-release-process.component.css'],
})
export class PopupReleaseProcessComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('moduleCbx') moduleCbx: CodxInputComponent;
  @ViewChild('functionCbx') functionCbx: CodxInputComponent;

  dialog: DialogRef;
  data: any;
  headerText = '';
  grvSetup: any;
  processName = '';
  applyFor = '';
  crrModule: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private dpService: CodxDpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = dt?.data?.processRelease;
    this.headerText = dt?.data?.headerText;
    this.grvSetup = dt?.data?.grvSetup;
    this.processName = dt?.data?.processName;
    this.applyFor = dt?.data?.applyFor;
  }

  ngOnInit(): void {}

  changeValue(event) {
    let value = event?.data;
    if (typeof event?.data === 'string') {
      value = value.trim();
    }
    this.data[event?.field] = value;
  }

  changeValueCbx(e) {
    if (!e?.data || !e?.field) {
      if (e.field == 'module') {
        this.data['function'] = null;
        this.functionCbx.model = null;

        (
          this.functionCbx.ComponentCurrent as CodxComboboxComponent
        ).dataService.data = [];
        this.functionCbx.crrValue = null;
      }
      this.form.formGroup.patchValue(this.data);
      return;
    }
    this.data[e.field] = e.data;
    // let module = e?.component?.itemsSelected[0]?.Module ?? e?.data; //tesst

    switch (e?.field) {
      case 'module':
        this.crrModule = e?.data;

        this.functionCbx.model = { Module: this.crrModule };
        (
          this.functionCbx.ComponentCurrent as CodxComboboxComponent
        ).dataService.data = [];
        this.functionCbx.crrValue = null;
        this.data.function = null;

        break;
      case 'function':
        this.crrModule = e?.component?.itemsSelected[0]?.Module;
        (
          this.moduleCbx.ComponentCurrent as CodxComboboxComponent
        ).dataService.data = [];
        this.moduleCbx.crrValue = this.crrModule;
        this.data.module = this.crrModule;
        break;
    }

    this.form.formGroup.patchValue(this.data);
  }

  saveReleaseProcess() {
    if (!this.data.releasedName.trim()) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['ReleasedName'].headerText + '"'
      );
      return;
    }
    if (!this.data.module) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['Module'].headerText + '"'
      );
      return;
    }
    if (!this.data.function) {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['Function'].headerText + '"'
      );
      return;
    }

    this.dpService.releaseProcess([this.data, true]).subscribe((res) => {
      if (res) {
        this.data.modifiedOn = res;
        this.dialog.close(this.data);
      } else this.dialog.close();
    });
  }
}
