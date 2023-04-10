import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  CodxFormComponent,
  DataRequest,
  NotificationsService,
} from 'codx-core';
import { Observable } from 'rxjs';
import { IJournal } from './interfaces/IJournal.interface';
import { CodxAcService } from '../codx-ac.service';

@Injectable({
  providedIn: 'root',
})
export class JournalService {
  constructor(
    private api: ApiHttpService,
    private acService: CodxAcService,
    private notiService: NotificationsService
  ) {}

  deleteAutoNumber(autoNoCode: string): Observable<any> {
    return this.api.execSv(
      'SYS',
      'AD',
      'AutoNumbersBusiness',
      'DeleteAutoNumberAsync',
      [autoNoCode]
    );
  }

  handleVoucherNoAndSave(
    journal: IJournal,
    model: any,
    service: string,
    entityName: string,
    form: CodxFormComponent,
    isEdit: boolean,
    saveFunction
  ) {
    // if this voucherNo already exists,
    // the system will automatically suggest another voucherNo
    if (
      journal.voucherNoRule !== '0' &&
      journal.duplicateVoucherNo === '0' &&
      model.voucherNo
    ) {
      const options = new DataRequest();
      options.entityName = entityName;
      options.predicates = !isEdit ? 'VoucherNo=@0' : "VoucherNo=@0&&RecID!=@1";
      options.dataValues = !isEdit ? model.voucherNo : `${model.voucherNo};${model.recID}`;
      options.pageLoading = false;
      this.acService.loadDataAsync(service, options).subscribe((res: any[]) => {
        if (res.length > 0) {
          this.api
            .exec(
              'ERM.Business.AC',
              'CommonBusiness',
              'GenerateAutoNumberAsync',
              journal.journalNo
            )
            .subscribe((autoNumber: string) => {
              this.notiService
                .alertCode(
                  'AC0003',
                  null,
                  `'${model.voucherNo}'`,
                  `'${autoNumber}'`
                )
                .subscribe((res) => {
                  console.log(res);
                  if (res.event.status === 'Y') {
                    form.formGroup.patchValue({ voucherNo: autoNumber });
                    saveFunction();
                  }

                  return;
                });
            });
        } else {
          saveFunction();
        }
      });
    } else {
      saveFunction();
    }
  }
}
