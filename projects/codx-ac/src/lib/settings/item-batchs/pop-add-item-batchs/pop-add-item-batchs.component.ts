import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxFormComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { ItemBatchs } from '../../../models/ItemBatchs.model';

@Component({
  selector: 'lib-pop-add-item-batchs',
  templateUrl: './pop-add-item-batchs.component.html',
  styleUrls: ['./pop-add-item-batchs.component.css']
})
export class PopAddItemBatchsComponent extends UIComponent implements OnInit{
  
  @ViewChild('form') public form: CodxFormComponent;
  headerText: any;
  title: any;
  formModel: FormModel;
  dialog!: DialogRef;
  itemBatchs: ItemBatchs;
  gridViewSetup: any;
  formType: any;
  validate: any = 0;
  keyField: any = '';

  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ){
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.itemBatchs = dialog.dataService!.dataSelected;
    this.keyField = this.dialog.dataService!.keyField;
    this.formType = dialogData.data?.formType;
    this.cache.gridViewSetup('ItemBatchs', 'grvItemBatchs').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
  }
  
  onInit(): void {
  }

  valueChange(e)
  {
    switch(e.field)
    {
      case 'itemID':
        this.itemBatchs.itemID = e.data;
        break;
      case 'batchNo':
        this.itemBatchs.batchNo = e.data;
        break;
      case 'manufaturedDate':
        this.itemBatchs.manufaturedDate = e.data;
        this.validateDate();
        break;
      case 'expiredDate':
        this.itemBatchs.expiredDate = e.data;
        this.validateDate();
        break;
      case 'bestBeforeDate':
        this.itemBatchs.bestBeforeDate = e.data;
        this.validateBestBeforeDate();
        break;
      case 'vendorBatchNo':
        this.itemBatchs.vendorBatchNo = e.data;
        break;
      case 'vendorBatchDate':
        this.itemBatchs.vendorBatchDate = e.data;
        this.validateNCCDate();
        break;
      case 'vendorExpiredDate':
        this.itemBatchs.vendorExpiredDate = e.data;
        this.validateNCCDate();
        break;
      case 'note':
        this.itemBatchs.note = e.data;
        break;
      case 'stop':
        this.itemBatchs.stop = e.data;
        break;
    }
  }

  onSave(){
    this.validate = 0;
    this.checkValidate();
    this.validateDate();
    this.validateNCCDate();
    this.validateBestBeforeDate();
    if (this.validate > 0) {
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
        this.dialog.dataService
          .save(null, 0, '', 'SYS006', true)
          .subscribe((res) => {
            if (res.save) {
              this.dialog.close();
              this.dt.detectChanges();
            }
        });
      }
      if (this.formType == 'edit') {
        this.dialog.dataService.save(null, 0, '', '', true).subscribe((res) => {
          if (res && res.update.data != null) {
            this.dialog.close({
              update: true,
              data: res.update,
            });
            this.dt.detectChanges();
          }
        });
      }
    }
  }

  onClearItemBatchs()
  {
    this.itemBatchs = new ItemBatchs();
  }

  checkValidate() {
    //Note: Tự động khi lưu, Không check BatchNo
    let ignoredFields: string[] = [];
    if (this.keyField == 'BatchNo') {
      ignoredFields.push(this.keyField);
    }
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());
    //End Node

    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.itemBatchs);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        if (ignoredFields.includes(keygrid[index].toLowerCase())) {
          continue;
        }
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.itemBatchs[keymodel[i]] == null ||
              String(this.itemBatchs[keymodel[i]]).match(/^ *$/) !== null
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

  validateDate()
  {
    if(this.itemBatchs.expiredDate && this.itemBatchs.manufaturedDate)
    {
      var startDate = new Date(this.itemBatchs.manufaturedDate);
      var endDate = new Date(this.itemBatchs.expiredDate);
      if(startDate.getTime() >  endDate.getTime())
      {
        this.notification.notifyCode(
          'AC0024',
          0,
          '"' + '' + '"'
        );
        this.validate++;
      }
    }
  }
  
  validateNCCDate()
  {
    if(this.itemBatchs.vendorExpiredDate && this.itemBatchs.vendorBatchDate)
    {
      var startDate = new Date(this.itemBatchs.vendorBatchDate);
      var endDate = new Date(this.itemBatchs.vendorExpiredDate);
      if(startDate.getTime() >  endDate.getTime())
      {
        this.notification.notifyCode(
          'AC0024',
          0,
          '"' + '' + '"'
        );
        this.validate++;
      }
    }
  }

  validateBestBeforeDate()
  {
    if(this.itemBatchs.expiredDate && this.itemBatchs.manufaturedDate)
    {
      var startDate = new Date(this.itemBatchs.manufaturedDate);
      var endDate = new Date(this.itemBatchs.expiredDate);
      var bestDate = new Date(this.itemBatchs.bestBeforeDate);
      if(startDate.getTime() >  bestDate.getTime() || bestDate.getTime() > endDate.getTime())
      {
        this.notification.notifyCode(
          'AC0025',
          0,
          `'${this.gridViewSetup.BestBeforeDate.headerText}'`,
          `'${this.gridViewSetup.ManufaturedDate.headerText}'`,
          `'${this.gridViewSetup.ExpiredDate.headerText}'`
        );
        this.validate++;
        return;
      }
    }
    if(this.itemBatchs.expiredDate && !this.itemBatchs.manufaturedDate)
    {
      var startDate = new Date(this.itemBatchs.manufaturedDate);
      var endDate = new Date(this.itemBatchs.expiredDate);
      var bestDate = new Date(this.itemBatchs.bestBeforeDate);
      if(bestDate.getTime() > endDate.getTime())
      {
        this.notification.notifyCode(
          'AC0025',
          0,
          `'${this.gridViewSetup.BestBeforeDate.headerText}'`,
          `'${this.gridViewSetup.ManufaturedDate.headerText}'`,
          `'${this.gridViewSetup.ExpiredDate.headerText}'`
        );
        this.validate++;
        return;
      }
    }
    if(!this.itemBatchs.expiredDate && this.itemBatchs.manufaturedDate)
    {
      var startDate = new Date(this.itemBatchs.manufaturedDate);
      var endDate = new Date(this.itemBatchs.expiredDate);
      var bestDate = new Date(this.itemBatchs.bestBeforeDate);
      if(startDate.getTime() >  bestDate.getTime())
      {
        this.notification.notifyCode(
          'AC0025',
          0,
          `'${this.gridViewSetup.BestBeforeDate.headerText}'`,
          `'${this.gridViewSetup.ManufaturedDate.headerText}'`,
          `'${this.gridViewSetup.ExpiredDate.headerText}'`
        );
        this.validate++;
        return;
      }
    }
  }
}
