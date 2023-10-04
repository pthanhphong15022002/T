import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CodxComboboxComponent,
  CodxFormComponent,
  DataRequest,
  NotificationsService,
  PageLink,
  PageTitleService
} from 'codx-core';
import { Observable, Subject, combineLatest, map, tap } from 'rxjs';
import { CodxAcService } from '../codx-ac.service';
import {
  IJournal,
  Vll004,
  Vll067,
  Vll075,
} from './interfaces/IJournal.interface';
import { HiddenFieldName } from './models/HiddenFieldName.model';

@Injectable({
  providedIn: 'root',
})
export class JournalService {
  duplicateVoucherNo: string;

  constructor(
    private apiService: ApiHttpService,
    private acService: CodxAcService,
    private notiService: NotificationsService,
    private cacheService: CacheService,
    private authStore: AuthStore,
    private pageTitleService: PageTitleService
  ) {
    this.cacheService
      .viewSettingValues('ACParameters')
      .pipe(
        tap((o) => console.log(o)),
        map((arr) => arr.filter((f) => f.category === '1')[0]),
        map((data) => JSON.parse(data.dataValue)?.DuplicateVoucherNo)
      )
      .subscribe((res) => {
        this.duplicateVoucherNo = res;
      });
  }

  deleteAutoNumber(autoNoCode: string): void {
    this.apiService
      .execSv('SYS', 'AD', 'AutoNumbersBusiness', 'DeleteAutoNumberAsync', [
        autoNoCode,
      ])
      .subscribe((res) => console.log(res));
  }

  getJournal$(journalNo: string): Observable<IJournal> {
    return this.apiService.exec<any>(
      'AC',
      'JournalsBusiness',
      'GetAsync',
      journalNo
    );
  }

  /**
   * If this model.voucherNo already exists, the system will automatically suggest another voucherNo.
   * @param isUpdate A boolean value that indicates whether you are in edit mode.*/
  checkVoucherNoBeforeSave(
    journal: IJournal,
    model: any,
    service: string,
    entityName: string,
    form: CodxFormComponent,
    isUpdate: boolean,
    saveFunction: () => void
  ): void {
    if (
      journal.assignRule === Vll075.ThuCong &&
      this.duplicateVoucherNo === '2' &&
      model.voucherNo
    ) {
      const options = new DataRequest();
      options.entityName = entityName;
      options.predicates = !isUpdate
        ? 'VoucherNo=@0'
        : 'VoucherNo=@0&&RecID!=@1';
      options.dataValues = !isUpdate
        ? model.voucherNo
        : `${model.voucherNo};${model.recID}`;
      options.pageLoading = false;
      this.acService.loadData$(service, options).subscribe((res: any[]) => {
        if (res.length > 0) {
          this.apiService
            .exec(
              'ERM.Business.AC',
              'CommonBusiness',
              'GenerateAutoNumberAsync',
              journal.voucherFormat
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

  getHiddenFields(
    journal: IJournal,
    hiddenFieldName = new HiddenFieldName()
  ): string[] {
    let hiddenFields: string[] = [];

    if (journal?.drAcctControl == Vll067.KhongKiemSoat) {
      hiddenFields.push(hiddenFieldName.drAcctControl);
    }

    if (journal?.crAcctControl == Vll067.KhongKiemSoat) {
      hiddenFields.push(hiddenFieldName.crAcctControl);
    }

    if (journal?.diM1Control == Vll067.KhongKiemSoat) {
      hiddenFields.push('DIM1');
    }

    if (journal?.diM2Control == Vll067.KhongKiemSoat) {
      hiddenFields.push('DIM2');
    }

    if (journal?.diM3Control == Vll067.KhongKiemSoat) {
      hiddenFields.push('DIM3');
    }

    if (journal?.projectControl == Vll004.KhongSuDung) {
      hiddenFields.push(hiddenFieldName.projectControl);
    }

    if (journal?.assetControl == Vll004.KhongSuDung) {
      hiddenFields.push(hiddenFieldName.assetControl);
    }

    if (journal?.loanControl === Vll004.KhongSuDung) {
    }

    if (journal?.vatControl == '0') {
      hiddenFields.push('VATID', 'VATBase', 'VATAmt', 'VATPct');
    }

    if (!journal?.useDutyTax) {
      hiddenFields.push('SalesTaxPct', 'SalesTaxAmt');
    }

    if (!journal?.useExciseTax) {
      hiddenFields.push('ExciseTaxPct', 'ExciseTaxAmt');
    }

    if (!journal.idimControl) {
      return hiddenFields;
    }

    const idimControls: string[] = journal.idimControl?.split(';');
    for (let i = 0; i < 10; i++) {
      if (!idimControls.includes(i.toString())) {
        hiddenFields.push('IDIM' + i);
      }
    }

    return hiddenFields;
  }

  /** Handle 12th point */
  loadComboboxBy067(
    journal: IJournal,
    vll067Prop: string,
    valueProp: string,
    filterKey: string,
    cbx: CodxComboboxComponent,
    formGroup: FormGroup,
    patchKey: string,
    isEdit: boolean
  ): void {
    if (
      [Vll067.GiaTriCoDinh, Vll067.TrongDanhSach].includes(journal[vll067Prop])
    ) {
      cbx.dataService.setPredicates(
        [`@0.Contains(${filterKey})`],
        [`[${journal[valueProp]}]`]
      );
    }

    // mac dinh, co dinh
    if (
      [Vll067.MacDinh, Vll067.GiaTriCoDinh].includes(journal[vll067Prop]) &&
      !isEdit
    ) {
      formGroup?.patchValue({
        [patchKey]: journal[valueProp],
      });
    }
  }

  hasVouchers$(journal: IJournal): Observable<boolean> {
    const subject = new Subject<boolean>();

    this.cacheService
      .valueList('AC076')
      .pipe(
        tap((t) => console.log('AC076', t)),
        map(
          (m) =>
            m.datas
              .filter((d) => d.value === journal.journalType)
              .map((d) => d.text)[0]
        )
      )
      .subscribe((entityName: string) => {
        const service = entityName.split('_')[0];
        const options = new DataRequest();
        options.entityName = entityName;
        options.predicates = 'JournalNo=@0';
        options.dataValues = journal.journalNo;
        options.pageLoading = false;
        this.acService.loadData$(service, options).subscribe((res) => {
          if (res.length > 0) {
            subject.next(true);
          } else {
            subject.next(false);
          }
        });
      });

    return subject
      .asObservable()
      .pipe(tap((t) => console.log('hasVouchers', t)));
  }

  getUserGroups$(): Observable<any[]> {
    return this.acService.loadComboboxData$('Share_GroupUsers', 'AD');
  }

  getUserRoles$(): Observable<any[]> {
    return this.acService.loadComboboxData$('Share_UserRoles', 'AD');
  }

  getUsers$(): Observable<any[]> {
    return this.acService.loadComboboxData$('Share_Users', 'AD');
  }

  setChildLinks(journalNo: string): void {
    const options1 = new DataRequest();
    options1.entityName = 'SYS_FunctionList';
    options1.pageLoading = false;
    options1.predicates = 'ParentID=@0 and Language=@1';
    options1.dataValues = `ACT;${this.authStore.get().language}`;

    const options2 = new DataRequest();
    options2.entityName = 'AC_Journals';
    options2.pageLoading = false;
    options2.predicates = 'Status=@0';
    options2.dataValues = '1';

    combineLatest({
      functionList: this.acService.loadData$('SYS', options1),
      journals: this.acService.loadData$('AC', options2),
      vll077: this.cacheService.valueList('AC077').pipe(map((v) => v.datas)),
    }).subscribe(({ functionList, journals, vll077 }) => {
      console.log(journals);
      const links: PageLink[] = [];
      for (const journal of journals as IJournal[]) {
        if (journal.journalNo === journalNo) {
          continue;
        }

        const functionId: string = vll077.find(
          (v) => v.value === journal.journalType
        )?.default;
        const func: any = functionList.find((f) => f.functionID === functionId);
        links.push({
          title: func?.defaultName,
          desc: journal.journalDesc,
          path: func?.url + `?journalNo=${journal.journalNo}`,
        });
      }

      this.pageTitleService.setChildren(links);
    });
  }
}
