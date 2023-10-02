import { AfterViewInit, Component, OnInit, Optional } from '@angular/core';
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

@Component({
  selector: 'lib-popup-add-status-code',
  templateUrl: './popup-add-status-code.component.html',
  styleUrls: ['./popup-add-status-code.component.scss'],
})
export class PopupAddStatusCodeComponent implements OnInit, AfterViewInit {
  dialog: any;
  gridViewSetup: any;

  action: string = '';
  headerText: string = '';
  planceHolderAutoNumber:string = '';

  data:CM_StatusCode = new CM_StatusCode();

  disabledShowInput = false;

  valueListStatus:any[]=[];


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
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {

  }

  async promiseAll() {
   await this.getAutoNumber();
   this.data.category &&  await this.getValueListStatus('CRM042');
  }

  async getAutoNumber(){
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

  async getValueListStatus(valueList){
    this.cache.valueList(valueList).subscribe((func) => {
      if (func) {
        this.valueListStatus= func.datas.map((item) => ({
            text: item.text,
            value: item.value,
          }));
          debugger;
      }
    });
  }

  //#region save
  onSave() {
    if (
      !this.data?.statusName || this.data?.statusName?.trim() == ''
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup?.StatusName?.headerText + '"'
      );
      return;
    }
    if (
      !this.data?.category
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup?.Category?.headerText + '"'
      );
      return;
    }
    if (
      !this.data?.objectStatus && this.data?.objectStatus != '0'
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup?.ObjectStatus?.headerText + '"'
      );
      return;
    }
    if (this.action == 'edit') {
      this.onEdit();
    } else {
      this.onAdd();
    }
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
    }
    option.className = 'StatusCodesBusiness';
    option.data = datas;
    option.service = 'CM';
    return true;
  }
  //#endregion

  valueChange($event) {
    this.data[$event?.field] = $event?.data?.trim();
  }
  valueChangeStatus($event) {
    if($event) {
      this.data.objectStatus= $event;
      // if(this.valueListStatus && this.valueListStatus?.length > 0) {

      //   let obj = this.valueListStatus.filter(x=>x.value == $event)[0];


      // }

    }

  }
}
