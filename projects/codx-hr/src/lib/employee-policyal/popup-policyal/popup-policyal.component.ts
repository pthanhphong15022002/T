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

  monthDateValid = true;

  lstOrgUnitID: any = []
  lstJobLevel: any = []
  lstPositionID: any = []
  lstEmployeeTypeID: any = []
  lstContractTypeID: any = []
  lstEmployeeID: any = []
  lstEmpStatus: any = []
  lstLabourType: any = []

  // lstRecEmptyorgUnitID: any = []
  // lstRecEmptyjobLevel: any = []
  // lstRecEmptypositionID: any = []
  // lstRecEmptyemployeeTypeID: any = []
  // lstRecEmptylabourType: any = []
  // lstRecEmptycontractTypeID: any = []
  // lstRecEmptyemployeeID: any = []
  // lstRecEmptyemployeeStatus: any = []
  
  lstPolicyBeneficiariesApply: any = []
  lstPolicyBeneficiariesExclude: any = []
  hasApplyExcludeObjAtBeginning = false;

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

  autoNumField: any;
  loadedAutoField = false;


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
  //formGroup: FormGroup;
  dialog: DialogRef;
  actionType: string;
  idField = 'PolicyID';
  // isAfterRender = false;
  headerText: string;
  alpolicyObj: any;
  // grvSetup
  grvSetupPolicyDetail


  // originPolicyId = '';
  // originPolicyALObj = '';

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

  @ViewChild('form') form: LayoutAddComponent;
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
    debugger
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.actionType = data?.data?.actionType;
    this.alpolicyObj = JSON.parse(JSON.stringify(data?.data?.dataObj));
    // if(this.alpolicyObj && this.actionType == 'edit'){
    //   this.originPolicyId = this.alpolicyObj.policyID;
    //   this.originPolicyALObj = JSON.parse(JSON.stringify(this.alpolicyObj));
    // }
  }

  openFormUploadFile() {
    this.attachment.uploadFile();
  }

  async addFiles(evt){
    this.alpolicyObj.attachments = evt.data.length;
  }
  async deleteFile(evt){
    this.alpolicyObj.attachments = this.attachment.fileUploadList.length
    this.EditPolicyAL(this.alpolicyObj).subscribe((res) => {
    })
  }
  async countFile(){
    this.alpolicyObj.attachments = this.attachment.fileUploadList.length
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

  onAfterInitForm(evt){
    debugger
  }

  loadEmpFullInfo(empID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetEmpFullInfoAsync',
      empID
    )
  }

  deleteApplyExcludeObj(data, from, crrObj?){
    switch(from){
        case 'lstPositionID':
          let index = this.lstPositionID.indexOf(data);
          this.lstPositionID.splice(index,1);
          let lstId = this.lstPositionID.map(item => item.id);
          crrObj.positionID = lstId.join(';');
          break;
        case 'lstOrgUnitID':
          let index2 = this.lstOrgUnitID.indexOf(data);
          this.lstOrgUnitID.splice(index2,1);
          let lstId2 = this.lstOrgUnitID.map(item => item.id);
          crrObj.orgUnitID = lstId2.join(';');
          break;
        case 'lstJobLevel':
          let index3 = this.lstJobLevel.indexOf(data);
          this.lstJobLevel.splice(index3,1);
          let lstId3 = this.lstJobLevel.map(item => item.id);
          crrObj.jobLevel = lstId3.join(';');
          break;
        case 'lstEmployeeTypeID':
          let index4 = this.lstEmployeeTypeID.indexOf(data);
          this.lstEmployeeTypeID.splice(index4,1);
          let lstId4 = this.lstEmployeeTypeID.map(item => item.id);
          crrObj.employeeTypeID = lstId4.join(';');
          break;
        case 'lstLabourType':
          let index5 = this.lstLabourType.indexOf(data);
          this.lstLabourType.splice(index5,1);
          let lstId5 = this.lstLabourType.map(item => item.id);
          crrObj.labourType = lstId5.join(';');
          break;
        case 'lstContractTypeID':
          let index6 = this.lstContractTypeID.indexOf(data);
          this.lstContractTypeID.splice(index6,1);
          let lstId6 = this.lstContractTypeID.map(item => item.id);
          crrObj.contractTypeID = lstId6.join(';');
          break;
        case 'lstEmployeeID':
          let index7 = this.lstEmployeeID.indexOf(data);
          this.lstEmployeeID.splice(index7,1);
          let lstId7 = this.lstEmployeeID.map(item => item.id);
          crrObj.employeeID = lstId7.join(';');
          break;
        case 'lstEmpStatus':
          let index8 = this.lstEmpStatus.indexOf(data);
          this.lstEmpStatus.splice(index8,1);
          let lstId8 = this.lstEmpStatus.map(item => item.id);
          crrObj.employeeStatus = lstId8.join(';');
          break;
      }
      this.df.detectChanges();
  }

  deleteApplyExcludeObjMain(data, from, lstBeneficiaries){
    switch(data){
      case '1':
        lstBeneficiaries = lstBeneficiaries.map(item => ({ ...item, orgUnitID: null }));
        // lstBeneficiaries.orgUnitID = null
        break;
      case '2':
        lstBeneficiaries = lstBeneficiaries.map(item => ({ ...item, jobLevel: null }));
        // lstBeneficiaries.jobLevel = null
        break;
      case '3':
        lstBeneficiaries = lstBeneficiaries.map(item => ({ ...item, positionID: null }));
        // lstBeneficiaries.positionID = null
        break;
      case '4':
        lstBeneficiaries = lstBeneficiaries.map(item => ({ ...item, employeeTypeID: null }));
        // lstBeneficiaries.employeeTypeID = null
        break;
      case '5':
        lstBeneficiaries = lstBeneficiaries.map(item => ({ ...item, labourType: null }));
        // lstBeneficiaries.labourType = null
        break;
      case '6':
        lstBeneficiaries = lstBeneficiaries.map(item => ({ ...item, contractTypeID: null }));
        // lstBeneficiaries.contractTypeID = null
        break;
      case '7':
        debugger
        lstBeneficiaries = lstBeneficiaries.map(item => ({ ...item, employeeID: null }));
        // lstBeneficiaries.employeeID = null
        break;
      case '8':
        lstBeneficiaries = lstBeneficiaries.map(item => ({ ...item, employeeStatus: null }));
        // lstBeneficiaries.employeeStatus = null
        break;
    }}

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

    this.initForm();

    // if (!this.formModel)
    //   this.hrSevice.getFormModel(this.funcID).then((formModel) => {
    //     if (formModel) {
    //       this.formModel = formModel;
    //       this.hrSevice
    //         .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
    //         .then((fg) => {
    //           if (fg) {
    //             this.formGroup = fg;
    //             this.initForm();
    //           }
    //         });
    //     }
    //   });
    // else
    //   this.hrSevice
    //     .getFormGroup(this.formModel.formName, this.formModel.gridViewName , this.formModel)
    //     .then((fg) => {
    //       if (fg) {
    //         this.formGroup = fg;
    //         this.initForm();
    //       }
    //     });
  }
  
  // checkExistInEmptyRec(lst, rec){
  //   
  //   if(lst.includes(rec)){
  //     return true;
  //   }
  //   return false;
  // }

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
    // this.cache
    // .gridViewSetup(
    //   this.formModel.formName,
    //   this.formModel.gridViewName
    // )
    // .subscribe((res) => {
    //   this.grvSetup = res;
    // });

    this.cache
    .gridViewSetup(
      'PolicyDetails',
      'grvPolicyDetails'
    )
    .subscribe((res) => {
      this.grvSetupPolicyDetail = res;
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
            debugger
            if(res.key){
              this.autoNumField = res.key ? res.key : null;
              this.loadedAutoField = true;
              this.df.detectChanges();
            }
            res.data.status = '1'
            
            if (res.data.activeOn == '0001-01-01T00:00:00') {
              res.data.activeOn = null;
            }
            this.alpolicyObj = res?.data;
            
            // this.formModel.currentData = this.alpolicyObj;
            // this.formGroup.patchValue(this.alpolicyObj);
            this.cr.detectChanges();
            // this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.hrSevice
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.autoNumField = res.key ? res.key : null;
            this.loadedAutoField = true;
            this.df.detectChanges();
          }}
          )
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
        if(this.alpolicyObj.hasIncludeObjects == true){
          
          if(this.alpolicyObj.includeObjects){
            this.lstSelectedObj = this.alpolicyObj.includeObjects.split(';')
          }
        }
        if(this.alpolicyObj.hasExcludeObjects == true){
          
          if(this.alpolicyObj.excludeObjects){
            this.lstSelectedExcludeObj = this.alpolicyObj.excludeObjects.split(';')
          }
        }
        this.GetPolicyBeneficiaries(this.alpolicyObj.policyID).subscribe((res) => {
          
          this.lstPolicyBeneficiariesApply = res.filter((obj) => obj.category == 0);
        this.lstPolicyBeneficiariesApply = this.hrSevice.sortAscByProperty(this.lstPolicyBeneficiariesApply, 'priority');
          this.SplitToSubList(this.lstPolicyBeneficiariesApply);

          this.lstPolicyBeneficiariesExclude = res.filter((obj) => obj.category == 1);
        this.lstPolicyBeneficiariesExclude = this.hrSevice.sortAscByProperty(this.lstPolicyBeneficiariesExclude, 'priority');
          this.SplitToSubList(this.lstPolicyBeneficiariesExclude);
          // this.formGroup.patchValue(this.alpolicyObj);
          // this.formModel.currentData = this.alpolicyObj;
        })
        // this.formGroup.patchValue(this.alpolicyObj);
        // this.formModel.currentData = this.alpolicyObj;
        
        this.cr.detectChanges();
        // this.isAfterRender = true;
      }
    }

    this.loadGridview2 = true;
  }

  SplitToSubList(lstData){
    for(let i = 0; i < lstData.length; i++){
      let lstTemp = []
      if(lstData[i].orgUnitID){
        lstTemp =lstData[i].orgUnitID.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.lstOrgUnitID.push({
            rec:lstData[i].recID,
            id:lstTemp[j]
          })
        }
      }
      if(lstData[i].jobLevel){
        lstTemp =lstData[i].jobLevel.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.lstJobLevel.push({
            rec:lstData[i].recID,
            id:lstTemp[j]
          })
        }
        // this.lstJobLevel = [...this.lstJobLevel, ...lstData[i].jobLevel.split(';')]
      }
      if(lstData[i].positionID){
        lstTemp =lstData[i].positionID.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.lstPositionID.push({
            rec:lstData[i].recID,
            id:lstTemp[j]
          })
        }
      }
      if(lstData[i].labourType){
        lstTemp =lstData[i].labourType.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.lstLabourType.push({
            rec:lstData[i].recID,
            id:lstTemp[j]
          })
        }
      }
      if(lstData[i].employeeTypeID){
        lstTemp =lstData[i].employeeTypeID.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.lstEmployeeTypeID.push({
            rec:lstData[i].recID,
            id:lstTemp[j]
          })
        }
      }
      if(lstData[i].contractTypeID){
        lstTemp =lstData[i].contractTypeID.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.lstContractTypeID.push({
            rec:lstData[i].recID,
            id:lstTemp[j]
          })
        }
      }
      if(lstData[i].employeeID){
        lstTemp =lstData[i].employeeID.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.loadEmpFullInfo(lstTemp[j]).subscribe((res) => {
            this.lstEmployeeID.push({
              rec:lstData[i].recID,
              id:lstTemp[j],
              info: res[0],
              positionName: res[1]
            })
          })
        }
      }
      if(lstData[i].employeeStatus){
        lstTemp =lstData[i].employeeStatus.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.lstEmpStatus.push({
            rec:lstData[i].recID,
            id:lstTemp[j]
          })
        }
      }
    }
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

  onClickMoveObjDown(obj){
    
    let crrPriority = obj.priority;
    let objAfterIndex : any;
    if(this.currentTab == 'applyObj'){
      objAfterIndex = this.lstPolicyBeneficiariesApply.findIndex(p => p.priority == crrPriority +1);
      obj.priority += 1;
      if(objAfterIndex > 0){
        this.lstPolicyBeneficiariesApply[objAfterIndex].priority -= 1;
        this.swap(objAfterIndex, this.lstPolicyBeneficiariesApply);
        // let temp = this.lstPolicyBeneficiariesApply[objAfterIndex]
        // this.lstPolicyBeneficiariesApply[objAfterIndex] = this.lstPolicyBeneficiariesApply[objAfterIndex-1]
        // this.lstPolicyBeneficiariesApply[objAfterIndex-1] = temp;
      }
    }
    else if(this.currentTab == 'subtractObj'){
      objAfterIndex = this.lstPolicyBeneficiariesExclude.findIndex(p => p.priority == crrPriority +1);
      obj.priority += 1;
      if(objAfterIndex > 0){
        this.lstPolicyBeneficiariesExclude[objAfterIndex].priority -= 1;
        this.swap(objAfterIndex, this.lstPolicyBeneficiariesExclude);
      }
    }
    this.df.detectChanges();
  }

  setTitle(evt: any){
    this.headerText += " " +  evt;
    this.cr.detectChanges();
  }

  onClickMoveObjUp(obj){
    
    let crrPriority = obj.priority;
    let objBeforeIndex : any;
    if(this.currentTab == 'applyObj'){
      objBeforeIndex = this.lstPolicyBeneficiariesApply.findIndex(p => p.priority == crrPriority -1);
      obj.priority -= 1;
      if(objBeforeIndex > -1){
        this.lstPolicyBeneficiariesApply[objBeforeIndex].priority += 1;
        this.swap(objBeforeIndex+1, this.lstPolicyBeneficiariesApply);
      }
    }
    else if(this.currentTab == 'subtractObj'){
      objBeforeIndex = this.lstPolicyBeneficiariesExclude.findIndex(p => p.priority == crrPriority -1);
      obj.priority -= 1;
      if(objBeforeIndex > -1){
        this.lstPolicyBeneficiariesExclude[objBeforeIndex].priority += 1;
        this.swap(objBeforeIndex+1, this.lstPolicyBeneficiariesExclude);
      }
    }
    this.df.detectChanges();
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
    this.monthDateValid = true;
    if(month == 4 || month == 6 || month == 9 || month == 11){
      if(day > 30){
        this.notify.notifyCode('HR016');
    this.monthDateValid = false;

      }
    }
    else if(month == 2){
      if(day > 28){
        this.notify.notifyCode('HR016');
    this.monthDateValid = false;

      }
    }
    else{
      if(day > 31){
        this.notify.notifyCode('HR016');
    this.monthDateValid = false;
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

  CheckIfPolicyIDExist(id){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'CheckPolicyALIDExisted',
      id
    );
  }

  GetPolicyDetailByFirstMonthType(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'GetPolicyDetailByPredicateAsync',
      ['AL', this.alpolicyObj.policyID, 'ALFirstMonthType', data]
    );
  }

  GetPolicyDetailBySeniorityType(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'GetPolicyDetailByPredicateAsync',
      ['AL', this.alpolicyObj.policyID, 'ALSeniorityType', '1']
    );
  }

  EditPolicyALPolicyIDChanged(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'UpdatePolicyALPolicyIDChangedAsync',
      [this.alpolicyObj, this.form.form.preData.policyID]
    );
  }

  EditPolicyAL(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'UpdatePolicyALAsync',
      data
    );
  }

  AddPolicyAL(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'AddPolicyALAsync',
      data
    );
  }

  DeletePolicyBeneficiaries(policyID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBeneficiariesBusiness',
      'DeletePolicyBeneficiariesAsync',
      policyID
    );
  }

  AddPolicyBeneficiaries(obj){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBeneficiariesBusiness',
      'AddPolicyBeneficiariesAsync',
      obj
    );
  }

  //Detail la cai grid view v2 chinh sua them xoa sua truc tiep
  AddPolicyDetail(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'AddPolicyDetailAsync',
      data
    );
  }

  GetPolicyBeneficiaries(policyID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBeneficiariesBusiness',
      'GetBeneficiariesAsync',
      policyID
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

  onClickExpandIsMonth(){
    this.expandIsMonth = !this.expandIsMonth;
  }

  async onSaveForm(){
    if (this.form.formGroup.invalid) {
      this.hrSevice.notifyInvalid(this.form.formGroup, this.formModel);
      this.form.form.validation(false);
      return;
    }

    if(this.alpolicyObj.activeOn && this.alpolicyObj.expiredOn){
      if (this.alpolicyObj.expiredOn < this.alpolicyObj.activeOn) {
        this.hrSevice.notifyInvalidFromTo(
          'ActiveOn',
          'ExpiredOn',
          this.formModel
          )
          return;
        }
    }

    if(this.monthDateValid == false){
      this.notify.notifyCode('HR016');
      return;
    }

    if(this.alpolicyObj.hasIncludeObjects == true && (this.alpolicyObj.includeObjects?.length < 1 || this.lstPolicyBeneficiariesApply?.length < 1)){
      this.notify.notifyCode('HR032')
      return
    }

    if(this.alpolicyObj.hasExcludeObjects == true && (this.alpolicyObj.excludeObjects?.length < 1 || this.lstPolicyBeneficiariesExclude?.length < 1)){
      this.notify.notifyCode('HR033')
      return
    }

    if(
      this.attachment.fileUploadList &&
      this.attachment.fileUploadList.length > 0
      ) {
      this.attachment.objectId=this.alpolicyObj?.policyID;
      (await (this.attachment.saveFilesObservable())).subscribe(
      (item2:any)=>{
            
          });
      }



      if(this.alpolicyObj.hasIncludeObjects == false){
        this.alpolicyObj.includeObjects = ''
      }
      if(this.alpolicyObj.hasExcludeObjects == false){
        this.alpolicyObj.excludeObjects = ''
      }


      if(this.actionType === 'add' || this.actionType === 'copy'){
        this.AddPolicyAL(this.alpolicyObj).subscribe((res) => {
          if(res){
              this.notify.notifyCode('SYS006');
              for(let i = 0; i < this.lstPolicyBeneficiariesApply.length; i++){
                this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesApply[i]).subscribe((res) => {
                  
                })
              }
              for(let i = 0; i < this.lstPolicyBeneficiariesExclude.length; i++){
                this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesExclude[i]).subscribe((res) => {
                  
                })
              }
            this.dialog && this.dialog.close(this.alpolicyObj);
          }
          else{
            // this.notify.notifyCode('SYS023');
          }
        })
      }
      else if(this.actionType === 'edit'){
        debugger
        if(this.form.data.policyID != '' && this.form.form.preData.policyID != this.form.data.policyID){
          this.DeletePolicyAL(this.form.form.preData.policyID).subscribe((x) => {
            this.AddPolicyAL(this.alpolicyObj).subscribe((res) => {
              if(res){
                this.notify.notifyCode('SYS007');
  
                this.DeletePolicyBeneficiaries(this.form.form.preData.policyID).subscribe((res) => {
              if(this.alpolicyObj.hasIncludeObjects == true || this.alpolicyObj.hasExcludeObjects == true){
                  for(let i = 0; i < this.lstPolicyBeneficiariesApply.length; i++){
                    this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesApply[i]).subscribe((res) => {
                    })
                  }
                  for(let i = 0; i < this.lstPolicyBeneficiariesExclude.length; i++){
                    this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesExclude[i]).subscribe((res) => {
                    })
                  }
                }
                })
                this.alpolicyObj.editPrimaryKey = true;
                this.alpolicyObj.oldData = this.form.form.preData;
                this.dialog && this.dialog.close(this.alpolicyObj);
              }
              else{
                // this.notify.notifyCode('SYS021');
              }
            })
          })
          // this.EditPolicyALPolicyIDChanged().subscribe((res) => {
          //   if(res){
          //     this.notify.notifyCode('SYS007');

          //     this.DeletePolicyBeneficiaries(this.originPolicyId).subscribe((res) => {
          //   if(this.alpolicyObj.hasIncludeObjects == true || this.alpolicyObj.hasExcludeObjects == true){
          //       for(let i = 0; i < this.lstPolicyBeneficiariesApply.length; i++){
          //         this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesApply[i]).subscribe((res) => {
          //         })
          //       }
          //       for(let i = 0; i < this.lstPolicyBeneficiariesExclude.length; i++){
          //         this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesExclude[i]).subscribe((res) => {
          //         })
          //       }
          //     }
          //     })
          //     this.dialog && this.dialog.close(this.alpolicyObj);
          //   }
          //   else{
          //     this.notify.notifyCode('SYS023');
          //   }
          // })
        }
        else{
          this.EditPolicyAL(this.alpolicyObj).subscribe((res) => {
            if(res){
              this.notify.notifyCode('SYS007');
              this.DeletePolicyBeneficiaries(this.alpolicyObj.policyID).subscribe((res) => {
            if(this.alpolicyObj.hasIncludeObjects == true || this.alpolicyObj.hasExcludeObjects == true){
                for(let i = 0; i < this.lstPolicyBeneficiariesApply.length; i++){
                  this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesApply[i]).subscribe((res) => {
                    
                  })
                }
                for(let i = 0; i < this.lstPolicyBeneficiariesExclude.length; i++){
                  this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesExclude[i]).subscribe((res) => {
                    
                  })
                }
              }
              })
              this.dialog && this.dialog.close(this.alpolicyObj);
            }
            else{
              this.notify.notifyCode('SYS021');
            }
          })
        }
      }
}

DeletePolicyAL(data){
  return this.api.execSv<any>(
    'HR',
    'HR',
    'PolicyALBusiness',
    'DeletePolicyALAsync',
    [data]
  );
}

  addRowGrid1(){
    if(this.alpolicyObj.policyID){
      this.CheckIfPolicyIDExist(this.alpolicyObj.policyID).subscribe((res) => {
        if(res[0] == true){
          // this.originPolicyId = this.alpolicyObj.policyID;
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
        else{
          this.notify.notifyCode('HR027');
        }
      })
    }
    else{
      this.notify.notifyCode('HR027');
    }
  }

  addRowGrid2(){
    if(this.alpolicyObj.policyID){
      this.CheckIfPolicyIDExist(this.alpolicyObj.policyID).subscribe((res) => {
        if(res[0] == true){
          // this.originPolicyId = this.alpolicyObj.policyID;
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
        else{
          this.notify.notifyCode('HR027');
        }
      })
    }
    else{
      this.notify.notifyCode('HR027');
    }
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
    if(!evt.fromValue){
      this.notify.notifyCode('HR023');
      setTimeout(() => {
        this.GetPolicyDetailByFirstMonthType(this.alpolicyObj.firstMonthType).subscribe((res) => {
          this.dataSourceGridView1 = res;
        });
        this.gridView1.refresh();
      }, 200);
      return;
    }
    if(!evt.days){
      this.notify.notifyCode('HR024');
      setTimeout(() => {
        this.GetPolicyDetailByFirstMonthType(this.alpolicyObj.firstMonthType).subscribe((res) => {
          this.dataSourceGridView1 = res;
        });
        this.gridView1.refresh();
      }, 200);
      return;
    }
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
    if(!evt.fromValue){
      this.notify.notifyCode('HR025');
      setTimeout(() => {
        this.GetPolicyDetailBySeniorityType().subscribe((res) => {
          this.dataSourceGridView2 = res;
          this.gridView2.dataSource = res;
        });
        this.gridView2.refresh();
      }, 200);
      return;
    }
    if(!evt.days){
      this.notify.notifyCode('HR026');
      setTimeout(() => {
        this.GetPolicyDetailBySeniorityType().subscribe((res) => {
          this.dataSourceGridView2 = res;
          this.gridView2.dataSource = res;
        });
        this.gridView2.refresh();
      }, 200);
      return;
    }
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
    else if(flag == true){
      this.alpolicyObj.hasIncludeObjects = true;
      this.onClickOpenSelectIncludeObj();
    }
  }

  ValChangeHasExcludeObj(event){
    let flag = event.data;

    if(flag == false){
      this.alpolicyObj.hasExcludeObjects = false;
    }
    else if(flag == true){
      this.alpolicyObj.hasExcludeObjects = true;
      this.onClickOpenSelectExcludeObj();
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
        if(res.event){
          this.alpolicyObj.includeObjects = res.event
          this.lstSelectedObj = res.event.split(';')
          if(this.lstSelectedObj.length > 0 && this.lstPolicyBeneficiariesApply.length < 1){
            this.addApplyObj()
          }
        }
        else{
          this.alpolicyObj.includeObjects = ''
          this.lstSelectedObj = []
          this.lstPolicyBeneficiariesApply = []
        }
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
          headerText: 'Chọn đối tượng loại trừ',
          vllName : 'HRObject',
          formModel: this.formModel,
          dataSelected: this.alpolicyObj.excludeObjects
        },
        null,
        opt
      );
      popup.closed.subscribe((res) => {
        if(res.event){
          this.alpolicyObj.excludeObjects = res.event
          this.lstSelectedExcludeObj = res.event.split(';')
          if(this.lstSelectedExcludeObj.length > 0 && this.lstPolicyBeneficiariesExclude.length < 1){
            this.addExcludeObj()
          }
        }
        else{
          this.alpolicyObj.excludeObjects = ''
          this.lstSelectedExcludeObj = []
          this.lstPolicyBeneficiariesExclude = []
        }
        this.df.detectChanges();
      });
    }
  }

  addApplyObj(){
    let newObj = {}
    newObj['recID'] = Util.uid();
    newObj['policyID'] = this.alpolicyObj.policyID;
    newObj['priority'] = this.lstPolicyBeneficiariesApply.length + 1;
    newObj['policyType'] = 'AL';
    newObj['category'] = '0';
    let lstFieldName = []

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
      lstFieldName.push(fieldName);
      newObj[fieldName] = '';
    }
    // for(let i = 0; i < lstFieldName.length; i++){
    //   switch(lstFieldName[i]){
    //     case 'orgUnitID':
    //       this.lstRecEmptyorgUnitID.push(newObj['recID']);
    //       break;
    //     case 'jobLevel':
    //       this.lstRecEmptyjobLevel.push(newObj['recID']);
    //       break;
    //     case 'positionID':
    //       this.lstRecEmptypositionID.push(newObj['recID']);
    //       break;
    //     case 'employeeTypeID':
    //       this.lstRecEmptyemployeeTypeID.push(newObj['recID']);
    //       break;
    //     case 'labourType':
    //       this.lstRecEmptylabourType.push(newObj['recID']);
    //       break;
    //     case 'contractTypeID':
    //       this.lstRecEmptycontractTypeID.push(newObj['recID']);
    //       break;
    //     case 'employeeID':
    //       this.lstRecEmptyemployeeID.push(newObj['recID']);
    //       break;
    //     case 'employeeStatus':
    //       this.lstRecEmptyemployeeStatus.push(newObj['recID']);
    //       break;
    //   }
    // }
    this.lstPolicyBeneficiariesApply.push(newObj)
    
    this.df.detectChanges()
  }

  addExcludeObj(){
    let newObj = {}
    newObj['recID'] = Util.uid();
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
    
    this.df.detectChanges()
  }

  onClickOpenSelectApplyObjDetail(detail, obj){
    
    this.currentRec = obj.recID;
    if(this.alpolicyObj.hasIncludeObjects){
      if(detail == '5' || detail == '8'){
        let vll = detail == '5' ? 'HR022':'HR003'
        let dtSelected = [];
        let fil = [];
        if(vll == 'HR022'){
          fil = this.lstLabourType.filter((obj) => obj.rec == this.currentRec);
        }
        else if(vll == 'HR003'){
          fil = this.lstEmpStatus.filter((obj) => obj.rec == this.currentRec);
        }
        for(let i = 0; i < fil.length; i++){
          dtSelected.push(fil[i].id);
        }
        let dtSelectedStr = dtSelected.join(';')
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
              dataSelected: dtSelectedStr
            },
            null,
            opt
          );
          popup.closed.subscribe((res) => {
            let index = this.lstPolicyBeneficiariesApply.findIndex((x: any) => this.currentRec == x['recID'])
            let lstId = res.event.split(';');
            if(vll  == 'HR022'){
              this.lstPolicyBeneficiariesApply[index].labourType = res.event;
              this.lstLabourType = this.lstLabourType.filter((obj) => obj.rec != this.currentRec);
              for(let i = 0; i < lstId.length; i++){
                this.lstLabourType.push({
                  rec:this.lstPolicyBeneficiariesApply[index].recID,
                  id:lstId[i]
                });
              }
            }
            else if(vll = 'HR003'){
              
              this.lstPolicyBeneficiariesApply[index].employeeStatus = res.event;
              this.lstEmpStatus = this.lstEmpStatus.filter((obj) => obj.rec != this.currentRec);
              for(let i = 0; i < lstId.length; i++){
                this.lstEmpStatus.push({
                  rec:this.lstPolicyBeneficiariesApply[index].recID,
                  id:lstId[i]
                });
              }
            }
            // this.lstPolicyBeneficiariesApply[index].
            // this.lstPolicyBeneficiariesApply.push(this.policyBeneficiariesDetail);
            
            this.df.detectChanges();
          });
      }
      else{
        switch(detail){
          case '1':
            
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
    
    this.currentRec = obj.recID;
    if(this.alpolicyObj.hasExcludeObjects){
      if(detail == '5' || detail == '8'){
        let vll = detail == '5' ? 'HR022':'HR003'
          let dtSelected = [];
          let fil = [];
          if(vll == 'HR022'){
            fil = this.lstLabourType.filter((obj) => obj.rec == this.currentRec);
          }
          else if(vll == 'HR003'){
            fil = this.lstEmpStatus.filter((obj) => obj.rec == this.currentRec);
          }
          for(let i = 0; i < fil.length; i++){
            dtSelected.push(fil[i].id);
          }
          let dtSelectedStr = dtSelected.join(';')
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
              dataSelected: dtSelectedStr
            },
            null,
            opt
          );
          popup.closed.subscribe((res) => {
            // this.policyBeneficiariesDetail.fieldName = detail == '5' ? 'LabourType':'EmployeeStatus';
            // this.policyBeneficiariesDetail.fieldData = res.event;
            let index = this.lstPolicyBeneficiariesExclude.findIndex((x: any) => this.currentRec == x['recID'])
            let lstId = res.event.split(';');
            if(vll  == 'HR022'){
              this.lstPolicyBeneficiariesExclude[index].labourType = res.event;
              this.lstLabourType = this.lstLabourType.filter((obj) => obj.rec != this.currentRec);
              for(let i = 0; i < lstId.length; i++){
                this.lstLabourType.push({
                  rec:this.lstPolicyBeneficiariesExclude[index].recID,
                  id:lstId[i]
                });
              }
            }
            else if(vll = 'HR003'){
              this.lstPolicyBeneficiariesExclude[index].employeeStatus = res.event;
              this.lstEmpStatus = this.lstEmpStatus.filter((obj) => obj.rec != this.currentRec);
              for(let i = 0; i < lstId.length; i++){
                this.lstEmpStatus.push({
                  rec:this.lstPolicyBeneficiariesExclude[index].recID,
                  id:lstId[i]
                });
              }
            }
            
            this.df.detectChanges();
          });
      }
      else{
        switch(detail){
          case '1':
            
            this.currentCbxName = 'HRDepts';
            this.currentCbxValue = obj.orgUnitID;
            break; 
          case '2':
            this.currentCbxName = 'JobLevels';
            this.currentCbxValue = obj.jobLevel;
            break; 
          case '3':
            this.currentCbxName = 'PositionsName';
            this.currentCbxValue = obj.positionID;
            break; 
          case '4':
            this.currentCbxName = 'EmployeeTypes';
            this.currentCbxValue = obj.employeeTypeID;
            break; 
          case '6':
            this.currentCbxName = 'ContractTypes';
            this.currentCbxValue = obj.contractTypeID;
            break; 
          case '7':
            this.currentCbxName = 'Employees';
            this.currentCbxValue = obj.employeeID;
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

  replace2ObjPriority(arr, obj1, obj2){
    let priorTemp = obj1.priority 
    obj1.priority = obj2.priority 
    obj2.priority = priorTemp
  }
  
  fixPriorityIndex(list){
    for(let i = 0; i < list.length; i++){
      list[i].priority = i+1;
    }
  }

  swap(afterIndex, lstData){
    let temp = lstData[afterIndex]
    lstData[afterIndex] = lstData[afterIndex-1]
    lstData[afterIndex-1] = temp;
  }

  onClickDeleteObject(data){
    this.notify.alertCode('SYS030').subscribe((x) =>{
      if (x.event?.status == 'Y') {
        if(this.currentTab == 'applyObj'){
          let index = this.lstPolicyBeneficiariesApply.indexOf(data);
          if(index != -1){
            this.lstPolicyBeneficiariesApply.splice(index, 1);
            this.lstPolicyBeneficiariesApply = this.hrSevice.sortAscByProperty(this.lstPolicyBeneficiariesApply, 'priority');
            this.fixPriorityIndex(this.lstPolicyBeneficiariesApply)
          }
        }
        else if(this.currentTab == 'subtractObj'){
          let index = this.lstPolicyBeneficiariesExclude.indexOf(data);
          if(index != -1){
            this.lstPolicyBeneficiariesExclude.splice(index, 1);
            this.lstPolicyBeneficiariesExclude = this.hrSevice.sortAscByProperty(this.lstPolicyBeneficiariesExclude, 'priority');
            this.fixPriorityIndex(this.lstPolicyBeneficiariesExclude)
          }
        }
        this.df.detectChanges();
      }
    })
  }

  onClickHideComboboxPopup(event){
    
    this.isHidden = true;
    if(event == null){
      this.detectorRef.detectChanges();
      return;
    }
    else if(event.id){
      let index = 0;
      if(this.currentTab == 'applyObj'){
        index = this.lstPolicyBeneficiariesApply.findIndex((x: any) => this.currentRec == x['recID'])
      }
      else if(this.currentTab == 'subtractObj'){
        index = this.lstPolicyBeneficiariesExclude.findIndex((x: any) => this.currentRec == x['recID'])
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
          this.lstEmployeeID = this.lstEmployeeID.filter((obj) => obj.rec != this.currentRec);
          for(let i = 0; i < lstId.length; i++){
              this.loadEmpFullInfo(lstId[i]).subscribe((res) => {
                this.lstEmployeeID.push({
                  rec:this.currentRec,
                  id:lstId[i],
                  info: res[0],
                  positionName: res[1]
                })
              })
          }
          break;
    }
  }
}
}
