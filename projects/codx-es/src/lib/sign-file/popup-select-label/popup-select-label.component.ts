import { Component, Injector, OnInit, Optional } from '@angular/core';
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

  curSelect;
  labels = [
    { idx: 0, src: 'assets\\Icons_Final\\Urgent.jpg' },
    { idx: 1, src: 'assets\\Icons_Final\\Illegal.jpg' },
    { idx: 2, src: 'assets\\Icons_Final\\Express.jpg' },
  ];
  onInit(): void {
    this.title = this.data.title;
  }
  closePopUp() {
    this.dialog.close();
  }

  changeLabel(e: any) {
    console.log('change label', e);
  }
}
