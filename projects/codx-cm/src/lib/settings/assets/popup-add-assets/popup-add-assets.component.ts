import {
  AfterViewInit,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CRUDService,
  CacheService,
  CodxInputComponent,
  DialogData,
  DialogRef,
  NotificationsService,
  RequestOption,
} from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';

@Component({
  selector: 'lib-popup-add-assets',
  templateUrl: './popup-add-assets.component.html',
  styleUrls: ['./popup-add-assets.component.css'],
})
export class PopupAddAssetsComponent implements OnInit, AfterViewInit {
  @ViewChild('cbxPlace') cbxPlace: CodxInputComponent;
  @ViewChild('objectID') objectID: CodxInputComponent;
  @ViewChild('cbxZone') zone: CodxInputComponent;

  dialog: any;
  gridViewSetup: any;

  action: string = '';
  headerText: string = '';
  valueList: string = '';
  objectStatus: string = '';
  planceHolderAutoNumber: string = '';
  disabledShowInput = false;
  valueListStatus: any[] = [];
  data: any;
  arrFieldForm: any[];
  validate = 0;
  viewOnly = true;

  constructor(
    private cache: CacheService,
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
    this.viewOnly = this.action == 'view';
    let arrField = Object.values(this.gridViewSetup).filter(
      (x: any) => x.allowPopup
    );

    if (Array.isArray(arrField)) {
      this.arrFieldForm = arrField
        .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
        .map(
          (x: any) => x.fieldName.charAt(0).toLowerCase() + x.fieldName.slice(1)
        );
    }
    this.getAutoNumber();
  }

  getAutoNumber() {
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
  ngAfterViewInit(): void {}
  ngOnInit(): void {}

  valueChange(e) {
    this.data[e.field] = e.data;
  }

  beforeSave(op: RequestOption) {
    op.service = 'AM';
    op.assemblyName = 'ERM.Business.AM';
    op.className = 'AssetsBusiness';
    let data = [];
    if (this.action == 'add' || this.action == 'copy') {
      op.methodName = 'SaveAsync';
      data = [this.data];
    } else if (this.action == 'edit') {
      op.methodName = 'UpdateAsync';
      data = [this.data];
    }
    op.data = data;
    return true;
  }

  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    }
    if (this.action == 'add' || this.action == 'copy') {
      this.onAdd();
    } else {
      this.onUpdate();
    }
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res && res.save) {
          (this.dialog.dataService as CRUDService).update(res.save).subscribe();

          this.dialog.close(res.save);
        }
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res && res?.update) {
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();
          this.dialog.close(res.update);
        }
      });
  }

  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.data);
    let dontCheckField = this.disabledShowInput ? 'businessLineID' : '';
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (
            keygrid[index].toLowerCase() == keymodel[i].toLowerCase() &&
            this.arrFieldForm.includes(keymodel[i]) &&
            dontCheckField != keymodel[i]
          ) {
            if (
              this.data[keymodel[i]] == null ||
              String(this.data[keymodel[i]]).match(/^ *$/) !== null
            ) {
              this.notiService.notifyCode(
                'SYS009',
                0,
                '"' + this.gridViewSetup[keygrid[index]].headerText + '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }
}
