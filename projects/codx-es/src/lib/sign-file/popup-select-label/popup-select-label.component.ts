import { Component, Injector, OnInit, Optional } from '@angular/core';
import { ImageElement } from '@syncfusion/ej2-angular-diagrams';
import { UIComponent, AuthStore, DialogData, DialogRef } from 'codx-core';
import { CodxEsService } from '../../codx-es.service';

@Component({
  selector: 'lib-popup-select-label',
  templateUrl: './popup-select-label.component.html',
  styleUrls: ['./popup-select-label.component.scss'],
})
export class PopupSelectLabelComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private esService: CodxEsService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.data = dt.data;
  }

  data;
  title: string;
  funcID;
  dialog;

  curLabel;
  labels = [
    // { idx: 0, image: 'assets\\img\\Labels\\Urgent.jpg' },
    // { idx: 1, image: 'assets\\img\\Labels\\Illegal.jpg' },
    // { idx: 2, image: 'assets\\img\\Labels\\Express.jpg' },
  ];

  onInit(): void {
    this.title = this.data.title;
    this.labels = this.data.labels;

    this.detectorRef.detectChanges();
  }
  closePopUp(isComplete) {
    if (isComplete) {
      this.dialog.close(this.curLabel);
    } else this.dialog.close(null);
  }

  changeLabel(e: any) {
    this.curLabel = e;
  }
}
