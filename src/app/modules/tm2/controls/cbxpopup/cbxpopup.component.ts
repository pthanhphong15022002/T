import { Component, OnInit, Optional } from '@angular/core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { DialogData } from 'codx-core';

@Component({
  selector: 'app-cbxpopup',
  templateUrl: './cbxpopup.component.html',
  styleUrls: ['./cbxpopup.component.scss'],
})
export class CbxpopupComponent implements OnInit {
  data: any;
  dialog: any;
  constructor(@Optional() dt?: DialogData, @Optional() dialog?: Dialog) {
    this.data = dt;
    this.dialog = dialog;
  }

  ngOnInit(): void {}
}
