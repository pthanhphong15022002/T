import { L } from '@angular/cdk/keycodes';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  UIComponent,
  CodxFormComponent,
  FormModel,
  DialogRef,
  CacheService,
  CallFuncService,
  NotificationsService,
  DialogData,
  RequestOption,
} from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { Inventorymodels } from '../../models/Inventorymodels.model';

@Component({
  selector: 'lib-pop-add-inventory',
  templateUrl: './pop-add-inventory.component.html',
  styleUrls: ['./pop-add-inventory.component.css'],
})
export class PopAddInventoryComponent extends UIComponent {
  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  title: string;
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  inventory: Inventorymodels;
  gridViewSetup: any;
  validate: any = 0;
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    {
      icon: 'icon-playlist_add_check',
      text: 'Dành hàng',
      name: 'Goods',
    },
  ];
  formType: any;
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.inventory = dialog.dataService!.dataSelected;
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.cache
      .gridViewSetup('InventoryModels', 'grvInventoryModels')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  //#endregion

  //#region Event
  valueChange(e: any) {
    this.inventory[e.field] = e.data;
  }
  valueChanges(e: any) {
    if (e.data) {
      this.inventory[e.field] = '1';
    }else{
      this.inventory[e.field] = '0';
    }
  }
  //#endregion

  //#region Function
  setTitle(e: any) {
    this.title = this.headerText;
    this.dt.detectChanges();
  }
  clearInventory() {
    this.form.formGroup.reset();
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.inventory);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.inventory[keymodel[i]] == null ||
              this.inventory[keymodel[i]] == ''
            ) {
              this.notification.notifyCode(
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
  //#endregion

  //#region CRUD
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'AddAsync';
            opt.className = 'InventoryModelsBusiness';
            opt.assemblyName = 'IV';
            opt.service = 'IV';
            opt.data = [this.inventory];
            return true;
          })
          .subscribe((res) => {
            if (res.save) {
              this.dialog.close();
              this.dt.detectChanges();
            } else {
              this.notification.notifyCode(
                'SYS031',
                0,
                '"' + this.inventory.inventModelID + '"'
              );
              return;
            }
          });
      }
      if (this.formType == 'edit') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'UpdateAsync';
            opt.className = 'InventoryModelsBusiness';
            opt.assemblyName = 'IV';
            opt.service = 'IV';
            opt.data = [this.inventory];
            return true;
          })
          .subscribe((res) => {
            if (res.save || res.update) {
              this.dialog.close();
              this.dt.detectChanges();
            }
          });
      }
    }
  }
  onSaveAdd() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'AddAsync';
          opt.className = 'InventoryModelsBusiness';
          opt.assemblyName = 'IV';
          opt.service = 'IV';
          opt.data = [this.inventory];
          return true;
        })
        .subscribe((res) => {
          if (res.save) {
            this.clearInventory();
            this.dialog.dataService.clear();
            this.dialog.dataService.addNew().subscribe((res) => {
              this.inventory = this.dialog.dataService!.dataSelected;
            });
          } else {
            this.notification.notifyCode(
              'SYS031',
              0,
              '"' + this.inventory.inventModelID + '"'
            );
            return;
          }
        });
    }
  }
  //#endregion
}
