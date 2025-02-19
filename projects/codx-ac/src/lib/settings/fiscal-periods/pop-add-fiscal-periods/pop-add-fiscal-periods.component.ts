import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxFormComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { FiscalPeriods } from '../../../models/FiscalPeriods.model';
import { CodxAcService } from '../../../codx-ac.service';

@Component({
  selector: 'lib-pop-add-fiscal-periods',
  templateUrl: './pop-add-fiscal-periods.component.html',
  styleUrls: ['./pop-add-fiscal-periods.component.css']
})
export class PopAddFiscalPeriodsComponent extends UIComponent implements OnInit{
  
  //Constructor

  @ViewChild('form') public form: CodxFormComponent;
  headerText: any;
  title: any;
  formModel: FormModel;
  dialog!: DialogRef;
  fiscalperiods: FiscalPeriods;
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
    this.fiscalperiods = dialog.dataService!.dataSelected;
    this.formType = dialogData.data?.formType;
    this.keyField = dialog.dataService!.keyField;
    this.cache.gridViewSetup('FiscalPeriods', 'grvFiscalPeriods').subscribe((res) => {
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

  valueChange(e: any)
  {
    switch(e.field)
    {
      case 'periodID':
        this.fiscalperiods.periodID = e.data;
        break;
      case 'periodName':
        this.fiscalperiods.periodName = e.data;
        break;
      case 'fiscalYear':
        this.fiscalperiods.fiscalYear = e.data;
        break;
      case 'startDate':
          this.fiscalperiods.startDate = e.data;
          this.checkValidateStartYear();
          this.checkValidateDate();
          break;
      case 'endDate':
        this.fiscalperiods.endDate = e.data;
        this.checkValidateEndYear();
        this.checkValidateDate();
        break;
    }
  }

  //End Event

  //Function

  checkValidateEndYear()
  {
    var endDate = new Date(this.fiscalperiods.endDate);
    var endYear = endDate.getFullYear();
    if(endYear != this.fiscalperiods.fiscalYear)
    {
      if(endYear)
      {
        this.notification.notifyCode(
          'AC0023',
          0,
          '"' + this.gridViewSetup.EndDate.headerText + '"'
        );
      }
      this.validate++;
    }
  }

  checkValidateStartYear()
  {
    var startDate = new Date(this.fiscalperiods.startDate);
    var startYear = startDate.getFullYear();
    if(startYear != this.fiscalperiods.fiscalYear)
    {
      if(startYear)
      {
        this.notification.notifyCode(
          'AC0023',
          0,
          '"' + this.gridViewSetup.StartDate.headerText + '"'
        );
      }
      this.validate++;
    }
  }

  checkValidateDate()
  {
    var startDate = new Date(this.fiscalperiods.startDate);
    var endDate = new Date(this.fiscalperiods.endDate);
    if(this.fiscalperiods.endDate && this.fiscalperiods.startDate)
    {
      var endDate = new Date(this.fiscalperiods.endDate);
      if(startDate.getTime() > endDate.getTime())
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

  checkValidate() {

    //Note: Tự động khi lưu, Không check BatchNo
    let ignoredFields: string[] = [];
    if (this.keyField == 'PeriodID') {
      ignoredFields.push(this.keyField);
    }
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());
    //End Node

    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.fiscalperiods);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        if (ignoredFields.includes(keygrid[index].toLowerCase())) {
          continue;
        }
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.fiscalperiods[keymodel[i]] == null ||
              String(this.fiscalperiods[keymodel[i]]).match(/^ *$/) !== null
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

  onClearFiscalPeriods()
  {
    this.fiscalperiods = new FiscalPeriods();
  }

  //End Function

  //Method

  onSave(){
    this.validate = 0;
    this.checkValidate();
    this.checkValidateStartYear();
    this.checkValidateEndYear();
    this.checkValidateDate();
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
}
