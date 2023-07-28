import { ChangeDetectorRef, Component, HostListener, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CRUDService, CallFuncService, CodxFormComponent, CodxGridviewV2Component, DialogData, DialogModel, DialogRef, FormModel, LayoutAddComponent, NotificationsService, UIComponent, Util } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import {
  EditSettingsModel, detailIndentCellInfo,
} from '@syncfusion/ej2-angular-grids';
import { PopupMultiselectvllComponent } from '../popup-multiselectvll/popup-multiselectvll.component';
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

  lstOrgUnitID: any = []
  lstJobLevel: any = []
  lstPositionID: any = []
  lstEmployeeTypeID: any = []
  lstContractTypeID: any = []
  lstEmployeeID: any = []
  
  lstPolicyBeneficiariesApply: any = []
  lstPolicyBeneficiariesExclude: any = []

  lstEmpStatus: any = []
  lstLabourType: any = []
  // policyBeneficiariesDetail = {
  //   recId: '',
  //   fieldName: '',
  //   cbxVllName: '',
  //   fieldData:'',
  //   fieldDataArr: []
  // }

  // policyBeneficiariesDetail = {
  //   priority: this.lstPolicyBeneficiariesApply.length + 1 ,
  //   recId: '',
  //   fieldName: '',
  //   cbxVllName: '',
  //   fieldData:'',
  //   fieldDataArr: []
  // }
  objArr : any = []

  fieldHeaderTexts;
  loadGridview1 = false;
  loadGridview2 = false;

  lstSelectedObj: any = [];
  lstSelectedExcludeObj: any = [];


  dataSourceGridView1 : any = [];
  dataSourceGridView2 : any = [];

  lstPolicyDetailRecID: any = []

  predicate1: any;
  predicate2: any;

  expandIsMonth = false;
  isMonthDisabled = true;
  columnGrid1: any;
  columnGrid2: any;

  currentTab = '';
  currentRec: any;
  currentCbxName: any;
  currentCbxValue: any = [];

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

  cbxName:any;
  isHidden=true;

  fmPolicyBeneficiaries: FormModel = {
    formName: 'PolicyBeneficiaries',
    gridViewName: 'grvPolicyBeneficiaries',
    entityName: 'HR_PolicyBeneficiaries',
  };

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
  }

  openFormUploadFile() {
    this.attachment.uploadFile();
  }

  async addFiles(evt){
    this.alpolicyObj.attachments = evt.data.length;
  }

  fileAdded(evt){

  }

  GetApplyObjs(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'GetApplyObjsAsync',
      ['AL', this.alpolicyObj.policyID, 0]
    );
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
        this.GetApplyObjs().subscribe((res) => {
          this.lstPolicyBeneficiariesApply = res;
        })
        this.GetPolicyDetailBySeniorityType().subscribe((res) => {
          this.dataSourceGridView2 = res;
        });
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

    this.loadGridview2 = true;
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
      this.attachment.objectId=this.alpolicyObj?.policyID;
      (await (this.attachment.saveFilesObservable())).subscribe(
      (item2:any)=>{
            debugger
          });
      }

      if(this.alpolicyObj.hasIncludeObjects == false){
        this.alpolicyObj.includeObjects = ''
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

  ValChangeHasInclueObj(event){
    let flag = event.data;

    if(flag == false){
      this.alpolicyObj.hasIncludeObjects = false;
    }
  }

  ValChangeHasExcludeObj(event){
    let flag = event.data;

    if(flag == false){
      this.alpolicyObj.hasExcludeObjects = false;
    }
  }

  // onClickHideComboboxPopup(e): void {
  //   if(e == null){
  //   this.detectorRef.detectChanges();
  //     return;
  //   }
  //   if(e.id){
  //       this.alpolicyObj.hasIncludeObjects = e.id;
  //   }
  //   else{
  //     this.alpolicyObj.hasIncludeObjects = null;
  //   }

  //   if(this.alpolicyObj.hasIncludeObjects){
  //     this.lstPolicyBeneficiariesApply = this.alpolicyObj.hasIncludeObjects.split(';')  
  //   }
  //   else{
  //     this.lstPolicyBeneficiariesApply = [];
  //   }
  //   this.detectorRef.detectChanges();
  // }

  onClickOpenSelectIncludeObj(){
    if(this.alpolicyObj.hasIncludeObjects){
      let opt = new DialogModel();
      let popup = this.callfunc.openForm(
        PopupMultiselectvllComponent,
        null,
        400,
        450,
        null,
        {
          headerText: 'Chọn đối tượng áp dụng',
          vllName : 'HRObject',
          formModel: this.formModel,
          dataSelected: this.alpolicyObj.includeObjects
        },
        null,
        opt
      );
      popup.closed.subscribe((res) => {
        this.alpolicyObj.includeObjects = res.event
        this.lstSelectedObj = res.event.split(';')
        this.df.detectChanges();
      });
    }
  }

  onClickOpenSelectExcludeObj(){
    if(this.alpolicyObj.hasExcludeObjects){
      let opt = new DialogModel();
      let popup = this.callfunc.openForm(
        PopupMultiselectvllComponent,
        null,
        400,
        450,
        null,
        {
          headerText: 'Chọn đối tượng áp dụng',
          vllName : 'HRObject',
          formModel: this.formModel,
          dataSelected: this.alpolicyObj.excludeObjects
        },
        null,
        opt
      );
      popup.closed.subscribe((res) => {
        this.alpolicyObj.excludeObjects = res.event
        this.lstSelectedExcludeObj = res.event.split(';')
        this.df.detectChanges();
      });
    }
  }

  addApplyObj(){
    let newObj = {}
    newObj['rec'] = Util.uid();
    newObj['policyID'] = this.alpolicyObj.policyID;
    newObj['priority'] = this.lstPolicyBeneficiariesApply.length + 1;
    newObj['policyType'] = 'AL';
    newObj['category'] = '0';

    for (let i = 0; i < this.lstSelectedObj.length; i++) {
      let fieldName: any;
      switch(this.lstSelectedObj[i]){
        case '1':
          fieldName = 'orgUnitID'
          break;
        case '2':
          fieldName = 'jobLevel'
          break;
        case '3':
          fieldName = 'positionID'
          break;
        case '4':
          fieldName = 'employeeTypeID'
          break;
        case '5':
          fieldName = 'labourType'
          break;
        case '6':
          fieldName = 'contractTypeID'
          break;
        case '7':
          fieldName = 'employeeID'
          break;
        case '8':
          fieldName = 'employeeStatus'
          break;
      }
      newObj[fieldName] = '';
    }
    this.lstPolicyBeneficiariesApply.push(newObj)
    debugger
    this.df.detectChanges()
  }

  addExcludeObj(){
    let newObj = {}
    newObj['rec'] = Util.uid();
    newObj['policyID'] = this.alpolicyObj.policyID;
    newObj['priority'] = this.lstPolicyBeneficiariesExclude.length + 1;
    newObj['policyType'] = 'AL';
    newObj['category'] = '1';

    for (let i = 0; i < this.lstSelectedExcludeObj.length; i++) {
      let fieldName: any;
      switch(this.lstSelectedExcludeObj[i]){
        case '1':
          fieldName = 'orgUnitID'
          break;
        case '2':
          fieldName = 'jobLevel'
          break;
        case '3':
          fieldName = 'positionID'
          break;
        case '4':
          fieldName = 'employeeTypeID'
          break;
        case '5':
          fieldName = 'labourType'
          break;
        case '6':
          fieldName = 'contractTypeID'
          break;
        case '7':
          fieldName = 'employeeID'
          break;
        case '8':
          fieldName = 'employeeStatus'
          break;
      }
      newObj[fieldName] = '';
    }
    this.lstPolicyBeneficiariesExclude.push(newObj)
    debugger
    this.df.detectChanges()
  }

  onClickOpenSelectApplyObjDetail(detail, obj){
    debugger
    this.currentRec = obj.rec;
    if(this.alpolicyObj.hasIncludeObjects){
      if(detail == '5' || detail == '8'){
        let vll = detail == '5' ? 'HR022':'HR003'
          let opt = new DialogModel();
          let popup = this.callfunc.openForm(
            PopupMultiselectvllComponent,
            null,
            400,
            450,
            null,
            {
              headerText: 'Chọn đối tượng',
              vllName : vll,
              formModel: this.formModel,
              dataSelected: null
            },
            null,
            opt
          );
          popup.closed.subscribe((res) => {
            // this.policyBeneficiariesDetail.fieldName = detail == '5' ? 'LabourType':'EmployeeStatus';
            // this.policyBeneficiariesDetail.fieldData = res.event;
            let index = this.lstPolicyBeneficiariesApply.findIndex((x: any) => this.currentRec == x['rec'])
            let lstId = res.event.split(';');
            if(vll  == 'HR022'){
              this.lstPolicyBeneficiariesApply[index].labourType = res.event;
              this.lstLabourType = this.lstLabourType.filter((obj) => obj.rec != this.currentRec);
              for(let i = 0; i < lstId.length; i++){
                this.lstLabourType.push({
                  rec:this.lstPolicyBeneficiariesApply[index].rec,
                  id:lstId[i]
                });
              }
            }
            else if(vll = 'HR003'){
              this.lstPolicyBeneficiariesApply[index].employeeStatus = res.event;
              this.lstEmpStatus = this.lstEmpStatus.filter((obj) => obj.rec != this.currentRec);
              for(let i = 0; i < lstId.length; i++){
                this.lstEmpStatus.push({
                  rec:this.lstPolicyBeneficiariesApply[index].rec,
                  id:lstId[i]
                });
              }
            }
            // this.lstPolicyBeneficiariesApply[index].
            // this.lstPolicyBeneficiariesApply.push(this.policyBeneficiariesDetail);
            debugger
            this.df.detectChanges();
          });
      }
      else{
        switch(detail){
          case '1':
            debugger
            this.currentCbxName = 'HRDepts';
            this.currentCbxValue = obj.orgUnitID;
            // this.policyBeneficiariesDetail.cbxVllName = 'HRDepts';
            // this.policyBeneficiariesDetail.fieldName = 'OrgUnitID';
            break; 
          case '2':
            this.currentCbxName = 'JobLevels';
            this.currentCbxValue = obj.jobLevel;
            // this.policyBeneficiariesDetail.cbxVllName = 'JobLevels';
            // this.policyBeneficiariesDetail.fieldName = 'JobLevel';
            break; 
          case '3':
            this.currentCbxName = 'PositionsName';
            this.currentCbxValue = obj.positionID;

            // this.policyBeneficiariesDetail.cbxVllName = 'PositionsName';
            // this.policyBeneficiariesDetail.fieldName = 'PositionID';
            break; 
          case '4':
            this.currentCbxName = 'EmployeeTypes';
            this.currentCbxValue = obj.employeeTypeID;

            // this.policyBeneficiariesDetail.cbxVllName = 'EmployeeTypes';
            // this.policyBeneficiariesDetail.fieldName = 'EmployeeTypeID';
            break; 
          case '6':
            this.currentCbxName = 'ContractTypes';
            this.currentCbxValue = obj.contractTypeID;

            // this.policyBeneficiariesDetail.cbxVllName = 'ContractTypes';
            // this.policyBeneficiariesDetail.fieldName = 'ContractTypeID';
            break; 
          case '7':
            this.currentCbxName = 'Employees';
            this.currentCbxValue = obj.employeeID;

            // this.policyBeneficiariesDetail.cbxVllName = 'Employees';
            // this.policyBeneficiariesDetail.fieldName = 'EmployeeID';
            break; 
        }
        this.isHidden = false;
        this.df.detectChanges();
      }
    }
  }

  onClickOpenSelectExcludeObjDetail(detail, obj){
    debugger
    this.currentRec = obj.rec;
    if(this.alpolicyObj.hasExcludeObjects){
      if(detail == '5' || detail == '8'){
        let vll = detail == '5' ? 'HR022':'HR003'
          let opt = new DialogModel();
          let popup = this.callfunc.openForm(
            PopupMultiselectvllComponent,
            null,
            400,
            450,
            null,
            {
              headerText: 'Chọn đối tượng',
              vllName : vll,
              formModel: this.formModel,
              dataSelected: null
            },
            null,
            opt
          );
          popup.closed.subscribe((res) => {
            // this.policyBeneficiariesDetail.fieldName = detail == '5' ? 'LabourType':'EmployeeStatus';
            // this.policyBeneficiariesDetail.fieldData = res.event;
            let index = this.lstPolicyBeneficiariesExclude.findIndex((x: any) => this.currentRec == x['rec'])
            let lstId = res.event.split(';');
            if(vll  == 'HR022'){
              this.lstPolicyBeneficiariesExclude[index].labourType = res.event;
              this.lstLabourType = this.lstLabourType.filter((obj) => obj.rec != this.currentRec);
              for(let i = 0; i < lstId.length; i++){
                this.lstLabourType.push({
                  rec:this.lstPolicyBeneficiariesExclude[index].rec,
                  id:lstId[i]
                });
              }
            }
            else if(vll = 'HR003'){
              this.lstPolicyBeneficiariesExclude[index].employeeStatus = res.event;
              this.lstEmpStatus = this.lstEmpStatus.filter((obj) => obj.rec != this.currentRec);
              for(let i = 0; i < lstId.length; i++){
                this.lstEmpStatus.push({
                  rec:this.lstPolicyBeneficiariesExclude[index].rec,
                  id:lstId[i]
                });
              }
            }
            debugger
            this.df.detectChanges();
          });
      }
      else{
        switch(detail){
          case '1':
            debugger
            this.currentCbxName = 'HRDepts';
            this.currentCbxValue = obj.orgUnitID;
            // this.policyBeneficiariesDetail.cbxVllName = 'HRDepts';
            // this.policyBeneficiariesDetail.fieldName = 'OrgUnitID';
            break; 
          case '2':
            this.currentCbxName = 'JobLevels';
            this.currentCbxValue = obj.jobLevel;
            // this.policyBeneficiariesDetail.cbxVllName = 'JobLevels';
            // this.policyBeneficiariesDetail.fieldName = 'JobLevel';
            break; 
          case '3':
            this.currentCbxName = 'PositionsName';
            this.currentCbxValue = obj.positionID;

            // this.policyBeneficiariesDetail.cbxVllName = 'PositionsName';
            // this.policyBeneficiariesDetail.fieldName = 'PositionID';
            break; 
          case '4':
            this.currentCbxName = 'EmployeeTypes';
            this.currentCbxValue = obj.employeeTypeID;

            // this.policyBeneficiariesDetail.cbxVllName = 'EmployeeTypes';
            // this.policyBeneficiariesDetail.fieldName = 'EmployeeTypeID';
            break; 
          case '6':
            this.currentCbxName = 'ContractTypes';
            this.currentCbxValue = obj.contractTypeID;

            // this.policyBeneficiariesDetail.cbxVllName = 'ContractTypes';
            // this.policyBeneficiariesDetail.fieldName = 'ContractTypeID';
            break; 
          case '7':
            this.currentCbxName = 'Employees';
            this.currentCbxValue = obj.employeeID;

            // this.policyBeneficiariesDetail.cbxVllName = 'Employees';
            // this.policyBeneficiariesDetail.fieldName = 'EmployeeID';
            break; 
        }
        this.isHidden = false;
        this.df.detectChanges();
      }
    }
  }

  changeTab(event){
    this.currentTab = event.nextId;
  }

  onClickHideComboboxPopup(event){
    debugger
    this.isHidden = true;
    if(event == null){
      this.detectorRef.detectChanges();
      return;
    }
    else if(event.id){
      let index = 0;
      if(this.currentTab == 'applyObj'){
        index = this.lstPolicyBeneficiariesApply.findIndex((x: any) => this.currentRec == x['rec'])
      }
      else if(this.currentTab == 'subtractObj'){
        index = this.lstPolicyBeneficiariesExclude.findIndex((x: any) => this.currentRec == x['rec'])
      }
      let lstId = event.id.split(';');
      switch(this.currentCbxName){
        case 'HRDepts':
          if(this.currentTab == 'applyObj'){
            this.lstPolicyBeneficiariesApply[index].orgUnitID = event.id;
          }
          else{
            this.lstPolicyBeneficiariesExclude[index].orgUnitID = event.id;
          }
          this.lstOrgUnitID = this.lstOrgUnitID.filter((obj) => obj.rec != this.currentRec);
          for(let i = 0; i < lstId.length; i++){
            this.lstOrgUnitID.push({
              rec:this.currentRec,
              id:lstId[i]
            });
          }
          break;
        case 'JobLevels':
          if(this.currentTab == 'applyObj'){
            this.lstPolicyBeneficiariesApply[index].jobLevel = event.id;
          }
          else{
            this.lstPolicyBeneficiariesExclude[index].jobLevel = event.id;
          }
          this.lstJobLevel = this.lstJobLevel.filter((obj) => obj.rec != this.currentRec);
          for(let i = 0; i < lstId.length; i++){
            this.lstJobLevel.push({
              rec:this.currentRec,
              id:lstId[i]
            });
          }
          break;
        case 'PositionsName':
          if(this.currentTab == 'applyObj'){
          this.lstPolicyBeneficiariesApply[index].positionID = event.id;
          }
          else{
            this.lstPolicyBeneficiariesExclude[index].positionID = event.id;
          }
          this.lstPositionID = this.lstPositionID.filter((obj) => obj.rec != this.currentRec);
          for(let i = 0; i < lstId.length; i++){
            this.lstPositionID.push({
              rec:this.currentRec,
              id:lstId[i]
            });
          }
          break;
        case 'EmployeeTypes':
          if(this.currentTab == 'applyObj'){
              this.lstPolicyBeneficiariesApply[index].employeeTypeID = event.id;
            }
            else{
              this.lstPolicyBeneficiariesExclude[index].employeeTypeID = event.id;
            }
          this.lstEmployeeTypeID = this.lstEmployeeTypeID.filter((obj) => obj.rec != this.currentRec);
          for(let i = 0; i < lstId.length; i++){
            this.lstEmployeeTypeID.push({
              rec:this.currentRec,
              id:lstId[i]
            });
          }
          break;
        case 'ContractTypes':
          if(this.currentTab == 'applyObj'){
            this.lstPolicyBeneficiariesApply[index].contractTypeID = event.id;
          }
          else{
            this.lstPolicyBeneficiariesExclude[index].contractTypeID = event.id;
          }
          this.lstContractTypeID = this.lstContractTypeID.filter((obj) => obj.rec != this.currentRec);
          for(let i = 0; i < lstId.length; i++){
            this.lstContractTypeID.push({
              rec:this.currentRec,
              id:lstId[i]
            });
          }
          break;
        case 'Employees':
          if(this.currentTab == 'applyObj'){
          this.lstPolicyBeneficiariesApply[index].employeeID = event.id;
          }
          else{
            this.lstPolicyBeneficiariesExclude[index].employeeID = event.id;
          }
          // this.lstPolicyBeneficiariesApply[index].employeeID = event.id;
          this.lstEmployeeID = this.lstEmployeeID.filter((obj) => obj.rec != this.currentRec);
          for(let i = 0; i < lstId.length; i++){
            this.lstEmployeeID.push({
              rec:this.currentRec,
              id:lstId[i]
            });
          }
          break;
    }
  }
  

  // ValChangeSelectObj(event){
  //   this.lstPolicyBeneficiariesApply = this.alpolicyObj.includeObjects.split(';')  
  //   this.cache.valueList('HRObject').subscribe((res) => {
  //     debugger
  //     res.datas
  //   })
  // }
}
}
