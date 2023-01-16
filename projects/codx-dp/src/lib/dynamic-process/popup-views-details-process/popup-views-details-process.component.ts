import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { TabModel } from '../../models/models';

@Component({
  selector: 'lib-popup-views-details-process',
  templateUrl: './popup-views-details-process.component.html',
  styleUrls: ['./popup-views-details-process.component.scss'],
})
export class PopupViewsDetailsProcessComponent implements OnInit {
  dialog: DialogRef;
  name = 'Mission';
  tabControl: TabModel[] = [
    { name: 'Mission', textDefault: 'Nhiệm vụ', isActive: true },
    { name: 'Dashboard', textDefault: 'Dashboard', isActive: false },
  ];
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
  }

  ngOnInit(): void {}

  clickMenu(item) {
    this.name = item.name;
    this.tabControl.forEach((obj) => {
      if (!obj.isActive && obj.name == this.name) {
        obj.isActive = true;
      } else obj.isActive = false;
    });
    this.changeDetectorRef.detectChanges();
  }
}
