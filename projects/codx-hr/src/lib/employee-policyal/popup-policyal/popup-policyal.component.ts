import { ChangeDetectorRef, Component, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CRUDService, CallFuncService, CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, FormModel, LayoutAddComponent, NotificationsService, UIComponent } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import {
  EditSettingsModel,
} from '@syncfusion/ej2-angular-grids';
@Component({
  selector: 'lib-popup-policyal',
  templateUrl: './popup-policyal.component.html',
  styleUrls: ['./popup-policyal.component.css']
})
export class PopupPolicyalComponent 
  extends UIComponent
  implements OnInit
{
  @ViewChild('gridView1') gridView1: CodxGridviewV2Component;
  @ViewChild('gridView2') gridView2: CodxGridviewV2Component;

  @ViewChild('tmpGrid1Col1', { static: true })
  tmpGrid1Col1: TemplateRef<any>;
  @ViewChild('tmpGrid1Col2', { static: true })
  tmpGrid1Col2: TemplateRef<any>;
  @ViewChild('headTmpGrid1Col1', { static: true }) headTmpGrid1Col1: TemplateRef<any>;
  @ViewChild('headTmpGrid1Col2', { static: true }) headTmpGrid1Col2: TemplateRef<any>;

  expandTransferNextYear = false;
  transferNextYearDisabled = true;

  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };

  ejsgrid
  loadGridview1 = false;
  dataSourceGridView1 : any = [];

  predicate1: any;
  predicate2: any;

  expandIsMonth = false;
  isMonthDisabled = true;
  columnGrid1: any;
  columnGrid2: any;

  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  funcID: string;
  actionType: string;
  idField = 'PolicyID';
  isAfterRender = false;
  autoNumField: string;
  headerText: string;
  alpolicyObj: any;
  grvSetup // chua viet code lay grvsetup

  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'overallInfo',
    },
    {
      icon: 'icon-info',
      text: 'Mô tả chính sách',
      name: 'policyInfo',
    },
    {
      icon: 'icon-settings',
      text: 'Thiết lập',
      name: 'setting',
    },
    {
      icon: 'icon-how_to_reg',
      text: 'Đối tượng áp dụng',
      name: 'applyObj',
    },
    {
      icon: 'icon-person_remove',
      text: 'Đối tượng loại trừ',
      name: 'subtractObj',
    },
  ];

  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('layout', { static: true }) layout: LayoutAddComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  
  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private df: ChangeDetectorRef,
    private hrSevice: CodxHrService,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ){
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.actionType = data?.data?.actionType;
    this.alpolicyObj = JSON.parse(JSON.stringify(data?.data?.dataObj));
  }

  openFormUploadFile() {
    this.attachment.uploadFile();
  }

  addFiles(evt){
    this.alpolicyObj.attachments = evt.data.length;
  }

  fileAdded(evt){

  }

  onInit(): void {
    if(!this.columnGrid1){
      this.columnGrid1 = [
        {
          headerTemplate: this.headTmpGrid1Col1,
          template: this.tmpGrid1Col1,
          width: '150',
        },
        {
          headerTemplate: this.headTmpGrid1Col2,
          template: this.tmpGrid1Col2,
          width: '150',
        }
      ]
    }

    if (!this.formModel)
      this.hrSevice.getFormModel(this.funcID).then((formModel) => {
        if (formModel) {
          this.formModel = formModel;
          this.hrSevice
            .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
            .then((fg) => {
              if (fg) {
                this.formGroup = fg;
                this.initForm();
              }
            });
        }
      });
    else
      this.hrSevice
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.initForm();
          }
        });
  }

  clickMF(event, data){

  }

  initForm() {
    this.cache
    .gridViewSetup(
      this.formModel.formName,
      this.formModel.gridViewName
    )
    .subscribe((res) => {
      this.grvSetup = res;
      console.log('grv setup ne', this.grvSetup);
    });
    if (this.actionType == 'add') {
      this.hrSevice
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            console.log('res ssss', res);
            res.data.status = '1'
            if (res.activeOn == '0001-01-01T00:00:00') {
              res.activeOn = null;
            }
            this.alpolicyObj = res?.data;

            this.formModel.currentData = this.alpolicyObj;
            this.formGroup.patchValue(this.alpolicyObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        console.log('data nhan vao', this.alpolicyObj);
        
        if(this.alpolicyObj.isTransferNextYear == true){
          this.transferNextYearDisabled = false;
        }

        if(this.alpolicyObj.isMonth == true){
          this.isMonthDisabled = false;
        }
        if (this.actionType == 'copy') {
          if (this.alpolicyObj.activeOn == '0001-01-01T00:00:00') {
            this.alpolicyObj.activeOn = null;
          }
        }
        this.formGroup.patchValue(this.alpolicyObj);
        this.formModel.currentData = this.alpolicyObj;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
  }

  ValChangeTransferNextYear(event){
    debugger
    if(event.data == true){
      this.expandTransferNextYear = true;
      this.transferNextYearDisabled = false;
    }
    else{
      this.expandTransferNextYear = false;
      this.transferNextYearDisabled = true;
    }
    this.df.detectChanges();
  }

  onClickExpandTransferNextYear(){
    this.expandTransferNextYear = !this.expandTransferNextYear;
  }


  ValueChangeIsMonth(event){
    if(event.data == true){
      this.expandIsMonth = true;
      this.isMonthDisabled = false;
    }
    else{
      this.expandIsMonth = false;
      this.isMonthDisabled = true;
    }
    this.df.detectChanges();
  }

  validateMonthDate(month, day){
    debugger
    if(month == 4 || month == 6 || month == 9 || month == 11){
      if(day > 30){
        this.notify.notifyCode('HR016');
      }
    }
    else if(month == 2){
      if(day > 28){
        this.notify.notifyCode('HR016');
      }
    }
    else{
      if(day > 31){
        this.notify.notifyCode('HR016');
      }
    }
  }

  onChangeSelectTransferDay(evt){
    let day = parseInt(evt.data)
    let month = parseInt(this.alpolicyObj.transferToDay)
    if(month){
      this.validateMonthDate(month, day);
    }
  }

  onChangeSelectTransferMonth(evt){
    let month = parseInt(evt.data)
    let day = parseInt(this.alpolicyObj.transferToMonth)
    if(day){
      this.validateMonthDate(month, day);
    }
  }

  onChangeSelectCloseToDay(evt){
    let day = parseInt(evt.data)
    let month = parseInt(this.alpolicyObj.closeToMonth)
    if(month){
      this.validateMonthDate(month, day);
    }
  }

  onChangeSelectCloseToMonth(evt){
    let month = parseInt(evt.data)
    let day = parseInt(this.alpolicyObj.closeToDay)
    if(day){
      this.validateMonthDate(month, day);
    }
  }

  onChangeFirstMonthType(evt){
    if(parseInt(evt.data) > 1){
      this.GetPolicyDetailByFirstMonthType(evt.data).subscribe((res) => {
        this.dataSourceGridView1 = res;
      });
      this.loadGridview1 = true;
      // this.predicate1 = `PolicyType == 'AL' and PolicyID == "${this.alpolicyObj.policyID}" && ItemType == 'ALFirstMonthType' && ItemSelect == "${evt.data}"`;
      // (this.gridView1.dataService as CRUDService).setPredicates([this.predicate1],[]);
    }
    else{
      this.loadGridview1 = false;
    }
    this.df.detectChanges();
  }

  GetPolicyDetailByFirstMonthType(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'GetPolicyDetailByFirstMonthTypeAsync',
      ['AL', this.alpolicyObj.policyType, 'ALFirstMonthType', data]
    );
  }

  onClickExpandIsMonth(){
    this.expandIsMonth = !this.expandIsMonth;
  }

  onSaveForm(){

  }

  onAddNewGrid1($evt){

  }

  onEditGrid1(evt){

  }

  onDeleteGrid1(evt){

  }
}

