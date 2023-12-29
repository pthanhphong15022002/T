import { components } from './../../../../../../codx-ws/src/lib/approvals/routing';
import {
  AfterViewInit,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CacheService,
  ApiHttpService,
  NotificationsService,
  DialogRef,
  DialogData,
  CRUDService,
  RequestOption,
} from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';
import { CM_StatusCode } from '../../../models/cm_model';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';

@Component({
  selector: 'lib-popup-add-status-code',
  templateUrl: './popup-add-status-code.component.html',
  styleUrls: ['./popup-add-status-code.component.scss'],
})
export class PopupAddStatusCodeComponent implements OnInit, AfterViewInit {
  @ViewChild('samples') public samples?: ComboBoxComponent;

  dialog: any;
  gridViewSetup: any;

  action: string = '';
  headerText: string = '';
  valueList: string = '';
  objectStatus: string = '';
  planceHolderAutoNumber: string = '';

  data: CM_StatusCode = new CM_StatusCode();

  disabledShowInput = false;

  valueListStatus: any[] = [];

  // const
  readonly actionAdd: string = 'add';
  readonly actionCopy: string = 'copy';
  readonly actionEdit: string = 'edit';
  readonly fieldCbxStatus = { text: 'text', value: 'value' };

  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private codxCmService: CodxCmService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dialog?.dataService?.dataSelected));
    this.headerText = dt?.data?.headerText;
    this.action = dt?.data?.action;
    this.gridViewSetup = dt?.data?.gridViewSetup;

    // this.data.category = '5'
    this.promiseAll();
    if (this.action !== this.actionAdd) {
      this.objectStatus = this.data.objectStatus;
    }
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {}

  async promiseAll() {
    await this.getAutoNumber();
    this.data?.category &&
      (await this.getValueListStatus(
        this.getValueTypeCategory(this.data?.category)
      ));
  }

  async getAutoNumber() {
    this.codxCmService
      .getFieldAutoNoDefault(
        this.dialog?.formModel?.funcID,
        this.dialog?.formModel?.entityName
      )
      .subscribe((res) => {
        if (res && !res.stop) {
          this.disabledShowInput = true;
          this.cache.message('AD019').subscribe((mes) => {
            if (mes)
              this.planceHolderAutoNumber = mes?.customName || mes?.description;
          });
        } else {
          this.disabledShowInput = false;
        }
      });
  }

  async getValueListStatus(value) {
    if (value) {
      this.cache.valueList(value).subscribe((func) => {
        if (func) {
          this.valueListStatus = func.datas.map((item) => ({
            text: item.text,
            value: item.value,
          }));
        }
      });
    } else {
      this.valueListStatus = [];
      this.samples.focusIn();
    }
  }

  //#region save
  onSave() {
    if (
      (!this.data?.statusID || this.data?.statusID?.trim() == '') &&
      !this.disabledShowInput
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup?.StatusID?.headerText + '"'
      );
      return;
    }
    if (!this.data?.statusName || this.data?.statusName?.trim() == '') {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup?.StatusName?.headerText + '"'
      );
      return;
    }
    if (!this.data?.category) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup?.Category?.headerText + '"'
      );
      return;
    }
    let data = [
      this.data.category,
      this.data.objectStatus,
      this.data.statusID,
      this.data.statusName,
      this.action,
    ];
    this.codxCmService.checkStatusCode(data).subscribe((res) => {
      if (res) {
        this.getMessageError(res, this.gridViewSetup);
      }
    });
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe(async (res) => {
        if (res) {
          this.dialog.close(res.save);
        }
      });
  }

  onEdit() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe(async (res) => {
        if (res && res.update) {
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();
          this.dialog.close(res.update);
        }
      });
  }

  beforeSave(option: RequestOption) {
    let datas = [this.data];
    if (this.action === 'add' || this.action == 'copy') {
      option.methodName = 'AddStatusCodeAsync';
    } else {
      //  op.method = 'EditAsync';
      option.methodName = 'EditStatusCodeAsync';
    }
    option.className = 'StatusCodesBusiness';
    option.data = datas;
    option.service = 'CM';
    return true;
  }
  //#endregion

  valueChange($event) {
    if ($event) {
      this.data[$event?.field] = $event?.data?.trim();
      if ($event?.field === 'category') {
        this.valueList = $event?.data;
        this.getValueListStatus(this.getValueTypeCategory(this.valueList));
      }
    }
  }
  valueChangeStatus($event) {
    this.objectStatus = $event;
    this.data.objectStatus = this.objectStatus;
  }

  // hard code
  getValueTypeCategory(value) {
    let vll = '';
    switch (value) {
      case '1': //custormer
        vll = 'CRM039';
        break;
      case '3': //lead
        vll = 'CRM041';
        break;
      case '5': //deal
        vll = 'CRM042';
        break;
      case '7': //contract
        vll = 'CRM015';
        break;
      case '9': //case
        vll = 'CRM076';
        break;
      case '11': //request
        vll = 'CRM077';
        break;
    }

    return vll;
  }

  getMessageError(value, gridViewSetup) {
    let headerName = '';
    if (value != '0') {
      // existing name
      if (value == '1') {
        headerName = gridViewSetup?.StatusID?.headerText;
      }
      // existing name
      else if (value == '2') {
        headerName = gridViewSetup?.StatusName?.headerText;
      }
      // existing status
      else if (value == '3') {
        headerName = gridViewSetup?.ObjectStatus?.headerText;
      }
      this.notiService.notifyCode('CM003', 0, '"' + headerName + '"');
      return;
    } else {
      if (this.action == 'edit') {
        this.onEdit();
      } else {
        this.onAdd();
      }
    }

    return;
  }
}
