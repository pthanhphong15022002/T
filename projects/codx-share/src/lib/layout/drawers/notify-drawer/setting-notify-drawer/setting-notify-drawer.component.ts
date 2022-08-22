import { Component, OnInit, Optional } from '@angular/core';
import { DialogRef, DialogData } from 'codx-core';

@Component({
  selector: 'lib-setting-notify-drawer',
  templateUrl: './setting-notify-drawer.component.html',
  styleUrls: ['./setting-notify-drawer.component.scss']
})
export class SettingNotifyDrawerComponent implements OnInit {

  dialog: any;
  constructor(
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) 
  {
    this.dialog = dialog;
  }

  ngOnInit(): void {
  }

}
