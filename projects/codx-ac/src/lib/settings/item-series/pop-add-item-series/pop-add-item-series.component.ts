import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxFormComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { ItemSeries } from '../../../models/ItemSeries.model';
import { CodxAcService } from '../../../codx-ac.service';

@Component({
  selector: 'lib-pop-add-item-series',
  templateUrl: './pop-add-item-series.component.html',
  styleUrls: ['./pop-add-item-series.component.css']
})
export class PopAddItemSeriesComponent extends UIComponent implements OnInit{
  
  //Constructor

  @ViewChild('form') public form: CodxFormComponent;
  headerText: any;
  title: any;
  formModel: FormModel;
  dialog!: DialogRef;
  itemSeries: ItemSeries;
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
    this.itemSeries = dialog.dataService!.dataSelected;
    this.keyField = this.dialog.dataService!.keyField;
    this.formType = dialogData.data?.formType;
    this.cache.gridViewSetup('ItemSeries', 'grvItemSeries').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
  }

  //End Constructor

  //Init
  
  onInit(): void {
  }

  //End Init

  //Event

  valueChange(e)
  {
    switch(e.field)
    {
      case 'itemID':
        this.itemSeries.itemID = e.data;
        break;
      case 'seriNo':
        this.itemSeries.seriNo = e.data;
        break;
      case 'seriName':
        this.itemSeries.seriName = e.data;
        break;
      case 'manufaturedDate':
        this.itemSeries.manufaturedDate = e.data;
        this.validateDate();
        break;
      case 'warrantyDate':
        this.itemSeries.warrantyDate = e.data;
        this.validateSalesWarrantyDate();
        break;
      case 'salesWarranty':
        this.itemSeries.salesWarranty = e.data;
        this.validateDate();
        break;
      case 'note':
        this.itemSeries.note = e.data;
        break;
      case 'stop':
        this.itemSeries.stop = e.data;
        break;
    }
  }

  //End Event

  //Method

  onSave(){
    this.validate = 0;
    this.checkValidate();
    this.validateDate();
    this.validateSalesWarrantyDate();
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

  //End Method

  //Function

  onClearItemSeries()
  {
    this.itemSeries = new ItemSeries();
  }

  checkValidate() {
    //Note: Tự động khi lưu, Không check BatchNo
    let ignoredFields: string[] = [];
    if (this.keyField == 'SeriNo') {
      ignoredFields.push(this.keyField);
    }
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());
    //End Node

    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.itemSeries);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        if (ignoredFields.includes(keygrid[index].toLowerCase())) {
          continue;
        }
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.itemSeries[keymodel[i]] == null ||
              String(this.itemSeries[keymodel[i]]).match(/^ *$/) !== null
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
    if(this.itemSeries.salesWarranty && this.itemSeries.manufaturedDate)
    {
      var startDate = new Date(this.itemSeries.manufaturedDate);
      var endDate = new Date(this.itemSeries.salesWarranty);
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

  validateSalesWarrantyDate()
  {
    if(this.itemSeries.salesWarranty && this.itemSeries.manufaturedDate)
    {
      var startDate = new Date(this.itemSeries.manufaturedDate);
      var endDate = new Date(this.itemSeries.salesWarranty);
      var bestDate = new Date(this.itemSeries.warrantyDate);
      if(startDate.getTime() >  bestDate.getTime() || bestDate.getTime() > endDate.getTime())
      {
        this.notification.notifyCode(
          'AC0025',
          0,
          `'${this.gridViewSetup.WarrantyDate.headerText}'`,
          `'${this.gridViewSetup.ManufaturedDate.headerText}'`,
          `'${this.gridViewSetup.SalesWarranty.headerText}'`
        );
        this.validate++;
        return;
      }
    }
    if(this.itemSeries.salesWarranty && !this.itemSeries.manufaturedDate)
    {
      var startDate = new Date(this.itemSeries.manufaturedDate);
      var endDate = new Date(this.itemSeries.salesWarranty);
      var bestDate = new Date(this.itemSeries.warrantyDate);
      if(bestDate.getTime() > endDate.getTime())
      {
        this.notification.notifyCode(
          'AC0025',
          0,
          `'${this.gridViewSetup.WarrantyDate.headerText}'`,
          `'${this.gridViewSetup.ManufaturedDate.headerText}'`,
          `'${this.gridViewSetup.SalesWarranty.headerText}'`
        );
        this.validate++;
        return;
      }
    }
    if(!this.itemSeries.salesWarranty && this.itemSeries.manufaturedDate)
    {
      var startDate = new Date(this.itemSeries.manufaturedDate);
      var endDate = new Date(this.itemSeries.salesWarranty);
      var bestDate = new Date(this.itemSeries.warrantyDate);
      if(startDate.getTime() >  bestDate.getTime())
      {
        this.notification.notifyCode(
          'AC0025',
          0,
          `'${this.gridViewSetup.WarrantyDate.headerText}'`,
          `'${this.gridViewSetup.ManufaturedDate.headerText}'`,
          `'${this.gridViewSetup.SalesWarranty.headerText}'`
        );
        this.validate++;
        return;
      }
    }
  }

  //End Function
}
