import { Targets } from './../../model/okr.model';
import { AuthStore, Util } from 'codx-core';
import { OMCONST } from './../../codx-om.constant';
import {
  Component,
  EventEmitter,
  Injector,
  Input,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  AuthService,
  CodxFormComponent,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { CodxOmService } from '../../codx-om.service';
import { userInfo } from 'os';

@Component({
  selector: 'popup-add-kr',
  templateUrl: 'popup-add-kr.component.html',
  styleUrls: ['popup-add-kr.component.scss'],
})
export class PopupAddKRComponent extends UIComponent {
  @ViewChild('form') form: CodxFormComponent;
  headerText = '';
  subHeaderText = '';
  typePlan = '';
  planMonth = [];
  planQuarter = [];
  allowCopyField = [];
  listTarget = [];
  formModel: FormModel;
  dialogRef: DialogRef;
  isAfterRender: boolean;
  fGroupAddKR: FormGroup;
  oParentID: any;
  dialogTargets: DialogRef;
  funcID: any;
  funcType: any;
  isSubKR: boolean;
  isAdd = true;
  kr: any;
  oldKR: any;
  targetsModel: any;
  okrRecID: any;
  monthVLL: any;
  quarterVLL: any;
  planVLL = [];
  omSetting: any;
  defaultFequence: any;
  frequenceVLL: any;
  messMonth: any;
  messWeek: any;
  messDay: any;
  defaultCheckInDay: any;
  defaultCheckInTime: any;
  messMonthSub: any;
  curUser: any;
  tempDay = '';
  tempTime = '';
  oldPlan: any;
  editTargets = [];
  groupModel: any;
  modelCbb:any;
  dialogCheckIn: DialogRef;
  okrPlan: any;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.funcID = dialogData.data[0];
    this.funcType = dialogData?.data[1];
    this.headerText = dialogData?.data[2];
    this.oldKR = dialogData.data[3];
    this.isSubKR = dialogData.data[4];
    this.groupModel = dialogData.data[5];
    this.okrPlan = dialogData.data[6];
    this.modelCbb={TransID:this.okrPlan?.recID,};
    this.dialogRef = dialogRef;
    this.formModel = dialogRef.formModel;
    if (
      this.funcType == OMCONST.MFUNCID.Edit ||
      this.funcType == OMCONST.MFUNCID.Copy
    ) {
      this.typePlan = this.oldKR.plan;
    }
    this.curUser = authStore.get();
    this.oldPlan = this.kr?.plan;
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  ngAfterViewInit(): void {}

  onInit(): void {
    this.getParameter();
    this.getCacheData();
    this.getCurrentKR();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache & Param-----------------------------//
  //---------------------------------------------------------------------------------//

  getCacheData() {
    this.cache.valueList('SYS054').subscribe((vll) => {
      if (vll) {
        this.quarterVLL = vll;
      }
    });
    this.cache.valueList('SYS053').subscribe((vll) => {
      if (vll) {
        this.monthVLL = vll;
      }
    });
    this.cache.valueList('OM020').subscribe((vll) => {
      if (vll?.datas && vll?.datas.length > 0) {
      }
    });
    this.cache.message('OM004').subscribe((mes) => {
      if (mes) {
        this.messMonth = mes?.customName;
      }
    });
    this.cache.message('OM005').subscribe((mes) => {
      if (mes) {
        this.messMonthSub = mes?.customName;
      }
    });
    this.cache.message('OM006').subscribe((mes) => {
      if (mes) {
        this.messDay = mes?.customName;
      }
    });
    this.cache.message('OM007').subscribe((mes) => {
      if (mes) {
        this.messWeek = mes?.customName;
      }
    });
  }
  getParameter() {
    this.codxOmService
      .getOMParameter(OMCONST.PARAM.Type1)
      .subscribe((param: any) => {
        if (param) {
          this.omSetting = JSON.parse(param.dataValue);
          this.defaultFequence = this.omSetting?.Frequency;
          
        }
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  getCurrentKR() {
    if(this.funcType == OMCONST.MFUNCID.Add){
      this.afterOpenAddForm();
      this.isAfterRender = true;
    }
    else{
      this.codxOmService.getOKRByID(this.oldKR.recID).subscribe((krModel) => {
        if (krModel) {
          if (this.funcType == OMCONST.MFUNCID.Edit) {
            this.afterOpenEditForm(krModel);
          } else {
            this.afterOpenCopyForm(krModel);
          }       
          this.isAfterRender = true;   
        }
      });
    } 
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  valueChange(evt: any) {
    if (evt && evt.field) {
      this.kr[evt.field] = evt.data;
    }
    this.detectorRef.detectChanges();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//
  planChange(evt: any) {
    if (evt?.data != null && this.kr?.target && this.kr?.plan) {
      if (evt?.data != this.oldPlan) {
        this.calculatorTarget(evt?.data);
      }
      this.detectorRef.detectChanges();
    }
  }
  targetChange(evt: any) {
    if (evt?.data != null && this.kr?.target && this.kr?.plan) {      
      this.calculatorTarget(this.kr?.plan);      
      this.detectorRef.detectChanges();
    }
  }
  checkInChange(evt: any) {
    if (evt?.field == 'day') {
      this.tempDay = evt?.data;
      this.detectorRef.detectChanges();
    }
    if (evt?.field == 'time') {
      this.tempTime = evt?.data;
      this.detectorRef.detectChanges();
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  onSaveForm() {    
    this.fGroupAddKR = this.form?.formGroup;

    this.kr.buid = this.kr.buid ?? this.curUser?.buid;
    this.kr.divisionID = this.kr.divisionID ?? this.curUser?.divisionID;
    if (this.kr.targets?.length == 0 || this.kr.targets == null) {
      this.calculatorTarget(this.kr?.plan);
      this.onSaveTarget();
    }
    // this.fGroupAddKR.patchValue(this.kr);
    //   if (this.fGroupAddKR.invalid == true) {
    //   this.codxOmService.notifyInvalid(
    //     this.fGroupAddKR,
    //     this.formModel
    //   );
    //   return;
    // }
    //tính lại Targets cho KR

    if (
      this.funcType == OMCONST.MFUNCID.Add ||
      this.funcType == OMCONST.MFUNCID.Copy
    ) {
      this.methodAdd(this.kr);
    } else if (this.funcType == OMCONST.MFUNCID.Edit) {
      this.methodEdit(this.kr);
    }
  }

  methodAdd(kr: any) {
    this.codxOmService.addKR(this.kr).subscribe((res: any) => {
      if (res) {
        res.write = true;
        res.delete = true;
        this.afterSave(res);
      }
    });
  }

  methodEdit(kr: any) {
    this.codxOmService.editKR(this.kr).subscribe((res: any) => {
      if (res) {
        res.write = true;
        res.delete = true;
        this.afterSave(res);
      }
    });
  }

  afterSave(kr: any) {
    if (
      this.funcType == OMCONST.MFUNCID.Add ||
      this.funcType == OMCONST.MFUNCID.Copy
    ) {
      this.notificationsService.notifyCode('SYS006');
    } else {
      this.notificationsService.notifyCode('SYS007');
    }
    this.dialogRef && this.dialogRef.close(kr);
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//
  //Thiết lập OKRLevel theo funcID
  OKRLevel() {
    switch (this.funcID) {
      case OMCONST.FUNCID.COMP:
        this.kr.okrLevel = OMCONST.VLL.OKRLevel.COMP;
        break;
      case OMCONST.FUNCID.DEPT:
        this.kr.okrLevel = OMCONST.VLL.OKRLevel.DEPT;
        break;
      case OMCONST.FUNCID.ORG:
        this.kr.okrLevel = OMCONST.VLL.OKRLevel.ORG;
        break;
      case OMCONST.FUNCID.PERS:
        this.kr.okrLevel = OMCONST.VLL.OKRLevel.PERS;
        break;
    }
    this.detectorRef.detectChanges();
  }

  calculatorTarget(planType: any) {
    if (this.kr?.target && this.kr?.plan) {
      this.kr.targets = [];
      this.planVLL = [];
      if (planType == OMCONST.VLL.Plan.Month) {
        this.planVLL = this.monthVLL?.datas;
      } else if (planType == OMCONST.VLL.Plan.Quarter) {
        this.planVLL = this.quarterVLL.datas;
      }
      if (this.planVLL && this.planVLL.length > 0) {
        for (let i = 0; i < this.planVLL.length; i++) {
          let tmpTarget = { ...this.groupModel?.targetsModel };
          tmpTarget.period =
            this.kr?.plan == OMCONST.VLL.Plan.Month
              ? (i + 1).toString()
              : 'Q' + (i + 1).toString();
          tmpTarget.okrid = this.kr?.recID;
          tmpTarget.target = this.kr.target / this.planVLL.length;
          tmpTarget.edited = false;
          this.kr.targets.push(tmpTarget);
        }
        this.detectorRef.detectChanges();
      }
    }
  }  

  closeEditTargets(dialog: any) {
    // this.kr.targets = [];
    // for (let i = 0; i < this.editTargets.length; i++) {
    //   this.kr.targets.push({ ...this.editTargets[i] });
    // }
    dialog.close();
  }

  afterOpenAddForm() {
    if(this.isSubKR){
      this.kr = { ...this.groupModel?.skrModel };
    }
    else{      
      this.kr = { ...this.groupModel?.krModel };
    }
    this.kr.transID= this.okrPlan?.recID;
  }
  fullTargets(planVLL:any, targets:any, plan:string){
    if(planVLL!=null && targets!=null){
      let tempTarget = [];
      for(let i=0; i<planVLL.length;i++){
        if(targets[i].periodID=planVLL[i].value){
          tempTarget.push(targets[i]);
        }
        else{
          let nullTarget= {...targets[0]};
          nullTarget.periodID=planVLL[i].value;
          nullTarget.target=0;        
          tempTarget.push(targets[i]);
        }
      }
    }
    
  }
  afterOpenEditForm(krModel: any) {
    this.kr = krModel;
    this.planVLL = this.kr?.plan == OMCONST.VLL.Plan.Month ? this.monthVLL?.datas:this.quarterVLL?.datas;
    //this.fullTargets()
    
  }
  afterOpenCopyForm(krModel: any) {
    this.afterOpenAddForm();
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((gv: any) => {
        if (gv) {          
          let gridView = Util.camelizekeyObj(gv);
          for (const key in gridView) {
            const element = gridView[key];
            if (element?.allowCopy) {
              this.allowCopyField.push(key);
            }
          }

          for (const fieldName of this.allowCopyField) {
            this.kr[fieldName] = krModel[fieldName];
          }          
          this.planVLL = this.kr?.plan == OMCONST.VLL.Plan.Month ? this.monthVLL?.datas:this.quarterVLL?.datas;
        }
      });
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
  openPopupFrequence(template: any) {
    // if (this.kr?.frequence == null) {
    //   this.notificationsService.notify('Tần suất cập nhật cần có giá trị', '2');
    //   return;
    // }

    this.dialogCheckIn = this.callfc.openForm(template, '', 450, 300, null);
    this.detectorRef.detectChanges();
  }
  openPopupTarget(template: any) {
    if (
      this.kr?.target == 0 ||
      this.kr?.target == null ||
      this.kr?.plan == null
    ) {
      this.notificationsService.notifyCode('OM003');
        return;
      
    } else if (
      this.kr.targets == null ||
      this.kr?.targets == null ||
      this.kr?.targets.length == 0
    ) {
      this.calculatorTarget(this.kr?.plan);
    }
    this.editTargets = [];

    for (let i = 0; i < this.kr.targets.length; i++) {
      this.editTargets.push({ ...this.kr.targets[i] });
    }

    let popUpHeight = this.kr?.plan == OMCONST.VLL.Plan.Month ? 780 : 420;
    this.dialogTargets = this.callfc.openForm(
      template,
      '',
      650,
      500,
//      popUpHeight,
      null
    );
    this.detectorRef.detectChanges();
  }
  onSaveTarget() {
    let sumTargets = 0;
    for (let i = 0; i < this.kr.targets.length; i++) {
      sumTargets += this.kr.targets[i].target;
    }
    if (Math.round(sumTargets) !=this.kr.target) {
      this.notificationsService.notify(
        'Tổng chỉ tiêu phân bổ chưa đồng nhất với chỉ tiêu',
        '2'
      );
      return;
    }
    // if (this.funcType == OMCONST.MFUNCID.Edit) {
    //   this.codxOmService
    //     .editKRTargets(this.kr?.recID, this.kr?.targets)
    //     .subscribe((res) => {});
    // }
    this.kr.targets=[];
    for (let i = 0; i < this.editTargets.length; i++) {
      this.kr.targets.push({ ...this.editTargets[i] });
    }
    this.dialogTargets?.close();
    this.dialogTargets = null;
  }
  onSaveCheckIn() {
    if (this.kr?.checkIn == null) {
      this.kr.checkIn = { day: '', time: '' };
    }
    this.kr.checkIn.day = this.tempDay != this.kr.checkIn.day && this.tempDay!=""? this.tempDay :this.kr.checkIn.day;
    this.kr.checkIn.time = this.tempTime != this.kr.checkIn.time && this.tempTime!=""? this.tempTime :this.kr.checkIn.time;
    if(this.kr.frequence =="M" && this.kr.checkIn.day=="0"){
      this.kr.checkIn.day="1";
    }
    this.detectorRef.detectChanges();
    this.dialogCheckIn?.close();
  }

  valuePlanTargetChange(evt: any, index: number) {
    if (index != null && evt?.data != null) {
      this.editTargets[index].target = evt.data;
      this.editTargets[index].edited = true;
      //Tính lại target tự động
      let targetsNotChanged = [];
      let totalTargetsEdited = 0;

      for (let i = 0; i < this.editTargets.length; i++) {
        if (this.editTargets[i]?.edited != true) {
          targetsNotChanged.push(i);
        } else {
          totalTargetsEdited += this.editTargets[i]?.target;
        }
      }
      let avgTarget =
        (this.kr.target - totalTargetsEdited) / targetsNotChanged.length;
      for (let i = 0; i < this.editTargets.length; i++) {
        if (this.editTargets[i]?.edited != true) {
          this.editTargets[i].target = avgTarget;
        }
      }
    }
  }
  refreshPlanTargets() {
    if (this.kr.target && this.editTargets && this.editTargets.length > 0) {
      let avgTarget = this.kr.target / this.editTargets.length;
      for (let i = 0; i < this.editTargets.length; i++) {
        this.editTargets[i].target = avgTarget;
      }
      this.detectorRef.detectChanges();
    }
  }
}
