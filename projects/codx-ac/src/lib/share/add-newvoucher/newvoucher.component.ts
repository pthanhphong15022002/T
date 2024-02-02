import { Component, Injector, Optional } from '@angular/core';
import { DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';

@Component({
  selector: 'lib-newvoucher',
  templateUrl: './newvoucher.component.html',
  styleUrls: ['./newvoucher.component.css']
})
export class NewvoucherComponent extends UIComponent {
  dialog!: DialogRef;
  currentvoucherNo:any = '';
  newvoucherNo:any = '';
  constructor(
    inject: Injector,
    private notification: NotificationsService,
    private acService: CodxAcService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.currentvoucherNo = dialogData.data.currentVoucherNo;
    console.log(this.currentvoucherNo);
  }

  onInit(): void {
    this.acService.setPopupSize(this.dialog, '300px', '150px'); 
    (this.dialog.dialog as any).properties.minHeight = 0;
  }

  valueChange(event:any){
    this.newvoucherNo = event?.data;
  }

  onSave(){
    if(this.newvoucherNo == null || this.newvoucherNo == ''){
      this.notification.notify('Vui lòng nhập số chứng từ!','2');
      return;
    }
    if(this.newvoucherNo == this.currentvoucherNo){
      this.notification.notify('Số chứng từ trùng với chứng từ sao chép! Vui lòng nhập lại','2');
      return;
    }
    this.dialog.close(this.newvoucherNo);
  }
}
