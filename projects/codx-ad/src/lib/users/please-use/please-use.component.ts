import { Component, OnInit, Injector, Optional } from '@angular/core';
import { DialogRef, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-please-use',
  templateUrl: './please-use.component.html',
  styleUrls: ['./please-use.component.scss'],
})
export class PleaseUseComponent extends UIComponent implements OnInit {
  dialog: DialogRef;
  email: any;
  constructor(private injector: Injector, @Optional() dialog: DialogRef) {
    super(injector);
    this.dialog = dialog;
  }

  onInit(): void {}

  valueChange(e) {
    if (e) this.email = e.data;
  }

  onContinue() {
    // this.api.execSv('SYS', 'ERM.Business')
  }
}
