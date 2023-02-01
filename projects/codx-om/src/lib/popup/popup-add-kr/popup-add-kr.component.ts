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

//import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-kr',
  templateUrl: 'popup-add-kr.component.html',
  styleUrls: ['popup-add-kr.component.scss'],
})
export class PopupAddKRComponent extends UIComponent {
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() kr: any;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @Output() loadData = new EventEmitter();

  headerText = '';
  subHeaderText = '';
  month = 'Tháng';
  quarter = 'Quý';

  months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  quarters = ['1', '2', '3', '4'];
  quartersMonth = ['1', '4', '7', '10'];
  typePlan = '';
  planMonth = [];
  planQuarter = [];
  allowCopyField=[];
  listTarget = [];
  formModel: FormModel;
  dialogRef: DialogRef;
  isAfterRender: boolean;
  fGroupAddKR: FormGroup;
  o: any;
  oParentID: any;
  dialogTargets: DialogRef;
  funcID: any;
  tempTarget: any;
  funcType:any;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);   
    
    this.funcType = dialogData?.data[0];  
    this.headerText = dialogData?.data[1];
    this.o = dialogData.data[2];
    this.kr = dialogData.data[3];
    this.dialogRef= dialogRef;
    this.formModel= dialogRef.formModel;
    if (this.funcType == OMCONST.MFUNCID.Edit || this.funcType == OMCONST.MFUNCID.Copy ) {
      this.typePlan = this.kr.plan;
    }
  }

  //-----------------------Base Func-------------------------//
  ngAfterViewInit(): void {}

  onInit(): void {
    this.cache.gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
    .subscribe((gv: any) => {      
      if (gv) {
        for (const key in gv) {
          const element = gv[key];
          if(element.allowCopy){
            element.fieldName =element.fieldName.charAt(0).toLowerCase() + element.fieldName.slice(1);
            this.allowCopyField.push(element.fieldName);
          }
        }
      }
    });
    this.initForm();
  }

  initForm() {
    this.codxOmService
      .getFormGroup(this.formModel?.formName, this.formModel?.gridViewName)
      .then((item) => {
        this.fGroupAddKR = item;
        if (this.funcType == OMCONST.MFUNCID.Add) {
          
          this.kr = this.fGroupAddKR.value;
        }
        if (this.funcType == OMCONST.MFUNCID.Copy) {
          let tmpKR = this.fGroupAddKR.value;
          this.allowCopyField.forEach(field=>{
            tmpKR[field]=this.kr[field];
          });
          this.kr=null;
          this.kr=tmpKR;
        }
        this.isAfterRender = true;
      });
  }

  //-----------------------End-------------------------------//

  //-----------------------Base Event------------------------//

  valuePlanChange(evt: any) {
    if (evt && evt.field) {
      if (this.kr.plan == OMCONST.VLL.Plan.Month) {
        this.planMonth[evt.field] = evt.data;
      }
      if (this.kr.plan == OMCONST.VLL.Plan.Month) {
        this.planQuarter[evt.field] = evt.data;
      }
    }
    this.detectorRef.detectChanges();
  }

  valueChange(evt: any) {
    if (evt && evt.field) {
      this.kr[evt.field]=evt.data;      
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
    this.kr.status='1';
    this.kr.approveStatus='1';
    this.kr.approveControl='1';
    this.kr.okrType=OMCONST.VLL.OKRType.KResult;
    this.kr.recID= this.kr.parentID;
    this.kr.transID= this.kr.parentID;
    //---------------------------------------
    this.OKRLevel();
    this.fGroupAddKR.patchValue(this.kr);

    //tính lại Targets cho KR
    if (this.kr.targets?.length == 0 || this.kr.targets == null) {
      this.calculatorTarget();
      this.onSaveTarget();
    }
    if (this.funcType == OMCONST.MFUNCID.Add) {
      this.methodAdd(this.kr);
    } else if(this.funcType == OMCONST.MFUNCID.Edit) {
      this.methodEdit(this.kr);
    } else if(this.funcType == OMCONST.MFUNCID.Copy) {
      this.methodCopy(this.kr);
    }
  }
  methodAdd(kr: any) {
    this.codxOmService.addKR(this.kr).subscribe((res: any) => {
      if (res) {
        var x = res;
        this.afterSave(res);
      }
    });
  }

  methodCopy(kr: any) {
    this.codxOmService.copyKR(this.kr).subscribe((res: any) => {
      if (res) {
        var x = res;
        this.afterSave(res);
      }
    });
  }

  methodEdit(kr: any) {
    this.codxOmService.editKR(this.kr).subscribe((res: any) => {
      if (res) {
        var x = res;
        this.afterSave(res);
      }
    });
  }
  afterSave(kr: any) {
    if (this.isAdd) {
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
      this.planMonth = [];
      this.planQuarter = [];
      if (this.kr.plan == OMCONST.VLL.Plan.Month) {
        for (let i = 1; i <= 12; i++) {
          this.planMonth.push(this.kr.target / 12);
        }
      } else if (this.kr.plan == OMCONST.VLL.Plan.Quarter) {
        for (let i = 1; i <= 4; i++) {
          this.planQuarter.push(this.kr.target / 4);
        }
      }
    }
    this.detectorRef.detectChanges();
  }

  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//
  openPopupTarget(template: any) {
    if (
      this.kr.targets?.length == 0 ||
      this.kr.targets == null ||
      this.kr.plan != this.typePlan
    ) {
      this.calculatorTarget();
      if (this.kr.plan == OMCONST.VLL.Plan.Month) {
        this.typePlan = OMCONST.VLL.Plan.Month;
      } else if (this.kr.plan == OMCONST.VLL.Plan.Quarter) {
        this.typePlan = OMCONST.VLL.Plan.Quarter;
      }
    } else {
      if (this.kr?.plan == OMCONST.VLL.Plan.Month) {
        this.typePlan = OMCONST.VLL.Plan.Month;
        this.planMonth = [];
        Array.from(this.kr.targets).forEach((element: any) => {
          this.planMonth.push(element.target);
        });
      } else if (this.kr?.plan == OMCONST.VLL.Plan.Quarter) {
        this.typePlan = OMCONST.VLL.Plan.Quarter;
        this.planQuarter = [];
        Array.from(this.kr.targets).forEach((element: any) => {
          this.planQuarter.push(element.target);
        });
      }
    }
    

    if (this.kr?.plan == OMCONST.VLL.Plan.Month) {
      this.dialogTargets = this.callfc.openForm(template, '', 550, 800, null);
    } else if (this.kr?.plan == OMCONST.VLL.Plan.Quarter) {
      this.dialogTargets = this.callfc.openForm(template, '', 550, 420, null);
    }
    this.detectorRef.detectChanges();
  }
  onSaveTarget() {
    this.kr.targets = [];
    let krTarget = [];
    let type = '';
    if (this.kr.plan == OMCONST.VLL.Plan.Month) {
      type = OMCONST.VLL.Plan.Month;
      this.planMonth.forEach((item) => {
        krTarget.push(item);
      });
    } else if (this.kr.plan == OMCONST.VLL.Plan.Quarter) {
      type = OMCONST.VLL.Plan.Quarter;
      this.planQuarter.forEach((item) => {
        krTarget.push(item);
      });
    }
    krTarget.forEach((item) => {
      let tempTarget = new Targets();
      tempTarget.period = this.kr?.periodID;
      //tempTarget.oKRID = this.kr?.recID !=null? this.kr?.recID :this.o?.recID;
      tempTarget.planDate = new Date(); //OM_WAITING: sửa lại thành thời gian tương ứng
      tempTarget.target = item;
      tempTarget.createdOn = new Date();
      this.kr.targets.push(tempTarget);
    });
    this.dialogTargets.close();
    this.dialogTargets = null;
  }

  //-----------------------End-------------------------------//
}
