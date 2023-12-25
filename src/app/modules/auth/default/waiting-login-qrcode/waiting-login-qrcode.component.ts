import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'app-waiting-login-qrcode',
  templateUrl: './waiting-login-qrcode.component.html',
  styleUrls: ['./waiting-login-qrcode.component.scss']
})
export class WaitingLoginQrcodeComponent implements OnInit {
  dialog: any;
  userName: string;

  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) { 
    this.dialog = dialog;
    this.userName = dt.data.userName;
  }
  ngOnInit(): void {
    setTimeout(() => {
      window.location.reload();
    }, 180000);
  }

  close() {
    this.dialog.close();
  }
}
