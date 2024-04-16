import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { CodxFormComponent, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-setting-conditional',
  templateUrl: './popup-setting-conditional.component.html',
  styleUrls: ['./popup-setting-conditional.component.css']
})
export class PopupSettingConditionalComponent implements OnInit, AfterViewInit {
  @ViewChild('form') form: CodxFormComponent;
  titleAction: string = ''
  dialog: DialogRef

  constructor(

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {

  }
  ngOnInit(): void {

  }
  ngAfterViewInit(): void {

  }
}
