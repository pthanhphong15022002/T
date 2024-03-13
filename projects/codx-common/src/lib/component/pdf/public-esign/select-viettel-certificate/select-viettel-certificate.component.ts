import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'select-viettel-certificate',
  templateUrl: './select-viettel-certificate.component.html',
  styleUrls: ['./select-viettel-certificate.component.css']
})
export class SelectViettelCertificateComponent implements OnInit{
  dialog: DialogRef;
  lstCert=[];
    selectedCert: any;
  constructor(
    private notifySvr: NotificationsService,
    private detectorRef: ChangeDetectorRef,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  )
  {
    this.dialog = dialog;
    this.lstCert = dt?.data?.lstCert;    
    this.selectedCert = this.lstCert[0];
  }
  ngOnInit(): void {
    
  }
  
  certChange(evt, cert) {
    this.selectedCert = cert;
    this.detectorRef.detectChanges();
  }
  applyViettel(){
    this.detectorRef.detectChanges();
    this.dialog && this.dialog.close(this.selectedCert);
  }
}
