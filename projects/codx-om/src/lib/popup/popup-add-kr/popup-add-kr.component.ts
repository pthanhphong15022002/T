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
  selector: 'popup-add-kr',
  templateUrl: 'popup-add-kr.component.html',
  styleUrls: ['popup-add-kr.component.scss'],
})
export class PopupAddKRComponent extends UIComponent {
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
  okrRecID:any;
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
    
    if (this.funcType == OMCONST.MFUNCID.Edit) {
      this.okrRecID=this.oldKR.recID;
    }
    else{
      this.okrRecID=null;
    }
    this.codxOmService.getOKRByID(this.okrRecID).subscribe((krModel) => {
      if (krModel) {
        if (this.funcType == OMCONST.MFUNCID.Add) {
          this.kr = krModel;
          if (this.kr.targets && this.kr.targets.length > 0) {
            this.targetModel = this.kr.targets[0];
            this.kr.targets=[];
          }
        } else if (this.funcType == OMCONST.MFUNCID.Edit) {
          this.kr = krModel;
        } else {
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
                debugger
                for (const fieldName of this.allowCopyField) {
                  krModel[fieldName] = this.oldKR[fieldName];
                }
                this.kr = krModel;
              }
            });
        }
        this.isAfterRender = true;
      }
    });
  }

  //-----------------------End-------------------------------//

  //-----------------------Base Event------------------------//

  valuePlanTargetChange(evt: any, index:number) {
    if (index !=null && evt?.data!=null) {
      this.kr.targets[index].target=evt.data;
    }
    this.detectorRef.detectChanges();
  }

  valueChange(evt: any) {
    if (evt && evt.field) {
      this.kr[evt.field] = evt.data;
    }
    this.detectorRef.detectChanges();
  }
  //-----------------------End-------------------------------//

  //-----------------------Get Data Func---------------------//

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
    }
    //---------------------------------------
    this.fGroupAddKR = this.form?.formGroup;
    this.fGroupAddKR.patchValue(this.kr);

    //tính lại Targets cho KR
    if (this.kr.targets?.length == 0 || this.kr.targets == null) {
      this.calculatorTarget();
      this.onSaveTarget();
    }
    if (this.funcType == OMCONST.MFUNCID.Add) {
      this.methodAdd(this.kr);
    } else if (this.funcType == OMCONST.MFUNCID.Edit) {
      this.methodEdit(this.kr);
    } else if (this.funcType == OMCONST.MFUNCID.Copy) {
      this.methodCopy(this.kr);
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

  methodCopy(kr: any) {
    this.codxOmService.copyKR(this.kr).subscribe((res: any) => {
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

  //-----------------------Logic Event-----------------------//

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

  calculatorTarget() {
    if (this.kr.target && this.kr.plan) {
      this.kr.targets = [];
      let rowCount = [];
      if (this.kr.plan == OMCONST.VLL.Plan.Month) {
        rowCount = [1,2,3,4,5,6,7,8,9,10,11,12];
      } else if (this.kr.plan == OMCONST.VLL.Plan.Quarter) {
        rowCount = [1,2,3,4];
      }
      rowCount.forEach(item=>{
        let tmpTarget = {...this.targetModel};
        tmpTarget.period = this.kr?.periodID;
        tmpTarget.okrid = this.kr?.recID;
        tmpTarget.target = this.kr.target / rowCount.length;
        tmpTarget.index = item-1;
        tmpTarget.number = item;
        this.kr.targets.push(tmpTarget); 
      })      
    }
    this.detectorRef.detectChanges();
  }

  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//
  openPopupTarget(template: any) {
    if (this.kr.targets.length == 0 || this.kr.targets == null) {
      this.calculatorTarget();
      // if (this.kr.plan == OMCONST.VLL.Plan.Month) {
      //   this.typePlan = OMCONST.VLL.Plan.Month;
      // } else if (this.kr.plan == OMCONST.VLL.Plan.Quarter) {
      //   this.typePlan = OMCONST.VLL.Plan.Quarter;
      // }
    } else {
      // if (this.kr?.plan == OMCONST.VLL.Plan.Month) {
      //   this.typePlan = OMCONST.VLL.Plan.Month;
      //   this.planMonth = [];
      //   Array.from(this.kr.targets).forEach((element: any) => {
      //     this.planMonth.push(element);
      //   });
      // } else if (this.kr?.plan == OMCONST.VLL.Plan.Quarter) {
      //   this.typePlan = OMCONST.VLL.Plan.Quarter;
      //   this.planQuarter = [];
      //   Array.from(this.kr.targets).forEach((element: any) => {
      //     this.planQuarter.push(element);
      //   });
      // }
    }

    if (this.kr?.plan == OMCONST.VLL.Plan.Month) {
      this.dialogTargets = this.callfc.openForm(template, '', 550, 800, null);
    } else if (this.kr?.plan == OMCONST.VLL.Plan.Quarter) {
      this.dialogTargets = this.callfc.openForm(template, '', 550, 420, null);
    }
    this.detectorRef.detectChanges();
  }
  onSaveTarget() {
    
    this.dialogTargets?.close();
    this.dialogTargets = null;
  }

  //-----------------------End-------------------------------//
}
