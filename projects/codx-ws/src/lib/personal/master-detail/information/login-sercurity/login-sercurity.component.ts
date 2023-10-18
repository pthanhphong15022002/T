import { Component, Optional } from '@angular/core';
import { AuthService, AuthStore, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-login-sercurity',
  templateUrl: './login-sercurity.component.html',
  styleUrls: ['./login-sercurity.component.css']
})
export class LoginSercurityComponent {
  dialog:any;
  user:any;
  pw:any;
  constructor(
    private auth: AuthStore,
    private authService: AuthService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  )
  {
    this.user = this.auth.get();
    this.dialog = dialog;
  }

  changePw(e:any)
  {
    this.pw = e?.data;
  }

  login()
  {
    this.authService.login(this.user?.email,this.pw).subscribe(item=>{
      this.dialog.close(!item.error ? true : false);
    })
  }
}
