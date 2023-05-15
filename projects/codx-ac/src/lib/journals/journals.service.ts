import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CodxComboboxComponent,
  CodxFormComponent,
  CodxInputComponent,
  DataRequest,
  NotificationsService,
} from 'codx-core';
import { Observable, map, tap } from 'rxjs';
import { CodxAcService } from '../codx-ac.service';
import { IJournal } from './interfaces/IJournal.interface';

@Injectable({
  providedIn: 'root',
})
export class JournalService {
  constructor(
    private api: ApiHttpService,
    private acService: CodxAcService,
    private notiService: NotificationsService,
    private cacheService: CacheService
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

  /**
   * If this model.voucherNo already exists, the system will automatically suggest another voucherNo.
   * @param isEdit A boolean value that indicates whether you are in edit mode.*/
  handleVoucherNoAndSave(
    journal: IJournal,
    model: any,
    service: string,
    entityName: string,
    form: CodxFormComponent,
    isEdit: boolean,
    saveFunction
  ): void {
    if (
      journal.voucherNoRule !== '0' &&
      journal.duplicateVoucherNo === '0' &&
      model.voucherNo
    ) {
      const options = new DataRequest();
      options.entityName = entityName;
      options.predicates = !isEdit ? 'VoucherNo=@0' : 'VoucherNo=@0&&RecID!=@1';
      options.dataValues = !isEdit
        ? model.voucherNo
        : `${model.voucherNo};${model.recID}`;
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

  getHiddenFields(journal: IJournal): string[] {
    let hiddenFields: string[] = [];

    if (journal?.diM1Control == '0') {
      hiddenFields.push('DIM1');
    }

    if (journal?.diM2Control == '0') {
      hiddenFields.push('DIM2');
    }

    if (journal?.diM3Control == '0') {
      hiddenFields.push('DIM3');
    }

    if (journal?.projectControl == '0') {
      hiddenFields.push('ProjectID');
    }

    if (journal?.assetControl == '0') {
      hiddenFields.push('AssetID');
    }

    const idimControls: string[] = journal?.idimControl?.split(',');
    for (let i = 0; i < idimControls.length; i++) {
      hiddenFields.push('IDIM' + idimControls[i]);
    }

    return hiddenFields;
  }

  setAccountCbxDataSourceByJournal(
    journal: IJournal,
    drAccountCbx: CodxInputComponent,
    crAccountCbx: CodxInputComponent
  ): void {
    // gia tri co dinh, danh sach
    if (['1', '2'].includes(journal?.drAcctControl)) {
      (
        drAccountCbx.ComponentCurrent as CodxComboboxComponent
      ).dataService.setPredicates(
        ['@0.Contains(AccountID)'],
        [`[${journal?.drAcctID}]`]
      );
    }

    if (['1', '2'].includes(journal?.crAcctControl)) {
      (
        crAccountCbx.ComponentCurrent as CodxComboboxComponent
      ).dataService.setPredicates(
        ['@0.Contains(AccountID)'],
        [`[${journal?.crAcctID}]`]
      );
    }

    // mac dinh
    if (journal?.drAcctControl === '0') {
      drAccountCbx.crrValue = journal?.drAcctID;
    }

    if (journal?.crAcctControl === '0') {
      crAccountCbx.crrValue = journal?.crAcctID;
    }
  }

  getVoucherNoPlaceholderText(): Observable<string> {
    return this.cacheService
      .moreFunction('AutoVoucherNumber', 'grvAutoVoucherNumber')
      .pipe(
        tap((t) => console.log(t)),
        map((data) => data.find((m) => m.functionID === 'ACT04')?.defaultName)
      );
  }
}
