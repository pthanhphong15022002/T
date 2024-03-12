import { AfterViewInit, Component, OnInit, Optional } from '@angular/core';
import {
  ApiHttpService,
  CRUDService,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';

@Component({
  selector: 'lib-popup-add-customer-groups',
  templateUrl: './popup-add-customer-groups.component.html',
  styleUrls: ['./popup-add-customer-groups.component.css'],
})
export class PopupAddCustomerGroupsComponent implements OnInit, AfterViewInit {
  dialog: any;
  data: any;
  headerText = '';
  action: any;
  mess = '';
  planceHolderAutoNumber = '';
  disabledShowInput = false;
  gridViewSetup: any;
  isView: boolean = false;
  arrFieldForm: any;

  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dialog?.dataService?.dataSelected));
    this.headerText = dt?.data?.headerText;
    this.action = dt?.data?.action;
    this.gridViewSetup = dt?.data?.gridViewSetup;
    let arrField = Object.values(this.gridViewSetup).filter(
      (x: any) => x.allowPopup
    );

    if (Array.isArray(arrField)) {
      this.arrFieldForm = arrField
        .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
        .map((x: any) => Util.camelize(x.fieldName));
    }
    this.isView = dt?.data?.isView ?? false;
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {
    this.api
      .execSv<any>(
        'SYS',
        'AD',
        'AutoNumberDefaultsBusiness',
        'GetFieldAutoNoAsync',
        [this.dialog?.formModel?.funcID, this.dialog?.formModel?.entityName]
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

  //#region save
  onSave() {
    if (
      this.data?.custGroupName == null ||
      this.data?.custGroupName.trim() == ''
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup?.CustGroupName?.headerText + '"'
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
        if (res && res?.save) {
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

  beforeSave(op) {
    var data = [];
    if (this.action === 'add' || this.action == 'copy') {
      op.method = 'AddAsync';
    } else {
      op.method = 'EditAsync';
    }
    op.className = 'CustomerGroupsBusiness';
    data = [this.data];
    op.data = data;
    return true;
  }
  //#endregion

  valueChange(e) {
    this.data[e?.field] = e?.data?.trim();
  }
}
