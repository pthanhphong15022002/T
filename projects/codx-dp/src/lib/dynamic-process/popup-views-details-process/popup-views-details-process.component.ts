import { DP_Processes } from './../../models/models';
import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { TabModel } from '../../models/models';
import { DomSanitizer } from '@angular/platform-browser';
import { CodxDpService } from '../../codx-dp.service';

@Component({
  selector: 'lib-popup-views-details-process',
  templateUrl: './popup-views-details-process.component.html',
  styleUrls: ['./popup-views-details-process.component.scss'],
})
export class PopupViewsDetailsProcessComponent implements OnInit {
  dialog: DialogRef;
  name = 'Mission';

  process = new DP_Processes();
  tabControl: TabModel[] = [
    { name: 'Mission', textDefault: 'Nhiệm vụ', isActive: true },
    { name: 'Dashboard', textDefault: 'Dashboard', isActive: false },
  ];
  // value
  vllApplyFor = 'DP002';
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
    private dpService: CodxDpService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.process = dt?.data?.data;
    this.dpService
      .updateHistoryViewProcessesAsync(this.process.recID)
      .subscribe();
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
