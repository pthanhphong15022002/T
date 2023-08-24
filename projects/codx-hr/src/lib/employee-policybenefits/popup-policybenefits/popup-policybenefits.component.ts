import { ChangeDetectorRef, Component, HostListener, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { CRUDService, CallFuncService, CodxGridviewV2Component, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, UIComponent, Util } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { FormGroup } from '@angular/forms';
import { PopupMultiselectvllComponent } from '../../employee-policyal/popup-multiselectvll/popup-multiselectvll.component';
import {
  EditSettingsModel, detailIndentCellInfo,
} from '@syncfusion/ej2-angular-grids';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
@Component({
  selector: 'lib-popup-policybenefits',
  templateUrl: './popup-policybenefits.component.html',
  styleUrls: ['./popup-policybenefits.component.css']
})
export class PopupPolicybenefitsComponent 
extends UIComponent
implements OnInit{
  @HostListener('click', ['$event.target']) onClick(e) {
    if(this.gridView1){
      if(this.gridView1.gridRef.isEdit == true){
        this.gridView1.endEdit();
      }else{
       //
      }
    }
  }

  @ViewChild('tmpGrid1Col1', { static: true })
  tmpGrid1Col1: TemplateRef<any>;
  @ViewChild('tmpGrid1Col2', { static: true })
  tmpGrid1Col2: TemplateRef<any>;
  @ViewChild('tmpGrid1Col3', { static: true })
  tmpGrid1Col3: TemplateRef<any>;
  @ViewChild('headTmpGrid1Col1', { static: true }) headTmpGrid1Col1: TemplateRef<any>;
  @ViewChild('headTmpGrid1Col2', { static: true }) headTmpGrid1Col2: TemplateRef<any>;
  @ViewChild('headTmpGrid1Col3', { static: true }) headTmpGrid1Col3: TemplateRef<any>;

  @ViewChild('gridView1') gridView1: CodxGridviewV2Component;
  @ViewChild('attachment') attachment: AttachmentComponent;

  lstSelectedBenefits: any = []

  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  funcID: string;
  actionType: string;
  idField = 'PolicyID';
  isAfterRender = false;
  headerText: string;
  benefitPolicyObj: any;
  autoNumField: any;
  benefitFormModel: any;

  currentRec: any;
  currentCbxName: any;
  currentCbxValue: any = [];
  lstPolicyDetailRecID: any = []

  lstPolicyBeneficiariesApply: any = []
  lstPolicyBeneficiariesExclude: any = []

  constraintKowDisabled = true;
  constraintKow = false
  expandContraintKow = false;

  dataSourceGridView1 : any = [];
  loadGridview1 = false;

  columnGrid1: any;

  lstOrgUnitID: any = []
  lstJobLevel: any = []
  lstPositionID: any = []
  lstEmployeeTypeID: any = []
  lstContractTypeID: any = []
  lstEmployeeID: any = []
  lstEmpStatus: any = []
  lstLabourType: any = []

  lstSelectedConstraintTrainLevel : any = []
  lstSelectedConstraintTrainField : any = []
  lstSelectedConstraintCertificate : any = []

  lstSelectedObj: any = [];
  lstSelectedExcludeObj: any = [];
  lstSelectedConstraintBy: any =[];

  lstKow: any = [];
  lstMinKows: any = [];
  lstMaxKows: any = [];

  isHidden = true;
  isHidden2 = true;
  isHidden3 = true;
  isHiddenCbxMinKows = true;
  isHiddenCbxMaxKows = true;

  fmPolicyBeneficiaries: FormModel = {
    formName: 'PolicyBeneficiaries',
    gridViewName: 'grvPolicyBeneficiaries',
    entityName: 'HR_PolicyBeneficiaries',
  };

  fmPolicyConstraints: FormModel = {
    formName: 'PolicyConstraints',
    gridViewName: 'grvPolicyConstraints',
    entityName: 'HR_PolicyConstraints',
  };

  fmPolicyDetail: FormModel = {
    formName: 'PolicyDetails',
    gridViewName: 'grvPolicyDetails',
    entityName: 'HR_PolicyDetails',
  };
  
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  
  formGroupPolicyConstraints;
  constraintsObj : any;

  fmKow: FormModel = {

  };

  grvSetup: any;
  grvSetupPolicyDetail : any;
  grvSetupPolicyConstraint : any;
  benefitFuncID = 'HRTEM0403'

  isHiddenCbxConstraint = true;
  cbxConstraintCbxName : any;
  cbxConstraintCbxValue: any;

  fieldHeaderTexts;
  policyIdEdited = false;
  originPolicyId = '';
  currentTab = '';

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

  constructor(
    private injector: Injector,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,
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
    this.benefitPolicyObj = JSON.parse(JSON.stringify(data?.data?.dataObj));
    if(this.benefitPolicyObj && this.actionType == 'edit'){
      this.originPolicyId = this.benefitPolicyObj.policyID;
    }
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
          field: 'amt',
          allowEdit : true,
          controlType: 'text',
          dataType : 'string',
          headerTemplate: this.headTmpGrid1Col2,
          template: this.tmpGrid1Col2,
          width: '150',
        },
        {
          field: 'pct',
          allowEdit : true,
          controlType: 'text',
          dataType : 'string',
          headerTemplate: this.headTmpGrid1Col3,
          template: this.tmpGrid1Col3,
          width: '150',
        },
      ]
    }
    this.cache.gridViewSetup('PolicyConstraints', 'grvPolicyConstraints').subscribe((res) => {
      this.grvSetupPolicyConstraint = res;
      console.log('contraints grv', this.grvSetupPolicyConstraint);
      
    })
    this.hrSevice
            .getFormGroup(this.fmPolicyConstraints.formName, this.fmPolicyConstraints.gridViewName)
            .then((fg) => {
              if (fg) {
                this.formGroupPolicyConstraints = fg;
              }
            });
    if(!this.benefitFormModel){
      this.hrSevice.getFormModel(this.benefitFuncID).then((formModel) => {
        if(formModel){
          console.log('benefit form model', formModel);
          
          this.benefitFormModel = formModel;
        }
      })
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

  addRowGrid1(){
    if(this.benefitPolicyObj.policyID){
      this.CheckIfPolicyIDExist(this.benefitPolicyObj.policyID).subscribe((res) => {
        if(res[0] == true){
          this.originPolicyId = this.benefitPolicyObj.policyID;
          let idx = this.gridView1.dataSource.length;
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

  onAddNewGrid1(evt){
    if(!this.benefitPolicyObj.policyID){
      this.notify.notifyCode('SYS009',0,this.fieldHeaderTexts['PolicyID'])
      return
    }
    if(!this.benefitPolicyObj.policyType){
      this.notify.notifyCode('SYS009',0,this.fieldHeaderTexts['PolicyType'])
      return
    }
    if(!evt.fromValue){
      this.notify.notifyCode('HR029');
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
    if(!evt.amt){
      this.notify.notifyCode('HR030');
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
    if(!evt.pct){
      this.notify.notifyCode('HR031');
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
    evt.policyID = this.benefitPolicyObj.policyID;
    evt.policyType = this.benefitPolicyObj.policyType;
    evt.itemType = 'BenefitAdjustBy'
    evt.itemSelect = this.benefitPolicyObj.adjustBy
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

  clickMF(event, data){
    this.notify.alertCode('SYS030').subscribe((x) => {
      if (x.event?.status == 'Y') {
        this.DeletePolicyDetail(data.recID).subscribe((res) => {
          if(res == true){
            this.notify.notifyCode('SYS008');
              (this.gridView1?.dataService as CRUDService)?.remove(data).subscribe();
              this.gridView1.deleteRow(data, true);
          }
        })
    }
      }
    )}

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

  openFormUploadFile() {
    this.attachment.uploadFile();
  }

  async addFiles(evt){
    this.benefitPolicyObj.attachments = evt.data.length;
  }
  fileAdded(evt){

  }

  changeTab(event){
    this.currentTab = event.nextId;
  }

  onChangeAdjustBy(evt){
    if(parseInt(evt.data) > 0){
      this.GetPolicyDetailByAjustBy(evt.data).subscribe((res) => {
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

  onClickOpenVllIsConstraintOther(){
    if(this.benefitPolicyObj.isConstraintOther){
      let opt = new DialogModel();
      let popup = this.callfunc.openForm(
        PopupMultiselectvllComponent,
        null,
        400,
        450,
        null,
        {
          headerText: 'Chọn điều kiện áp dụng',
          vllName : this.grvSetup.ConstraintBy.referedValue,
          formModel: this.formModel,
          dataSelected: this.benefitPolicyObj.constraintBy
        },
        null,
        opt
      );
      popup.closed.subscribe((res) => {
        if(res.event){
          this.benefitPolicyObj.constraintBy = res.event
          this.lstSelectedConstraintBy = res.event.split(';')
          this.lstSelectedConstraintBy.sort((a, b) => {
            return parseInt(a) - parseInt(b);
          });
          debugger
          this.df.detectChanges();
        }
      });
    }
  }

  ValChangeIsAdjustKow(event){
    let hasKow = event.data;

    if(hasKow == false){
      this.benefitPolicyObj.isAdjustKow = false;
    }
    else{
      this.benefitPolicyObj.isAdjustKow = true;
      this.onClickOpenCbxKow()
    }
  }

  ValChangeIsConstraintOther(event){
    let constraintOther = event.data;

    if(constraintOther == false){
      this.benefitPolicyObj.isConstraintOther = false;
    }
    else if(constraintOther == true){
      this.benefitPolicyObj.isConstraintOther = true;
      this.onClickOpenVllIsConstraintOther();
    }
  }

  ValChangeHasInclueObj(event){
    let flag = event.data;

    if(flag == false){
      this.benefitPolicyObj.hasIncludeObjects = false;
    }
    else if(flag == true){
      this.benefitPolicyObj.hasIncludeObjects = true;
      this.onClickOpenSelectIncludeObj()
    }
  }

  ValChangeContraintKow(event){
    
    if(event.data == true){
      this.expandContraintKow = true;
      this.constraintKowDisabled = false;
    }
    else{
      this.expandContraintKow = false;
      this.constraintKowDisabled = true;
    }
    this.df.detectChanges();
  }

  onClickExpandConstaintKow(){
    this.expandContraintKow = !this.expandContraintKow;
  }

  swap(afterIndex, lstData){
    let temp = lstData[afterIndex]
    lstData[afterIndex] = lstData[afterIndex-1]
    lstData[afterIndex-1] = temp;
  }

  fixPriorityIndex(list){
    for(let i = 0; i < list.length; i++){
      list[i].priority = i+1;
    }
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

  onClickOpenSelectIncludeObj(){
    if(this.benefitPolicyObj.hasIncludeObjects){
      debugger
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
          dataSelected: this.benefitPolicyObj.includeObjects
        },
        null,
        opt
      );
      popup.closed.subscribe((res) => {
        if(res.event){
          debugger
          this.benefitPolicyObj.includeObjects = res.event
          this.lstSelectedObj = res.event.split(';')
          if(this.lstSelectedObj.length > 0 && this.lstPolicyBeneficiariesApply.length < 1){
            this.addApplyObj()
          }
          this.df.detectChanges();
        }
      });
    }
  }

  onClickOpenSelectExcludeObj(){
    if(this.benefitPolicyObj.hasExcludeObjects){
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
          dataSelected: this.benefitPolicyObj.excludeObjects
        },
        null,
        opt
      );
      popup.closed.subscribe((res) => {
        this.benefitPolicyObj.excludeObjects = res.event
        this.lstSelectedExcludeObj = res.event.split(';')
        if(this.lstSelectedExcludeObj.length > 0 && this.lstPolicyBeneficiariesExclude.length < 1){
          this.addExcludeObj()
        }
        this.df.detectChanges();
      });
    }
  }

  onClickOpenSelectApplyObjDetail(detail, obj){
    debugger
    this.currentRec = obj.recID;
    if(this.benefitPolicyObj.hasIncludeObjects){
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
    if(this.benefitPolicyObj.hasExcludeObjects){
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

  onInputPolicyID(evt){
    if(this.actionType == 'edit'){
      this.policyIdEdited = true;
    }
  }

  setTitle(evt: any){
    this.headerText += " " +  evt;
    this.df.detectChanges();
  }

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
      console.log('grvSetupDetail', this.grvSetupPolicyDetail);
      
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
            if(res.key){
              this.autoNumField = res.key;
            }
            res.data.status = '1'
            
            if (res.data.activeOn == '0001-01-01T00:00:00') {
              res.data.activeOn = null;
            }
            this.benefitPolicyObj = res?.data;
            
            this.formModel.currentData = this.benefitPolicyObj;
            this.formGroup.patchValue(this.benefitPolicyObj);
              this.constraintsObj = {
                policyID: '',
                gender: '',
                ageFrom: 0,
                policyType: 'Benefit',
                ageTo: 0,
                relative: '',
                relativeAgeFrom: 0,
                relativeAgeTo: 0,
                trainLevel: '',
                trainField: '',
                certificate: ''
              };
              this.formGroupPolicyConstraints?.patchValue(this.constraintsObj);
              this.fmPolicyConstraints.currentData = this.constraintsObj;
            this.df.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        debugger
        if(this.benefitPolicyObj.isConstraintOther){
          this.lstSelectedConstraintBy = this.benefitPolicyObj.constraintBy.split(';')
          this.lstSelectedConstraintBy.sort((a, b) => {
            return parseInt(a) - parseInt(b);
          });
          this.GetPolicyConstraint(this.benefitPolicyObj.policyID).subscribe((res) => {
            console.log('constraint obj ne', this.constraintsObj);
            this.constraintsObj = res;
            this.formGroupPolicyConstraints.patchValue(this.constraintsObj);
            this.fmPolicyConstraints.currentData = this.constraintsObj;
            this.SplitConstraint();
          })
        }
        this.GetPolicyDetailByAjustBy(this.benefitPolicyObj.adjustBy).subscribe((res) => {
          this.dataSourceGridView1 = res;
        });
        if(this.benefitPolicyObj.hasIncludeBenefits == true){
          // this.bene = false;
          this.lstSelectedBenefits = this.benefitPolicyObj.includeBenefits.split(';')
        }
        if(this.benefitPolicyObj.isAdjustKow == true){
          // this.bene = false;
        }
        if(this.benefitPolicyObj.isConstraintKow == true){
          // this.bene = false;
        }
        if(this.benefitPolicyObj.isConstraintOther == true){
          // this.bene = false;
        }

        if (this.actionType == 'copy') {
          if (this.benefitPolicyObj.activeOn == '0001-01-01T00:00:00') {
            this.benefitPolicyObj.activeOn = null;
          }
        }

        if(this.benefitPolicyObj.hasIncludeObjects == true){
          if(this.benefitPolicyObj.includeObjects){
            this.lstSelectedObj = this.benefitPolicyObj.includeObjects.split(';')
          }
        }

        if(this.benefitPolicyObj.hasExcludeObjects == true){
          if(this.benefitPolicyObj.excludeObjects){
            this.lstSelectedExcludeObj = this.benefitPolicyObj.excludeObjects.split(';')
          }
        }

        this.GetPolicyBeneficiaries(this.benefitPolicyObj.policyID).subscribe((res) => {
          
          this.lstPolicyBeneficiariesApply = res.filter((obj) => obj.category == 0);
        this.lstPolicyBeneficiariesApply = this.hrSevice.sortAscByProperty(this.lstPolicyBeneficiariesApply, 'priority');
          this.SplitToSubList(this.lstPolicyBeneficiariesApply);

          this.lstPolicyBeneficiariesExclude = res.filter((obj) => obj.category == 1);
        this.lstPolicyBeneficiariesExclude = this.hrSevice.sortAscByProperty(this.lstPolicyBeneficiariesExclude, 'priority');

          this.SplitToSubList(this.lstPolicyBeneficiariesExclude);
          this.formGroup.patchValue(this.benefitPolicyObj);
          this.formModel.currentData = this.benefitPolicyObj;
        })
        this.formGroup.patchValue(this.benefitPolicyObj);
        this.formModel.currentData = this.benefitPolicyObj;
        
        this.df.detectChanges();
        this.isAfterRender = true;
      }
    }
    this.loadGridview1 = true;
  }

  SplitConstraint(){
    if(this.constraintsObj){
      if(this.constraintsObj.trainLevel && this.constraintsObj.trainLevel != ''){
        this.lstSelectedConstraintTrainLevel = this.constraintsObj.trainLevel.split(';')
      }
      if(this.constraintsObj.trainField && this.constraintsObj.trainField != ''){
        this.lstSelectedConstraintTrainField = this.constraintsObj.trainField.split(';')
      }
      if(this.constraintsObj.certificate && this.constraintsObj.certificate != ''){
        this.lstSelectedConstraintCertificate = this.constraintsObj.certificate.split(';')
      }
    }
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

  ValChangeHasIncludeBenefits(event){
    let flag = event.data;

    if(flag == false){
      this.benefitPolicyObj.hasIncludeBenefits = false;
      this.benefitPolicyObj.includeBenefits = ''
      this.formGroup.patchValue(this.benefitPolicyObj)
    }
    else if(flag == true){
      this.onClickOpenSelectIncludeBenefits();
    }
  }

  ValChangeHasExcludeObj(event){
    let flag = event.data;

    if(flag == false){
      this.benefitPolicyObj.hasExcludeObjects = false;
    }
    else if(flag == true){
      this.benefitPolicyObj.hasExcludeObjects = true;
      this.onClickOpenSelectExcludeObj()
    }
  }

  addExcludeObj(){
    let newObj = {}
    newObj['recID'] = Util.uid();
    newObj['policyID'] = this.benefitPolicyObj.policyID;
    newObj['priority'] = this.lstPolicyBeneficiariesExclude.length + 1;
    newObj['policyType'] = 'Benefit';
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

  addApplyObj(){
    let newObj = {}
    newObj['recID'] = Util.uid();
    newObj['policyID'] = this.benefitPolicyObj.policyID;
    newObj['priority'] = this.lstPolicyBeneficiariesApply.length + 1;
    newObj['policyType'] = 'Benefit';
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
    this.lstPolicyBeneficiariesApply.push(newObj)
    
    this.df.detectChanges()
  }

  onClickHideComboboxPopup2(e): void {
    if(e == null){
      this.isHidden2 = true;
    this.detectorRef.detectChanges();
      return;
    }
    if(e.id){
        this.benefitPolicyObj.includeBenefits = e.id;
    }
    else{
      this.benefitPolicyObj.includeBenefits = null;
    }
    this.isHidden2 = true;

    if(this.benefitPolicyObj.includeBenefits){
      this.lstSelectedBenefits = this.benefitPolicyObj.includeBenefits.split(';')
    }
    else{
      this.lstSelectedBenefits = [];
    }
    this.detectorRef.detectChanges();
  }

  onClickHideComboboxPopup3(e): void {
    if(e == null){
      this.isHidden3 = true;
    this.detectorRef.detectChanges();
      return;
    }
    if(e.id){
        this.benefitPolicyObj.adjustKows = e.id;
    }
    else{
      this.benefitPolicyObj.adjustKows = null;
    }
    this.isHidden3 = true;

    if(this.benefitPolicyObj.adjustKows){
      this.lstKow = this.benefitPolicyObj.adjustKows.split(';')
    }
    else{
      this.lstKow = [];
    }
    this.detectorRef.detectChanges();
  }

  onClickOpenComboboxConstraint(target){
    debugger
    if(target == 'trainLevel'){
      // value list

      let opt = new DialogModel();
      let popup = this.callfunc.openForm(
        PopupMultiselectvllComponent,
        null,
        400,
        450,
        null,
        {
          headerText: 'Chọn đối tượng',
          vllName : this.grvSetupPolicyConstraint.TrainLevel.referedValue,
          formModel: this.fmPolicyConstraints,
          dataSelected: this.constraintsObj?.trainLevel
        },
        null,
        opt
      );
      popup.closed.subscribe((res) => {
        this.constraintsObj.trainLevel = res.event
        this.lstSelectedConstraintTrainLevel = res.event.split(';')
        this.df.detectChanges();
      });
    }
    else if(target == 'trainField'){
      //cbx
      this.cbxConstraintCbxName = this.grvSetupPolicyConstraint.TrainField.referedValue;
      this.cbxConstraintCbxValue = this.constraintsObj.trainField
      this.isHiddenCbxConstraint = false;
      debugger
    }
    else if(target == 'certificate'){
      //cbx
      this.cbxConstraintCbxName = this.grvSetupPolicyConstraint.Certificate.referedValue;
      this.cbxConstraintCbxValue = this.constraintsObj.certificate
      this.isHiddenCbxConstraint = false;
      debugger
    }
  }

  onClickHideComboboxConstraint(e): void {
    if(e == null){
      this.isHiddenCbxConstraint = true;
    this.detectorRef.detectChanges();
      return;
    }
    if(e.id){
      debugger
      if(this.cbxConstraintCbxName == this.grvSetupPolicyConstraint.TrainField.referedValue){
        this.constraintsObj.trainField = e.id;
        this.lstSelectedConstraintTrainField = this.constraintsObj.trainField.split(';');
      }
      else if(this.cbxConstraintCbxName == this.grvSetupPolicyConstraint.Certificate.referedValue){
        this.constraintsObj.certificate = e.id;
        this.lstSelectedConstraintCertificate = this.constraintsObj.certificate.split(';');
      }
    }
    else{
      debugger
      if(this.cbxConstraintCbxName == this.grvSetupPolicyConstraint.TrainField.referedValue){
        this.constraintsObj.trainField = null;
        this.lstSelectedConstraintTrainField = []
      }
      else if(this.cbxConstraintCbxName == this.grvSetupPolicyConstraint.Certificate.referedValue){
        this.constraintsObj.certificate = null;
        this.lstSelectedConstraintCertificate = []
      }
    }
    this.isHiddenCbxConstraint = true;
    this.detectorRef.detectChanges();
  }

  onClickHideComboboxMinKows(e): void {
    if(e == null){
      this.isHiddenCbxMinKows = true;
    this.detectorRef.detectChanges();
      return;
    }
    if(e.id){
        this.benefitPolicyObj.minKows = e.id;
    }
    else{
      this.benefitPolicyObj.minKows = null;
    }
    this.isHiddenCbxMinKows = true;

    if(this.benefitPolicyObj.minKows){
      this.lstMinKows = this.benefitPolicyObj.minKows.split(';')
    }
    else{
      this.lstMinKows = [];
    }
    this.detectorRef.detectChanges();
  }

  onClickHideComboboxMaxKows(e): void {
    if(e == null){
      this.isHiddenCbxMaxKows = true;
    this.detectorRef.detectChanges();
      return;
    }
    if(e.id){
        this.benefitPolicyObj.maxKows = e.id;
    }
    else{
      this.benefitPolicyObj.maxKows = null;
    }
    this.isHiddenCbxMaxKows = true;

    if(this.benefitPolicyObj.maxKows){
      this.lstMaxKows = this.benefitPolicyObj.maxKows.split(';')
    }
    else{
      this.lstMaxKows = [];
    }
    this.detectorRef.detectChanges();
  }

  onClickOpenSelectIncludeBenefits(){
    if(this.benefitPolicyObj.hasIncludeBenefits){
      this.isHidden2 = false;
    }
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

  onClickMoveObjDown(obj){
    
    let crrPriority = obj.priority;
    let objAfterIndex : any;
    if(this.currentTab == 'applyObj'){
      objAfterIndex = this.lstPolicyBeneficiariesApply.findIndex(p => p.priority == crrPriority +1);
      obj.priority += 1;
      if(objAfterIndex > 0){
        this.lstPolicyBeneficiariesApply[objAfterIndex].priority -= 1;
        this.swap(objAfterIndex, this.lstPolicyBeneficiariesApply);
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



  async onSaveForm(){
    if (this.formGroup.invalid) {
      this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    if(this.benefitPolicyObj.activeOn && this.benefitPolicyObj.expiredOn){
      if (this.benefitPolicyObj.expiredOn < this.benefitPolicyObj.activeOn) {
        this.hrSevice.notifyInvalidFromTo(
          'ActiveOn',
          'ExpiredOn',
          this.formModel
          )
          return;
        }
    }

    if(this.benefitPolicyObj.hasIncludeBenefits == true && !this.benefitPolicyObj.includeBenefits){
      this.notify.notifyCode('HR018')
      return
    }

    if(this.benefitPolicyObj.hasIncludeObjects == true && (this.benefitPolicyObj.includeObjects?.length < 1 || this.lstPolicyBeneficiariesApply.length < 1)){
      this.notify.notifyCode('HR032')
      return
    }

    if(this.benefitPolicyObj.hasExcludeObjects == true && (this.benefitPolicyObj.excludeObjects?.length < 1 || this.lstPolicyBeneficiariesExclude.length < 1)){
      this.notify.notifyCode('HR033')
      return
    }

    if(this.benefitPolicyObj.hasIncludeObjects == false){
      this.benefitPolicyObj.includeObjects = ''
    }
    if(this.benefitPolicyObj.hasExcludeObjects == false){
      this.benefitPolicyObj.excludeObjects = ''
    }

    if(
      this.attachment.fileUploadList &&
      this.attachment.fileUploadList.length > 0
      ) {
      this.attachment.objectId=this.benefitPolicyObj?.policyID;
      (await (this.attachment.saveFilesObservable())).subscribe(
      (item2:any)=>{
            
          });
      }

    if(this.actionType === 'add' || this.actionType === 'copy'){
      this.AddPolicyBenefits(this.benefitPolicyObj).subscribe((res) => {
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

            if(this.benefitPolicyObj.isConstraintOther && this.benefitPolicyObj.constraintBy){
              this.constraintsObj.policyID = this.benefitPolicyObj?.policyID;
              this.AddPolicyConstraint(this.constraintsObj).subscribe((res) => {
                
              })
            }
          this.dialog && this.dialog.close(this.benefitPolicyObj);
        }
        else{
        }
      })
    }
    else if(this.actionType === 'edit'){
      if(this.originPolicyId != '' && this.originPolicyId != this.benefitPolicyObj.policyID){
        this.EditPolicyBenefitsIDChanged().subscribe((res) => {
          if(res){
            this.notify.notifyCode('SYS007');
            this.DeletePolicyBeneficiaries(this.originPolicyId).subscribe((res) => {
              if(this.benefitPolicyObj.hasIncludeObjects == true || this.benefitPolicyObj.hasExcludeObjects == true){
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
            if(this.benefitPolicyObj.constraintBy){
              this.DeletePolicyConstraint(this.originPolicyId).subscribe((res) => {
                if(this.benefitPolicyObj.isConstraintOther){
                  this.constraintsObj.policyID = this.benefitPolicyObj?.policyID;
                  this.AddPolicyConstraint(this.constraintsObj).subscribe((res) => {
                  })
                }
              })
            }
            this.dialog && this.dialog.close(this.benefitPolicyObj);
          }
          else{
            this.notify.notifyCode('SYS023');
          }
        })
      }
      else{
        this.EditPolicyBenefits(this.benefitPolicyObj).subscribe((res) => {
          if(res){
            this.notify.notifyCode('SYS007');
            this.DeletePolicyConstraint(this.benefitPolicyObj.policyID).subscribe((res) => {
                if(this.benefitPolicyObj.constraintBy){
                this.constraintsObj.policyID = this.benefitPolicyObj?.policyID;
                this.AddPolicyConstraint(this.constraintsObj).subscribe((res) => {
                })
              }
            })
            this.DeletePolicyBeneficiaries(this.benefitPolicyObj.policyID).subscribe((res) => {
                if(this.benefitPolicyObj.hasIncludeObjects == true || this.benefitPolicyObj.hasExcludeObjects == true){
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
            this.dialog && this.dialog.close(this.benefitPolicyObj);
          }
          else{
            this.notify.notifyCode('SYS023');
          }
        })
      }
    }
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
  }

  switch(from){
    case 'lstSelectedObj':
      debugger
      this.lstPolicyBeneficiariesApply = lstBeneficiaries;
      let index = this.lstSelectedObj.indexOf(data);
      this.lstSelectedObj.splice(index,1);
      this.benefitPolicyObj.includeObjects = this.lstSelectedObj.join(';');
      break;
    case 'lstSelectedExcludeObj':
      this.lstPolicyBeneficiariesExclude = lstBeneficiaries;
      let index2 = this.lstSelectedExcludeObj.indexOf(data);
      this.lstSelectedExcludeObj.splice(index2,1);
      this.benefitPolicyObj.excludeObjects = this.lstSelectedExcludeObj.join(';');
      break;
  }
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
      case 'lstSelectedBenefits':
        let index9 = this.lstSelectedBenefits.indexOf(data);
        this.lstSelectedBenefits.splice(index9,1);
        this.benefitPolicyObj.includeBenefits = this.lstSelectedBenefits.join(';');
        break;
      case 'lstKow':
        let index10 = this.lstKow.indexOf(data);
        this.lstKow.splice(index10,1);
        this.benefitPolicyObj.adjustKows = this.lstKow.join(';');
        break;
      case 'lstMinKows':
        let index11 = this.lstMinKows.indexOf(data);
        this.lstMinKows.splice(index11,1);
        this.benefitPolicyObj.minKows = this.lstMinKows.join(';');
        break;
      case 'lstMaxKows':
        let index12 = this.lstMaxKows.indexOf(data);
        this.lstMaxKows.splice(index12,1);
        this.benefitPolicyObj.maxKows = this.lstMaxKows.join(';');
        break;
      case 'lstSelectedConstraintTrainLevel':
        let index13 = this.lstSelectedConstraintTrainLevel.indexOf(data);
        this.lstSelectedConstraintTrainLevel.splice(index13,1);
        this.constraintsObj.trainLevel = this.lstSelectedConstraintTrainLevel.join(';');
        break;
      case 'lstSelectedConstraintTrainField':
        let index14 = this.lstSelectedConstraintTrainField.indexOf(data);
        this.lstSelectedConstraintTrainField.splice(index14,1);
        this.constraintsObj.trainField = this.lstSelectedConstraintTrainField.join(';');
        break;
      case 'lstSelectedConstraintCertificate':
        let index15 = this.lstSelectedConstraintCertificate.indexOf(data);
        this.lstSelectedConstraintCertificate.splice(index15,1);
        this.constraintsObj.certificate = this.lstSelectedConstraintCertificate.join(';');
        break;
    }
    this.df.detectChanges();
}

onClickOpenCbxKow(){
  if(this.benefitPolicyObj.isAdjustKow){
    this.isHidden3 = false;
  }
}

onClickOpenCbxMinKows(){
  if(this.benefitPolicyObj.isConstraintKow){
    this.isHiddenCbxMinKows = false;
  }
}

onClickOpenCbxMaxKows(){
  if(this.benefitPolicyObj.isConstraintKow){
    this.isHiddenCbxMaxKows = false;
  }
}

  //#region apis
  AddPolicyConstraint(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness',
      'AddPolicyConstraintsAsync',
      data
    );
  }

  GetPolicyConstraint(policyID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness',
      'GetPolicyConstraintsByPolicyIDAsync',
      policyID
    );
  }

  DeletePolicyConstraint(policyID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness',
      'DeletePolicyConstraintsByPolicyIDAsync',
      policyID
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

  CheckIfPolicyIDExist(id){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness',
      'CheckPolicyALIDExisted',
      id
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

  GetPolicyDetailByAjustBy(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'GetPolicyDetailByPredicateAsync',
      ['Benefit', this.benefitPolicyObj.policyID, 'BenefitAdjustBy', data]
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

  AddPolicyBeneficiaries(obj){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBeneficiariesBusiness',
      'AddPolicyBeneficiariesAsync',
      obj
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

  AddPolicyBenefits(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness',
      'AddPolicyBenefitsAsync',
      data
    );
  }

  EditPolicyBenefits(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness',
      'UpdateBenefitPolicyAsync',
      data
    );
  }

  EditPolicyBenefitsIDChanged(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness',
      'UpdatePolicyBenefitPolicyIDChangedAsync',
      [this.benefitPolicyObj, this.originPolicyId]
    );
  }
  //#endregion
}
