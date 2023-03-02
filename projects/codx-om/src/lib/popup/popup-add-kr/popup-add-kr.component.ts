import { Util } from 'codx-core';
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
  tempTarget: any;
  funcType: any;
  isSubKR: boolean;
  isAdd = true;
  kr: any;
  oldKR: any;
  targetModel: any;
  okrRecID: any;
  monthVLL: any;
  quarterVLL: any;
  planVLL = [];
  omSetting: any;
  defaultFequence: any;
  frequenceVLL: any;
  messMonth:any;
  messWeek:any;
  messDay:any;
  defaultCheckInDay: any;
  defaultCheckInTime: any;
  messMonthSub: any;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.funcID = dialogData.data[0];
    this.funcType = dialogData?.data[1];
    this.headerText = dialogData?.data[2];
    this.oldKR = dialogData.data[3];
    this.isSubKR = dialogData.data[4];
    this.dialogRef = dialogRef;
    this.formModel = dialogRef.formModel;
    if (
      this.funcType == OMCONST.MFUNCID.Edit ||
      this.funcType == OMCONST.MFUNCID.Copy
    ) {
      this.typePlan = this.oldKR.plan;
    }
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  ngAfterViewInit(): void {}

  onInit(): void {
    this.getCacheData();
    this.getParameter();          
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
      if (vll?.datas && vll?.datas.length>0) {
        
      }
    });
    this.cache.message('OM004').subscribe((mes)=>{
      if(mes){
        this.messMonth=mes;
        
      }
    })
    this.cache.message('OM005').subscribe((mes)=>{
      if(mes){
        this.messMonthSub=mes;
      }
    })
    this.cache.message('OM006').subscribe((mes)=>{
      if(mes){
        this.messDay=mes;
      }
    })
    this.cache.message('OM007').subscribe((mes)=>{
      if(mes){
        this.messWeek=mes;
      }
    })
  }
  getParameter(){
    this.codxOmService.getOMParameter(OMCONST.PARAM.Type1).subscribe((param:any)=>{
      if(param){
        this.omSetting = JSON.parse(param.dataValue);
        this.defaultFequence=this.omSetting?.Frequency;
        this.defaultCheckInDay= this.omSetting?.CheckIn?.Day;
        this.defaultCheckInTime= this.omSetting?.CheckIn?.Time;  
      }
    })
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  getCurrentKR() {
    if (this.funcType == OMCONST.MFUNCID.Edit) {
      this.okrRecID = this.oldKR.recID;
    } else {
      this.okrRecID = null;
    }
    this.codxOmService.getOKRByID(this.okrRecID).subscribe((krModel) => {
      if (krModel) {
        if (this.funcType == OMCONST.MFUNCID.Add) {
          this.afterOpenAddForm(krModel);
        } else if (this.funcType == OMCONST.MFUNCID.Edit) {
          this.afterOpenEditForm(krModel);
        } else {
          this.afterOpenCopyForm(krModel);
        }
        
        this.isAfterRender = true;
      }
    });
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
      if (evt?.data != this.kr.plan) {
        this.calculatorTarget(evt?.data);
      }
      this.detectorRef.detectChanges();
    }
  }
  checkInChange(evt:any){
    if (evt?.field) {
      this.kr.checkIn.day=evt?.data;
      this.detectorRef.detectChanges();
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  beforeSave(option: RequestOption) {
    let itemData = this.fGroupAddKR.value;
    option.methodName = '';
    option.data = [itemData, this.funcType];
    return true;
  }

  onSaveForm() {
    //xóa khi đã lấy được model chuẩn từ setting
    if (
      this.funcType == OMCONST.MFUNCID.Add ||
      this.funcType == OMCONST.MFUNCID.Copy
    ) {
      this.kr.okrType = this.isSubKR
        ? OMCONST.VLL.OKRType.SKResult
        : OMCONST.VLL.OKRType.KResult;
      this.OKRLevel();
    } else {
      this.kr.edited = true;
    }
    //---------------------------------------
    this.fGroupAddKR = this.form?.formGroup;
    this.fGroupAddKR.patchValue(this.kr);

    //tính lại Targets cho KR
    if (this.kr.targets?.length == 0 || this.kr.targets == null) {
      this.calculatorTarget(this.kr?.plan);
      this.onSaveTarget();
    }
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
          let tmpTarget = { ...this.targetModel };
          tmpTarget.period = this.kr?.periodID;
          tmpTarget.okrid = this.kr?.recID;
          tmpTarget.target = this.kr.target / this.planVLL.length;
          tmpTarget.isEdited = false;
          this.kr.targets.push(tmpTarget);
        }
        this.detectorRef.detectChanges();
      }
    }
  }
  // mapDefaultValueToData(kr:any){
  //   kr.frequence=this.defaultFequence;
  //   kr.checkIn={day:this.defaultCheckInDay,time:this.defaultCheckInTime}
  // }
  afterOpenAddForm(krModel: any) {
    this.kr = krModel;
    if (this.kr?.targets &&  this.kr?.targets !=null && this.kr?.targets.length > 0) {
      this.targetModel = { ...this.kr.targets[0] };
      this.kr.targets = [];
      this.kr.shares = [];
      this.kr.checkIns = [];
    }
    //this.mapDefaultValueToData(this.kr);
  }
  afterOpenEditForm(krModel: any) {
    this.kr = krModel;
    if (this.kr?.plan == OMCONST.VLL.Plan.Month) {
      this.planVLL = this.monthVLL?.datas;
    } else if (this.kr?.plan == OMCONST.VLL.Plan.Quarter) {
      this.planVLL = this.quarterVLL.datas;
    }   
    
  }
  afterOpenCopyForm(krModel: any) {
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
            krModel[fieldName] = this.oldKR[fieldName];
          }
          this.kr = krModel;
          this.kr.shares = [];
          this.kr.checkIns = [];          
        //this.mapDefaultValueToData(this.kr);
        }
      });
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
  openPopupFrequence(template: any) {
    if (this.kr?.frequence == null) {
      this.notificationsService.notify('OM004');
      return;
    }

    this.dialogTargets = this.callfc.openForm(
      template,
      '',
      450,
      300,
      null
    );
    this.detectorRef.detectChanges();
  }
  openPopupTarget(template: any) {
    if (
      this.kr?.target == 0 ||
      this.kr?.target == null ||
      this.kr?.plan == null
    ) {
      this.notificationsService.notify('OM003');
      return;
    } else if (this.kr.targets == null || this.kr?.targets ==null || this.kr?.targets.length == 0 ) {
      this.calculatorTarget(this.kr?.plan);
    }
    let popUpHeight = this.kr?.plan == OMCONST.VLL.Plan.Month ? 780 : 420;
    this.dialogTargets = this.callfc.openForm(
      template,
      '',
      550,
      popUpHeight,
      null
    );
    this.detectorRef.detectChanges();
  }
  onSaveTarget() {
    this.dialogTargets?.close();
    this.dialogTargets = null;
  }

  valuePlanTargetChange(evt: any, index: number) {
    if (index != null && evt?.data != null) {
      this.kr.targets[index].target = evt.data;
      this.kr.targets[index].isEdited = evt.data;
    }
    this.detectorRef.detectChanges();
  }
}
