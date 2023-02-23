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
import { Targets } from '../../model/okr.model';
import { row } from '@syncfusion/ej2-angular-grids';

//import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-okr-plan',
  templateUrl: 'popup-add-okr-plan.component.html',
  styleUrls: ['popup-add-okr-plan.component.scss'],
})
export class PopupAddOKRPlanComponent extends UIComponent {
  @ViewChild('form') form: CodxFormComponent;
  headerText = '';
  subHeaderText = '';
  month = 'Tháng ';
  quarter = 'Quý ';
  months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  quarters = ['1', '2', '3', '4'];
  quartersMonth = ['1', '4', '7', '10'];
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
  planVLL= [];
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

  //-----------------------Base Func-------------------------//
  ngAfterViewInit(): void {}

  onInit(): void {
    this.getCacheData();
    this.getCurrentKR();

  }

  //-----------------------End-------------------------------//

  //-----------------------Base Event------------------------//
  valueChange(evt: any) {
    if (evt && evt.field) {
      this.kr[evt.field] = evt.data;
    }
    this.detectorRef.detectChanges();
  }
  //-----------------------End-------------------------------//

  //-----------------------Get Cache Data---------------------//
  getCacheData(){
    this.cache.valueList('SYS054').subscribe((qVLL) => {
      if (qVLL) {
        this.quarterVLL = qVLL;
      }
    });
    this.cache.valueList('SYS053').subscribe((mVLL) => {
      if (mVLL) {
        this.monthVLL = mVLL;
      }
    });
  }
  //-----------------------End-------------------------------//
  
  //-----------------------Get Data Func---------------------//
  getCurrentKR(){
    if (this.funcType == OMCONST.MFUNCID.Edit) {
      this.okrRecID = this.oldKR.recID;
    } else {
      this.okrRecID = null;
    }
    this.codxOmService.getOKRByID(this.okrRecID).subscribe((krModel) => {
      if (krModel) {
        if (this.funcType == OMCONST.MFUNCID.Add) {          
          this.afterOpenAddForm(krModel)
        } else if (this.funcType == OMCONST.MFUNCID.Edit) {          
          this.afterOpenEditForm(krModel)
        } else {
          this.afterOpenCopyForm(krModel)
        }
        this.isAfterRender = true;
      }
    });
  }
  //-----------------------End-------------------------------//

  //-----------------------Validate Func---------------------//

  //-----------------------End-------------------------------//

  //-----------------------Logic Func------------------------//
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


  //-----------------------End-------------------------------//

  //-----------------------Custom Event-----------------------//
  planChange(evt: any) {
    if (evt?.data != null && this.kr?.target && this.kr?.plan  ) {
      if(evt?.data != this.kr.plan){
        this.calculatorTarget(evt?.data);
      }      
      this.detectorRef.detectChanges();
    }
  }
  //-----------------------End-------------------------------//

  //-----------------------Custom Func-----------------------//
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

  calculatorTarget(planType:any) {
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
  afterOpenAddForm(krModel:any){
    this.kr = krModel;
    if (this.kr.targets && this.kr.targets.length > 0) {
      this.targetModel = { ...this.kr.targets[0] };
      this.kr.targets = [];
      this.kr.shares = [];
      this.kr.checkIns = [];
    }
  }
  afterOpenEditForm(krModel:any){
    this.kr = krModel;
    if (this.kr?.plan == OMCONST.VLL.Plan.Month) {
      this.planVLL = this.monthVLL?.datas;
    } else if (this.kr?.plan == OMCONST.VLL.Plan.Quarter) {
      this.planVLL = this.quarterVLL.datas;
    }
  }
  afterOpenCopyForm(krModel:any){
    this.cache
    .gridViewSetup(
      this.formModel?.formName,
      this.formModel?.gridViewName
    )
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
      }
    });
  }
  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//
  openPopupTarget(template: any) {
    if(this.kr?.target == 0 || this.kr?.target==null || this.kr?.plan==null){
      this.notificationsService.notify('OM003');
      return;
    }
    else if (this.kr.targets.length == 0 || this.kr.targets == null ) {
      this.calculatorTarget(this.kr?.plan);      
    } 
    let popUpHeight = this.kr?.plan == OMCONST.VLL.Plan.Month ? 780 : 420;
    this.dialogTargets = this.callfc.openForm( template, '', 550, popUpHeight, null );
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
  //-----------------------End-------------------------------//
}
