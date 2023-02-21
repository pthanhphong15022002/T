import { L } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { UIComponent, CodxFormComponent, FormModel, DialogRef, CacheService, CallFuncService, NotificationsService, DialogData, RequestOption } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { Inventorymodels } from '../../models/Inventorymodels.model';

@Component({
  selector: 'lib-pop-add-inventory',
  templateUrl: './pop-add-inventory.component.html',
  styleUrls: ['./pop-add-inventory.component.css']
})
export class PopAddInventoryComponent extends UIComponent {
  @ViewChild('form') form: CodxFormComponent;
  title: string;
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  inventory: Inventorymodels;
  inventorys: Inventorymodels;
  inventModelID:any;
  inventModelName:any;
  gridViewSetup:any;
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
    this.inventModelID = '';
    this.inventModelName = '';
    if (this.inventory.inventModelID != null) {
      this.inventModelID = this.inventory.inventModelID;
      this.inventModelName = this.inventory.inventModelName;
    }
    this.cache.gridViewSetup('InventoryModels', 'grvInventoryModels').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
  }

  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  setTitle(e: any) {
    this.title = this.headerText;
    this.dt.detectChanges();
  }
  valueChange(e: any) {
    this.inventory[e.field] = e.data;
  }
  valueChangeInventModelID(e:any){
    this.inventModelID = e.data;
    this.inventory[e.field] = e.data;
  }
  valueChangeInventModelName(e:any){
    this.inventModelName = e.data;
    this.inventory[e.field] = e.data;
  }
  onSave(){
    if (this.inventModelID.trim() == '' || this.inventModelID == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['InventModelID'].headerText + '"'
      );
      return;
    }
    if (this.inventModelName.trim() == '' || this.inventModelName == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['InventModelName'].headerText + '"'
      );
      return;
    }
    if (this.formType == 'add') {
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
              '"' + this.inventModelID + '"'
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
  onSaveAdd(){
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
          } else {
            this.notification.notifyCode(
              'SYS031',
              0,
              '"' + this.inventModelID + '"'
            );
            return;
          }
        });
  }
  clearInventory(){
    this.inventModelID = '';
    this.inventModelName = '';
    this.inventory.inventCosting = null;
    this.inventory.accountControl = false;
    this.inventory.postFinancial = false;
    this.inventory.postPhysical = false;
    this.inventory.checkOnhand = null;
    this.inventory.nagetiveFinancial = false;
    this.inventory.nagetivePhysical = false;
    this.inventory.requireRegister = false;
    this.inventory.stdCostReceipt = false;
    this.inventory.requirePick = false;
    this.inventory.stdCostIssue = false;
    this.inventory.qualityControl = false;
    this.inventory.reserveMethod = null;
    this.inventory.reserveRule = null;
    this.inventory.reservePartial = false;
    this.inventory.reserveOrdered = false;
    this.inventory.reserveSameBatch = false;
    this.inventory.reserveExpired = false;
    this.inventory.expiredDays = 0;
  }
}
