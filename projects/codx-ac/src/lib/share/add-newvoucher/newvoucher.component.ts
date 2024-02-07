import { Component, Injector, Optional } from '@angular/core';
import { DataRequest, DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { map } from 'rxjs';

@Component({
  selector: 'lib-newvoucher',
  templateUrl: './newvoucher.component.html',
  styleUrls: ['./newvoucher.component.css']
})
export class NewvoucherComponent extends UIComponent {
  dialog!: DialogRef;
  newvoucherNo: any = '';
  journalType: any = '';
  journalNo: any = '';
  constructor(
    inject: Injector,
    private notification: NotificationsService,
    private acService: CodxAcService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.journalType = dialogData.data.journalType;
    this.journalNo = dialogData.data.journalNo;
  }

  onInit(): void {
    this.acService.setPopupSize(this.dialog, '300px', '150px');
    (this.dialog.dialog as any).properties.minHeight = 0;
  }

  valueChange(event: any) {
    this.newvoucherNo = event?.data;
  }

  onSave() {
    if (this.newvoucherNo == null || this.newvoucherNo == '') {
      this.notification.notify('Vui lòng nhập số chứng từ!', '2');
      return;
    }
    let arObj = this.dialog.formModel.entityName.split('_');
    let service = arObj[0];
    let options = new DataRequest();
    options.entityName = this.dialog.formModel.entityName;
    options.pageLoading = false;
    options.predicates = 'JournalType=@0 and JournalNo=@1';
    options.dataValues = this.journalType + ';' + this.journalNo;
    this.api
      .execSv(service, 'Core', 'DataBusiness', 'LoadDataAsync', options)
      .pipe(map((r) => r?.[0] ?? [])).subscribe((res: any) => {
        if (res && res.length) {
          let data = res.filter(x => x.voucherNo == this.newvoucherNo);
          if (data.length) {
            this.notification.notify('Số chứng từ đã tồn tại! Vui lòng nhập lại', '2');
            return;
          }else{
            this.dialog.close(this.newvoucherNo);
          }
        }else{
          this.dialog.close(this.newvoucherNo);
        }
      })
  }
}
