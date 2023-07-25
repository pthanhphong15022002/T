import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CRUDService,
  CodxFormComponent,
  CodxInputComponent,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
  UIComponent
} from 'codx-core';
import { PopupAddAutoNumberComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-auto-number/popup-add-auto-number.component';
import { CodxApproveStepsComponent } from 'projects/codx-share/src/lib/components/codx-approve-steps/codx-approve-steps.component';
import { Observable, lastValueFrom } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CodxAcService } from '../../codx-ac.service';
import { IJournal } from '../interfaces/IJournal.interface';
import { IJournalPermission } from '../interfaces/IJournalPermission.interface';
import { JournalService } from '../journals.service';
import { MultiSelectPopupComponent } from '../multi-select-popup/multi-select-popup.component';
import { PopupPermissionComponent } from '../popup-permission/popup-permission.component';

const irrPropNames: string[] = [
  'drAcctControl',
  'drAcctID',
  'crAcctControl',
  'crAcctID',
  'diM1Control',
  'diM2Control',
  'diM3Control',
  'diM1',
  'diM2',
  'diM3',
  'idimControl',
];
@Component({
  selector: 'lib-popup-add-journal',
  templateUrl: './popup-add-journal.component.html',
  styleUrls: ['./popup-add-journal.component.css'],
})
export class PopupAddJournalComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('periodID') periodID: CodxInputComponent;
  @ViewChild('thumbnail') thumbnail: ImageViewerComponent;

  journal: IJournal = {
    unpostControl: false,
    autoPost: false,
  } as IJournal;
  oldJournal: IJournal;
  dataService: CRUDService;
  formTitle: string;
  gvs: any;
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Common information' },
    {
      icon: 'icon-settings',
      text: 'Thiết lập',
      name: 'Settings',
    },
    {
      icon: 'icon-people',
      text: 'Phân quyền',
      name: 'Roles',
    },
  ];
  fiscalYears: any[] = [];
  isEdit: boolean = false;
  hasVouchers: boolean = false;
  tempIDIMControls: any[] = [];
  arrowColorStyle: string;

  isHidden: boolean = true;
  isMultiple: boolean = true;
  comboboxName: string;
  comboboxValue: string;
  propName: string;

  dataValueProps088: string[] = [];
  notAllowEditingFields087: string[] = [];

  journalTypes104: string[] = [];
  journalTypes105: string[] = [];
  journalTypes106: string[] = [];
  journalTypes107: string[] = [];
  journalTypes108: string[] = [];
  journalTypes109: string[] = [];
  journalTypes110: string[] = [];
  journalTypes111: string[] = [];

  vllJournalTypes064: any[] = [];
  vllIDIMControls069: any[] = [];
  vllDateFormat: any;
  vll067: any[] = [];

  journalPermissions: IJournalPermission[] = [];
  creater: string;
  createrObjectType: string;
  approver: string;
  approverObjectType: string;
  poster: string;
  posterObjectType: string;
  unposter: string;
  unposterObjectType: string;
  sharer: string;
  sharerObjectType: string;

  constructor(
    injector: Injector,
    private acService: CodxAcService,
    private journalService: JournalService,
    private notiService: NotificationsService,
    @Optional() public dialogRef: DialogRef,
    @Optional() private dialogData: DialogData
  ) {
    super(injector);

    this.dataService = dialogRef.dataService;
    this.journal = { ...this.journal, ...this.dataService?.dataSelected };
    this.oldJournal = { ...this.journal };
    // this.journal.multiCurrency =
    //   this.journal.multiCurrency == '1' ? true : false;
    // this.journal.autoPost = ['1', '2'].includes(this.journal.autoPost)
    //   ? true
    //   : false;
    this.isEdit = dialogData.data.formType === 'edit';
  }
  //#endregion

  //#region Init
  onInit(): void {
    if (this.isEdit) {
      this.assignVllToProp2('AC087', 'notAllowEditingFields087');

      this.journalService.hasVouchers(this.journal).subscribe((res) => {
        this.hasVouchers = res;
      });

      const options = new DataRequest();
      options.entityName = 'AC_JournalsPermission';
      options.predicates = 'JournalNo=@0';
      options.dataValues = this.journal.journalNo;
      options.pageLoading = false;
      this.acService
        .loadDataAsync('AC', options)
        .subscribe(async (journalPermissions: IJournalPermission[]) => {
          this.journalPermissions = journalPermissions;

          let creater: string[] = [];
          let approver: string[] = [];
          let poster: string[] = [];
          let unposter: string[] = [];
          let sharer: string[] = [];

          for (const permission of journalPermissions) {
            permission.objectName = await this.getObjectNameAsync(
              permission.objectType,
              permission.objectID
            );

            if (permission.add === '1') {
              this.createrObjectType = permission.objectType;
              creater.push(permission.objectID);
            }

            if (permission.approval === '1') {
              this.approverObjectType = permission.objectType;
              approver.push(permission.objectID);
            }

            if (permission.post === '1') {
              this.posterObjectType = permission.objectType;
              poster.push(permission.objectID);
            }

            if (permission.unPost === '1') {
              this.unposterObjectType = permission.objectType;
              unposter.push(permission.objectID);
            }

            if (permission.share === '1') {
              this.sharerObjectType = permission.objectType;
              sharer.push(permission.objectID);
            }
          }

          this.creater = creater.join(';');
          this.approver = approver.join(';');
          this.poster = poster.join(';');
          this.unposter = unposter.join(';');
          this.sharer = sharer.join(';');
        });
    } else {
      // assign default idimControl in SYS_SettingValues to journal.idimControl
      this.cache
        .viewSettingValues('ACParameters')
        .pipe(
          map((arr) => arr.filter((f) => f.category === '1')?.[0]),
          map((data) => JSON.parse(data.dataValue)?.IDIMControl)
        )
        .subscribe((defaultIdimControl) => {
          this.journal.idimControl = defaultIdimControl;
          this.tempIDIMControls = this.vllIDIMControls069.filter((d) =>
            this.journal.idimControl?.split(';').includes(d.value)
          );
        });
    }

    this.cache.valueList('AC069').subscribe((res) => {
      this.vllIDIMControls069 = res.datas;

      this.tempIDIMControls = this.vllIDIMControls069.filter((d) =>
        this.journal.idimControl?.split(';').includes(d.value)
      );
    });

    this.cache
      .gridViewSetup(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .subscribe((res) => {
        console.log('gvs', res);
        this.gvs = res;
      });

    this.cache
      .valueList('AC088')
      .pipe(
        map((v) =>
          v.datas.map(
            (d) =>
              irrPropNames.find(
                (i) => i.toLowerCase() === d.value.toLowerCase()
              ) ?? this.acService.toCamelCase(d.value)
          )
        ),
        tap((t) => console.log(t))
      )
      .subscribe((res) => (this.dataValueProps088 = res));

    this.acService
      .loadComboboxData('FiscalPeriods', 'AC')
      .subscribe((periods) => {
        this.fiscalYears = [...new Set(periods.map((p) => p.FiscalYear))];
      });

    this.dialogRef.closed.subscribe((res) => {
      console.log(res);

      if (!res.event && !this.isEdit) {
        this.journalService.deleteAutoNumber(this.journal.voucherFormat);

        if (this.journal.hasImage) {
          this.acService.deleteFile(
            this.journal.recID,
            this.form.formModel.entityName
          );
        }
      }
    });

    this.cache
      .gridViewSetup('ESCategories', 'grvESCategories')
      .subscribe((gv) => {
        if (gv) {
          this.cache
            .valueList(gv['DateFormat']?.referedValue ?? 'L0088')
            .subscribe((vllDFormat) => {
              this.vllDateFormat = vllDFormat.datas;

              // this.getAutoNumber(this.journal.voucherFormat).subscribe(
              //   (autoNumber) => {
              //     this.form.formGroup.patchValue({
              //       voucherFormat: this.getAutoNumberFormat(autoNumber),
              //     });
              //   }
              // );
            });
        }
      });

    this.assignVllToProp1('AC067', 'vll067');
    this.assignVllToProp1('AC064', 'vllJournalTypes064');

    this.assignVllToProp2('AC104', 'journalTypes104');
    this.assignVllToProp2('AC105', 'journalTypes105');
    this.assignVllToProp2('AC106', 'journalTypes106');
    this.assignVllToProp2('AC107', 'journalTypes107');
    this.assignVllToProp2('AC108', 'journalTypes108');
    this.assignVllToProp2('AC109', 'journalTypes109');
    this.assignVllToProp2('AC110', 'journalTypes110');
    this.assignVllToProp2('AC111', 'journalTypes111');
  }

  ngAfterViewInit(): void {
    this.formTitle = this.dialogData.data?.formTitle;

    setTimeout(() => {
      let moreInfoLabel: Element = document.getElementById('moreInfo');
      let arrowColor: string = window.getComputedStyle(moreInfoLabel).color;
      this.arrowColorStyle = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='${arrowColor}'><path fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/></svg>")`;
    });
  }
  //#endregion

  //#region Event
  onShareInputChange(e): void {
    console.log('onShareInputChange', e);

    this[e.field + 'ObjectType'] = e.data[0]?.objectType;
    this[e.field] = e.data?.map((d) => d.id).join(';');
  }

  onInputChange(e): void {
    console.log('onInputChange', e);

    this.journal[e.field] = e.data;
  }

  onInputChange2(e): void {
    console.log('onInputChange2', e);

    if (!e.data) {
      return;
    }

    if (e.field === 'periodID') {
      this.journal.fiscalYear = e.data.substring(0, 4);

      if (this.journal.journalType) {
        let journalTypeName: string = this.vllJournalTypes064
          .filter((d) => d.value === this.journal.journalType)
          .map((d) => d.text)[0];

        this.form.formGroup.patchValue({
          journalDesc: `${journalTypeName} ${e.data}`,
        });
      }
    } else if (e.field === 'journalType') {
      let journalDesc: string = this.vllJournalTypes064
        .filter((d) => d.value === e.data)
        .map((d) => d.text)[0];

      if (this.journal.periodID) {
        journalDesc += ' ' + this.journal.periodID;
      }

      this.form.formGroup.patchValue({ journalDesc: journalDesc });
    }
  }

  onSelect(e): void {
    console.log('onSelect', e);
    this.journal.fiscalYear = e.itemData.value;
    // this.form.formGroup.controls.periodID.reset();
    // (this.periodID.ComponentCurrent.dataService as CRUDService).setPredicates(
    //   ['FiscalYear=@0'],
    //   [e.itemData.value]
    // );
  }

  async onClickSave(): Promise<void> {
    console.log(this.journal);
    console.log(this.thumbnail);

    if (
      !this.acService.validateFormData(
        this.form.formGroup,
        this.gvs,
        ['DIM1Control', 'DIM2Control', 'DIM3Control'],
        !this.journal.multiCurrency ? ['CurrencyID'] : []
      )
    ) {
      return;
    }

    // 4: kho
    if (
      this.journalTypes109.includes(this.journal.journalType) &&
      !this.journal.idimControl?.split(';').includes('4')
    ) {
      this.notiService.notifyCode('AC0015', 0);
      return;
    }

    const propNames1: string[] = [
      'drAcctControl',
      'crAcctControl',
      'diM1Control',
      'diM2Control',
      'diM3Control',
    ];
    const propNames2: string[] = [
      'drAcctID',
      'crAcctID',
      'diM1',
      'diM2',
      'diM3',
    ];
    const gvsPropNames: string[] = [
      'DRAcctControl',
      'CRAcctControl',
      'DIM1Control',
      'DIM2Control',
      'DIM3Control',
    ];
    for (let i = 0; i < propNames1.length; i++) {
      if (
        !this.validateVll067(
          this.journal[propNames1[i]],
          propNames2[i],
          gvsPropNames[i]
        )
      ) {
        return;
      }
    }

    if (!this.journalTypes105.includes(this.journal.journalType)) {
      this.journal.invoiceForm = null;
    }

    if (!this.journalTypes109.includes(this.journal.journalType)) {
      this.journal.idimControl = null;
    }

    let tempJournal: IJournal = { ...this.journal };

    // ghi so tu dong khi luu
    // if (this.journal.approvalControl === '0') {
    //   tempJournal.autoPost = this.journal.autoPost ? '2' : '0';
    // } else {
    //   tempJournal.autoPost = this.journal.autoPost ? '1' : '0';
    // }
    // tempJournal.multiCurrency = tempJournal.multiCurrency ? '1' : '0';

    const dataValueObj = {};
    for (const prop of this.dataValueProps088) {
      dataValueObj[prop] = tempJournal[prop];
    }
    tempJournal.extras = JSON.stringify(dataValueObj);

    // don't allow editing some fields if this journal has any vouchers.
    if (this.isEdit && this.hasVouchers) {
      const changedProps: string[] = this.findChangedProps(
        this.oldJournal,
        tempJournal
      ).map((f) => f.toLowerCase());

      const changedFields: string[] = this.notAllowEditingFields087
        .filter((d) => changedProps.includes(d.toLowerCase()))
        .map((d) => this.gvs?.[d]?.headerText);

      if (changedFields.length > 0) {
        this.notiService.notifyCode(
          'AC0008',
          0,
          `"${tempJournal.journalDesc}"`,
          `"${changedFields.join(', ')}"`
        );

        return;
      }
    }

    console.log(tempJournal);

    if (this.thumbnail?.imageUpload?.item) {
      const uploaded$ = this.thumbnail.updateFileDirectReload(
        this.journal.recID
      );
      const uploaded = await lastValueFrom(uploaded$);
      if (uploaded) {
        this.journal.hasImage = tempJournal.hasImage = 1;
      }
    }

    if (this.isEdit) {
      this.dataService.updateDatas.set(tempJournal.recID, tempJournal);
    } else {
      this.dataService.addDatas.set(tempJournal.recID, tempJournal);
    }
    this.dataService.save().subscribe((res: any) => {
      console.log(res);
      if (res.save.data || res.update.data) {
        this.api
          .exec('AC', 'JournalsPermissionBusiness', 'AddOrUpdateAsync', [
            this.journal.journalNo,
            this.creater,
            this.createrObjectType,
            this.approver,
            this.approverObjectType,
            this.poster,
            this.posterObjectType,
            this.unposter,
            this.unposterObjectType,
            this.sharer,
            this.sharerObjectType,
            this.isEdit,
          ])
          .subscribe((res) => {
            console.log(res);
            this.dialogRef.close(true);
          });
      }
    });
  }

  onClickOpenComboboxPopup(
    comboboxName: string,
    comboboxValue: string,
    propName: string,
    vll067: string
  ): void {
    if (['0', '1'].includes(vll067)) {
      this.isMultiple = false;
    }

    if (vll067 === '2') {
      this.isMultiple = true;
    }

    this.comboboxName = comboboxName;
    this.comboboxValue = comboboxValue;
    this.propName = propName;
    this.isHidden = false;
  }

  onClickOpenPermissionPopup(): void {
    // return;
    this.callfc.openForm(
      PopupPermissionComponent,
      'This param is not working',
      950,
      650,
      '',
      {
        journalPermissions: this.journalPermissions,
        journalNo: this.journal.journalNo,
      }
    );
  }

  onClickHideComboboxPopup(e): void {
    console.log('onClickHideComboboxPopup', e);

    if (e) {
      this.journal[this.propName] = e.id;
    }
    this.isHidden = true;
  }

  onClickOpenMultiSelectPopup(): void {
    this.callfc
      .openForm(
        MultiSelectPopupComponent,
        'This param is not working',
        400,
        500,
        '',
        {
          selectedOptions: this.journal.idimControl,
          showAll: false,
        }
      )
      .closed.subscribe(({ event }) => {
        console.log(event);

        // check undefined only
        if (event == null) {
          return;
        }

        this.journal.idimControl = event;
        this.tempIDIMControls = this.vllIDIMControls069.filter((d) =>
          this.journal.idimControl.split(';').includes(d.value)
        );
      });
  }

  onClickOpenAutoNumberPopup(): void {
    this.callfc
      .openForm(
        PopupAddAutoNumberComponent,
        '',
        1000,
        (screen.width * 40) / 100,
        '',
        {
          autoNoCode: this.journal.voucherFormat,
          description: this.dialogRef.formModel?.entityName,
          disableAssignRule: true,
          autoAssignRule: this.journal.assignRule,
        }
      )
      .closed.subscribe((res) => {
        console.log(res);

        if (res.event) {
          this.form.formGroup.patchValue({
            voucherFormat: res.event.autoNoCode,
          });
        }
      });
  }

  onCickOpenApprovalProcessPopup(): void {
    const dialogModel = new DialogModel();
    dialogModel.IsFull = true;
    this.callfc.openForm(
      CodxApproveStepsComponent,
      '',
      screen.width,
      screen.height,
      '',
      {
        type: '0',
      },
      '',
      dialogModel
    );
  }
  //#endregion

  //#region Method
  /** vll with pipe(map((d) => d.datas)) */
  assignVllToProp1(vllCode: string, propName: string): void {
    this.cache
      .valueList(vllCode)
      .pipe(
        tap((t) => console.log(vllCode, t)),
        map((d) => d.datas)
      )
      .subscribe((res) => {
        this[propName] = res;
      });
  }

  /** vll with pipe(map((d) => d.datas.map((v) => v.value))) */
  assignVllToProp2(vllCode: string, propName: string): void {
    this.cache
      .valueList(vllCode)
      .pipe(
        tap((t) => console.log(vllCode, t)),
        map((d) => d.datas.map((v) => v.value))
      )
      .subscribe((res) => {
        this[propName] = res;
      });
  }
  //#endregion

  //#region Function
  getAutoNumber(journalNo: string): Observable<any> {
    return this.api
      .exec('AD', 'AutoNumbersBusiness', 'GetAutoNumberAsync', journalNo)
      .pipe(tap((t) => console.log('getAutoNumber', t)));
  }

  getAutoNumberFormat(autoNumber): string {
    let autoNumberFormat: string = '';

    let dateFormat = '';
    if (autoNumber?.dateFormat != '0') {
      dateFormat =
        this.vllDateFormat.filter((p) => p.value == autoNumber?.dateFormat)[0]
          ?.text ?? '';
    }

    let lengthNumber;
    let strNumber = '';

    switch (autoNumber?.stringFormat) {
      // {value: '0', text: 'Chuỗi & Ngày - Số', default: 'Chuỗi & Ngày - Số', color: null, textColor: null, …}
      case '0': {
        autoNumberFormat =
          autoNumber?.fixedString + dateFormat + autoNumber?.separator;
        lengthNumber = autoNumber?.maxLength - autoNumberFormat.length;
        if (lengthNumber > 0) {
          strNumber = '#'.repeat(lengthNumber);
        }
        autoNumberFormat =
          autoNumber?.fixedString +
          dateFormat +
          autoNumber?.separator +
          strNumber;
        break;
      }
      // {value: '1', text: 'Chuỗi & Số - Ngày', default: 'Chuỗi & Số - Ngày', color: null, textColor: null, …}
      case '1': {
        autoNumberFormat =
          autoNumber?.fixedString + autoNumber?.separator + dateFormat;
        lengthNumber = autoNumber?.maxLength - autoNumberFormat.length;
        if (lengthNumber > 0) {
          strNumber = '#'.repeat(lengthNumber);
        }
        autoNumberFormat =
          autoNumber?.fixedString +
          strNumber +
          autoNumber?.separator +
          dateFormat;
        break;
      }
      // {value: '2', text: 'Số - Chuỗi & Ngày', default: 'Số - Chuỗi & Ngày', color: null, textColor: null, …}
      case '2': {
        autoNumberFormat =
          autoNumber?.fixedString + autoNumber?.separator + dateFormat;
        lengthNumber = autoNumber?.maxLength - autoNumberFormat.length;
        if (lengthNumber > 0) {
          strNumber = '#'.repeat(lengthNumber);
        }
        autoNumberFormat =
          strNumber +
          autoNumber?.separator +
          autoNumber?.fixedString +
          dateFormat;
        break;
      }
      // {value: '3', text: 'Số - Ngày & Chuỗi', default: 'Số - Ngày & Chuỗi', color: null, textColor: null, …}
      case '3': {
        autoNumberFormat =
          autoNumber?.fixedString + autoNumber?.separator + dateFormat;
        lengthNumber = autoNumber?.maxLength - autoNumberFormat.length;
        if (lengthNumber > 0) {
          strNumber = '#'.repeat(lengthNumber);
        }
        autoNumberFormat =
          strNumber +
          autoNumber?.separator +
          dateFormat +
          autoNumber?.fixedString;
        break;
      }
      // {value: '4', text: 'Ngày - Số & Chuỗi', default: 'Ngày - Số & Chuỗi', color: null, textColor: null, …}
      case '4': {
        autoNumberFormat =
          autoNumber?.fixedString + autoNumber?.separator + dateFormat;
        lengthNumber = autoNumber?.maxLength - autoNumberFormat.length;
        if (lengthNumber > 0) {
          strNumber = '#'.repeat(lengthNumber);
        }
        autoNumberFormat =
          dateFormat +
          autoNumber?.separator +
          strNumber +
          autoNumber?.fixedString;
        break;
      }
      // {value: '5', text: 'Ngày & Chuỗi & Số', default: 'Ngày & Chuỗi & Số', color: null, textColor: null, …}
      case '5': {
        autoNumberFormat = autoNumber?.fixedString + dateFormat;
        lengthNumber = autoNumber?.maxLength - autoNumberFormat.length;
        if (lengthNumber > 0) {
          strNumber = '#'.repeat(lengthNumber);
        }
        autoNumberFormat = dateFormat + autoNumber?.fixedString + strNumber;
        break;
      }
      // {value: '6', text: 'Chuỗi - Ngày', default: 'Chuỗi - Ngày', color: null, textColor: null, …}
      case '6': {
        autoNumberFormat =
          autoNumber?.fixedString + autoNumber?.separator + dateFormat;
        break;
      }
      // {value: '7', text: 'Ngày - Chuỗi', default: 'Ngày - Chuỗi', color: null, textColor: null, …}
      case '7': {
        autoNumberFormat =
          dateFormat + autoNumber?.separator + autoNumber?.fixedString;
        break;
      }
    }

    return autoNumberFormat.substring(0, autoNumber?.maxLength);
  }

  findChangedProps(oldJournal: IJournal, newJournal: IJournal): string[] {
    return Object.keys(oldJournal).filter((k) => {
      if (!oldJournal[k] && !newJournal[k]) {
        return false;
      }
      return oldJournal[k] !== newJournal[k];
    });
  }

  validateVll067(
    vll067: string,
    propName: string,
    gvsPropName: string
  ): boolean {
    if (['0', '1', '2'].includes(vll067) && !this.journal[propName]) {
      this.notiService.notifyCode(
        'AC0009',
        null,
        `"${this.vll067?.find((v) => v.value === vll067)?.text}"`,
        `"${this.gvs?.[gvsPropName]?.headerText}"`
      );

      return false;
    }

    return true;
  }

  async getObjectNameAsync(
    objectType: string,
    objectId: string
  ): Promise<string> {
    if (objectType === 'U') {
      const users = await lastValueFrom(
        this.acService.loadComboboxData(
          'Share_Users',
          'AD',
          'UserID=@0',
          objectId
        )
      );
      return users[0]?.UserName;
    } else if (objectType === 'UG') {
      const userGroups = await lastValueFrom(
        this.acService.loadComboboxData(
          'Share_GroupUsers',
          'AD',
          'GroupID=@0',
          objectId
        )
      );
      return userGroups[0]?.GroupName;
    } else if (objectType === 'R') {
      const userRoles = await lastValueFrom(
        this.acService.loadComboboxData(
          'Share_UserRoles',
          'AD',
          'RoleID=@0',
          objectId
        )
      );
      return userRoles[0]?.RoleName;
    }

    return '';
  }
  //#endregion
}
