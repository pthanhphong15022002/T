import { AfterViewInit, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef } from 'codx-core';
import { authSteps } from '../infomation.variable';
import { E } from '@angular/cdk/keycodes';

@Component({
  selector: 'lib-sercurity-totp',
  templateUrl: './sercurity-totp.component.html',
  styleUrls: ['./sercurity-totp.component.scss']
})
export class SercurityTOTPComponent implements OnInit , AfterViewInit {
  
  dialog:any;
  qrBase64:any;
  authSteps = authSteps;
  secret:any;
  twoFA:any;
  show:any = false;
  constructor(
    private api: ApiHttpService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  )
  {
    this.dialog = dialog;
    this.twoFA = dt?.data
  }
  ngAfterViewInit(): void {
    this.multiPaste();
  }
  ngOnInit(): void {
   
    this.getQRTOTP();
  }


  multiPaste()
  {
    document.addEventListener("paste", function(e:any) {
      if (e.target.type === "text") {
       var data = e.clipboardData.getData('Text');
       data = data.split('');
       [].forEach.call(document.querySelectorAll(".ws-input"), (node, index) => {
          node.value = data[index];
        });
      }
    });

    const inputs = document.getElementById("ws-inputs");
        
    inputs.addEventListener("input", function (e:any) {
      const target = e.target;
      const val = target.value;
    
      if (isNaN(val)) {
        target.value = "";
        return;
      }
    
      if (val != "") {
        const next = target.nextElementSibling;
        if (next) {
          next.focus();
        }
      }
    });
    
    inputs.addEventListener("keyup", function (e:any) {
      const target = e.target;
      const key = e.key.toLowerCase();
    
      if (key == "backspace" || key == "delete") {
        target.value = "";
        const prev = target.previousElementSibling;
        if (prev) {
          prev.focus();
        }
        return;
      }
    });
  }

  getQRTOTP()
  {
    //TOTP
    this.api
      .execSv(
        'SYS',
        'ERM.Business.AD',
        'UsersBusiness',
        'GenGoogleAuthenQRAsync',
        []
      )
      .subscribe((qrImg) => {
        if(qrImg)
        {
          this.qrBase64 = 'data:image/png;base64,' + qrImg[0];
          this.secret = qrImg[1]
        }
      });
  }

  onSave()
  {
    var inputs = document.getElementsByClassName( 'ws-input' );
    var data  = [].map.call(inputs, function( input ) {
        return input.value;
    }).join( '' );
    this.api
      .execSv(
        'SYS',
        'ERM.Business.AD',
        'UsersBusiness',
        'CheckTOTPAsync',
        [data,this.twoFA]
      )
      .subscribe((res) => {
        debugger
        if(res) this.dialog.close(true);
        else this.dialog.close(false);
      });
  }

  showLogin()
  {
    this.show = !this.show;
  }
}
