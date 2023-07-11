import { ChangeDetectorRef, Component, HostListener, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CRUDService, CallFuncService, CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, FormModel, LayoutAddComponent, NotificationsService, UIComponent, Util } from 'codx-core';
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

  @HostListener('click', ['$event.target']) onClick(e) {
    if(this.gridView2){
      if(this.gridView2.gridRef.isEdit == true){
        //this.gridView2.isEdit = false;
        //this.gridView2.isAdd = false;
        this.gridView2.endEdit();
      }else{
       //
      }
    }

    if(this.gridView1){
      if(this.gridView1.gridRef.isEdit == true){
        //this.gridView2.isEdit = false;
        //this.gridView2.isAdd = false;
        this.gridView1.endEdit();
      }else{
       //
      }
    }
  }

  @ViewChild('gridView1') gridView1: CodxGridviewV2Component;
  @ViewChild('gridView2') gridView2: CodxGridviewV2Component;

  @ViewChild('tmpGrid1Col1', { static: true })
  tmpGrid1Col1: TemplateRef<any>;
  @ViewChild('tmpGrid1Col2', { static: true })
  tmpGrid1Col2: TemplateRef<any>;
  @ViewChild('headTmpGrid1Col1', { static: true }) headTmpGrid1Col1: TemplateRef<any>;
  @ViewChild('headTmpGrid1Col2', { static: true }) headTmpGrid1Col2: TemplateRef<any>;

  @ViewChild('tmpGrid2Col1', { static: true })
  tmpGrid2Col1: TemplateRef<any>;
  @ViewChild('tmpGrid2Col2', { static: true })
  tmpGrid2Col2: TemplateRef<any>;
  @ViewChild('headTmpGrid2Col1', { static: true }) headTmpGrid2Col1: TemplateRef<any>;
  @ViewChild('headTmpGrid2Col2', { static: true }) headTmpGrid2Col2: TemplateRef<any>;

  expandTransferNextYear = false;
  transferNextYearDisabled = true;

  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };

  fieldHeaderTexts;
  loadGridview1 = false;
  loadGridview2 = false;

  dataSourceGridView1 : any = [];
  dataSourceGridView2 : any = [];

  lstPolicyDetailRecID: any = []

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
  grvSetup
  grvSetupPolicyDetail


  fmPolicyDetail: FormModel = {
    formName: 'PolicyDetails',
    gridViewName: 'grvPolicyDetails',
    entityName: 'HR_PolicyDetails',
  };

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
    console.log('data nhan vao', this,this.alpolicyObj);
    
  }

  openFormUploadFile() {
    this.attachment.uploadFile();
  }

  async addFiles(evt){
    this.alpolicyObj.attachments = evt.data.length;

  }

  fileAdded(evt){

  }

  onInit(): void {
    if(!this.columnGrid1){
      this.columnGrid1 = [
        {
          field: 'fromValue',
          allowEdit : true,
          controlType: 'text',
          dataType : 'int',
          headerTemplate: this.headTmpGrid1Col1,
          template: this.tmpGrid1Col1,
          width: '150',
        },
        {
          field: 'days',
          allowEdit : true,
          controlType: 'text',
          dataType : 'string',
          headerTemplate: this.headTmpGrid1Col2,
          template: this.tmpGrid1Col2,
          width: '150',
        }
      ]
    }
    if(!this.columnGrid2){
      this.columnGrid2 = [
        {
          field: 'fromValue',
          allowEdit : true,
          controlType: 'text',
          dataType : 'int',
          headerTemplate: this.headTmpGrid2Col1,
          template: this.tmpGrid2Col1,
          width: '150',
        },
        {
          field: 'days',
          allowEdit : true,
          controlType: 'text',
          dataType : 'string',
          headerTemplate: this.headTmpGrid2Col2,
          template: this.tmpGrid2Col2,
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

  clickMF(event, data, gridNum){
    this.notify.alertCode('SYS030').subscribe((x) => {
      if (x.event?.status == 'Y') {
        this.DeletePolicyDetail(data.recID).subscribe((res) => {
          if(res == true){
            this.notify.notifyCode('SYS008');
            if(gridNum == 1){
              (this.gridView1?.dataService as CRUDService)?.remove(data).subscribe();
              this.gridView1.deleteRow(data, true);
            }
            else{
              (this.gridView2?.dataService as CRUDService)?.remove(data).subscribe();
              this.gridView2.deleteRow(data, true);
            }
          }
        })
    }
      }
    )}

  initForm() {
    this.hrSevice.getHeaderText(this.formModel.funcID).then((res) => {
      this.fieldHeaderTexts = res;
    })
    this.cache
    .gridViewSetup(
      this.formModel.formName,
      this.formModel.gridViewName
    )
    .subscribe((res) => {
      this.grvSetup = res;
      console.log('grv setup ne', this.grvSetup);
    });

    this.cache
    .gridViewSetup(
      'PolicyDetails',
      'grvPolicyDetails'
    )
    .subscribe((res) => {
      this.grvSetupPolicyDetail = res;
      console.log('grv policydetail', this.grvSetupPolicyDetail);

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
            debugger
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
        debugger

        this.formGroup.patchValue(this.alpolicyObj);
        this.formModel.currentData = this.alpolicyObj;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
    this.GetPolicyDetailBySeniorityType().subscribe((res) => {
      this.dataSourceGridView2 = res;
      this.loadGridview2 = true;
    });
  }

  ValChangeTransferNextYear(event){
    
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

  changeDataMF(evt){
    for(let i = 0; i < evt.length; i++){
      let funcIDStr = evt[i].functionID;
      if(funcIDStr == 'SYS04' || funcIDStr == 'SYS03'){
        evt[i].disabled = true;
      }
      else if(funcIDStr == 'SYS02'){
        evt[i].disabled = false;
      }
    }
  }

  GetPolicyDetailByFirstMonthType(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'GetPolicyDetailByFirstMonthTypeAsync',
      ['AL', this.alpolicyObj.policyID, 'ALFirstMonthType', data]
    );
  }

  GetPolicyDetailBySeniorityType(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'GetPolicyDetailBySeniorityTypeAsync',
      ['AL', this.alpolicyObj.policyID, 'ALSeniorityType', '1']
    );
  }

  AddPolicyDetail(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'AddPolicyDetailAsync',
      data
    );
  }

  UpdatePolicyDetail(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'UpdatePolicyDetailAsync',
      data
    );
  }

  DeletePolicyDetail(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'DeletePolicyDetailAsync',
      data
    );
  }

  DeleteListPolicyDetail(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'DeleteListPolicyDetailAsync',
      this.lstPolicyDetailRecID
    );
  }

  onInputPolicyID(evt){

  }

  onClickExpandIsMonth(){
    this.expandIsMonth = !this.expandIsMonth;
  }

  async onSaveForm(){
    if(
      this.attachment.fileUploadList &&
      this.attachment.fileUploadList.length > 0
      ) {
      this.attachment.objectId=this.alpolicyObj?.recID;
      (await (this.attachment.saveFilesObservable())).subscribe(
      (item2:any)=>{
            debugger
          });
      }
}

  addRowGrid1(){
    let idx = this.gridView1.dataSource.length;
    // if(idx > 1){
    //   let data = JSON.parse(JSON.stringify(this.gridView1.dataSource[0]));
    //   data.recID = Util.uid();
    //   data.days = 0;
    //   data.fromValue = 0;
    //   this.gridView1.addRow(data, idx);
    // }
    let data = {
      recID: Util.uid()
    };
    this.gridView1.addRow(data, idx, false, true);
  }

  addRowGrid2(){
    let idx = this.gridView2.dataSource.length;
    // if(idx > 1){
    //   let data = JSON.parse(JSON.stringify(this.gridView1.dataSource[0]));
    //   data.recID = Util.uid();
    //   data.days = 0;
    //   data.fromValue = 0;
    //   this.gridView1.addRow(data, idx);
    // }
    let data = {
      recID: Util.uid()
    };
    this.gridView2.addRow(data, idx, false, true);
  }

  onAddNewGrid1(evt){
    if(!this.alpolicyObj.policyID){
      this.notify.notifyCode('SYS009',0,this.fieldHeaderTexts['PolicyID'])
      return
    }
    if(!this.alpolicyObj.policyType){
      this.notify.notifyCode('SYS009',0,this.fieldHeaderTexts['PolicyType'])
      return
    }
    if(!evt.fromValue){
      this.notify.notifyCode('HR023');
      let legth = this.gridView1.dataSource.length
      let index = legth - 1
      setTimeout(() => {
        this.gridView1.deleteRow(this.gridView1.dataSource[index], true);
        this.gridView1.dataSource.splice(index, 1);
        (this.gridView1.gridRef.dataSource as any).splice(index, 1);
        this.gridView1.refresh();
      }, 200);
      return;
    }
    if(!evt.days){
      this.notify.notifyCode('HR024');
      let legth = this.gridView1.dataSource.length
      let index = legth - 1
      setTimeout(() => {
        this.gridView1.deleteRow(this.gridView1.dataSource[index], true);
        // this.gridView1.dataSource.splice(index, 1);
        (this.gridView1.gridRef.dataSource as any).splice(index, 1);
        this.gridView1.refresh();
      }, 200);
      return;
    }
    evt.policyID = this.alpolicyObj.policyID;
    evt.policyType = this.alpolicyObj.policyType;
    evt.itemType = 'ALFirstMonthType'
    evt.itemSelect = this.alpolicyObj.firstMonthType
    this.AddPolicyDetail(evt).subscribe((res) => {
      if(res){
        this.lstPolicyDetailRecID.push(res.recID)
          this.notify.notifyCode('SYS006');
      }
      else{
        (this.gridView1?.dataService as CRUDService)?.remove(evt).subscribe();
        this.gridView1.deleteRow(evt, true);
        this.gridView1.refresh();
      }
    })
  }

  onEditGrid1(evt){
    let index = this.gridView1.dataSource.findIndex(v => v.recID == evt.recID)
    this.UpdatePolicyDetail(evt).subscribe((res) => {
      if(res && res.oldData){
        this.gridView1.gridRef.dataSource[index] = res.oldData;
        this.gridView1.refresh();
      }
      else{
        this.notify.notifyCode('SYS007');
      }
    })
  }

  onDeleteGrid1(evt){

  }

  onAddNewGrid2(evt){
    if(!this.alpolicyObj.policyID){
      this.notify.notifyCode('SYS009',0,this.fieldHeaderTexts['PolicyID'])
      return
    }
    if(!this.alpolicyObj.policyType){
      this.notify.notifyCode('SYS009',0,this.fieldHeaderTexts['PolicyType'])
      return
    }
    if(!evt.fromValue){
      this.notify.notifyCode('HR025');
      let legth = this.gridView2.dataSource.length
      let index =legth - 1;

      // (this.gridView2?.dataService as CRUDService)?.remove(this.gridView2.dataSource[index]).subscribe();
      // this.gridView2.deleteRow(this.gridView2.dataSource[index], true);

      setTimeout(() => {
        this.gridView2.deleteRow(this.gridView2.dataSource[index], true);
        this.gridView2.dataSource.splice(index, 1);
        (this.gridView2.gridRef.dataSource as any).splice(index, 1);
        this.gridView2.refresh();
      }, 200);
      // this.gridView2.refresh();
      return;
    }
    if(!evt.days){
      
      this.notify.notifyCode('HR026');
      let legth = this.gridView2.dataSource.length
      let index =legth - 1;

      // (this.gridView2?.dataService as CRUDService)?.remove(this.gridView2.dataSource[index]).subscribe();
      // this.gridView2.deleteRow(this.gridView2.dataSource[index], true);

      setTimeout(() => {
        this.gridView2.deleteRow(this.gridView2.dataSource[index], true);
        this.gridView2.dataSource.splice(index, 1);
        (this.gridView2.gridRef.dataSource as any).splice(index, 1);
        this.gridView2.refresh();
      }, 200);
      // this.gridView2.refresh();
      return;
    }
    evt.policyID = this.alpolicyObj.policyID;
    evt.policyType = this.alpolicyObj.policyType;
    evt.itemType = 'ALSeniorityType'
    evt.itemSelect = '1'
    
    this.AddPolicyDetail(evt).subscribe((res) => {
      if(res){
        this.lstPolicyDetailRecID.push(res.recID)
          this.notify.notifyCode('SYS006');
      }
      else{
        (this.gridView2?.dataService as CRUDService)?.remove(evt).subscribe();
        this.gridView2.deleteRow(evt, true);
        this.gridView2.refresh();
      }
    })
  }

  onEditGrid2(evt){
    
    let index = this.gridView2.dataSource.findIndex(v => v.recID == evt.recID)
    this.UpdatePolicyDetail(evt).subscribe((res) => {
      if(res && res.oldData){
        this.gridView2.gridRef.dataSource[index] = res.oldData;
        this.gridView2.refresh();
      }
      else{
        this.notify.notifyCode('SYS007');
      }
    })
  }

  onDeleteGrid2(evt){

  }
}

