import { OMCONST } from '../../codx-om.constant';
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

//import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-ob',
  templateUrl: 'popup-add-ob.component.html',
  styleUrls: ['popup-add-ob.component.scss'],
})
export class PopupAddOBComponent extends UIComponent {
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() kr: any;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @Output() loadData = new EventEmitter();
  @ViewChild('form') form :CodxFormComponent;

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
  
  ops = ['m','q','y'];
  formModel: FormModel;
  dialogRef: DialogRef;
  isAfterRender: boolean;
  fGroupAddOB: FormGroup;
  oParentID: any;
  dialogTargets: DialogRef;
  funcID: any;
  tempTarget: any;
  funcType:any;
  isSubKR: boolean;
  ob: any;
  okrPlan: any;//Chờ c thương thiết lập vll
  //Giả lập vll
  //OM003
  vll={
    datas : [
      {
        value: "9",
        text: "Tất cả",
        icon: "All.svg"
      },
      {
        value: "4;P",
        text: "Phòng & Quản lý của tôi",
        icon: "MyDeptManagement.svg"
      },
      {
        value: "4",
        text: "Phòng của tôi",
        icon: "MyDept.svg"
      },
      {
        value: "P",
        text: "Quản lý của tôi",
        icon: "MyManagement.svg"
      }
    ]
  }
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);  
    this.funcID= dialogData.data[0]
    this.funcType = dialogData?.data[1];  
    this.headerText = dialogData?.data[2];
    this.ob = dialogData.data[3];
    this.okrPlan = dialogData.data[4];
    this.dialogRef= dialogRef;
    this.formModel= dialogRef.formModel;
    
  }

  //-----------------------Base Func-------------------------//
  ngAfterViewInit(): void {}

  onInit(): void {
    
    this.initForm();
  }

  initForm() {
    this.codxOmService
      .getFormGroup(this.formModel?.formName, this.formModel?.gridViewName)
      .then((item) => {
        this.fGroupAddOB = item;
        if (this.funcType == OMCONST.MFUNCID.Add) {
          
          this.ob = this.fGroupAddOB.value;
        }
        if (this.funcType == OMCONST.MFUNCID.Copy) {
          let tmpKR = this.fGroupAddOB.value;
          this.allowCopyField.forEach(field=>{
            tmpKR[field]=this.ob[field];
          });
          this.ob=null;
          this.ob=tmpKR;
        }
        this.isAfterRender = true;
      });
  }

  //-----------------------End-------------------------------//

  //-----------------------Base Event------------------------//

  

  valueChange(evt: any) {
    if (evt && evt.field) {
      this.ob[evt.field]=evt.data;      
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
    let itemData = this.fGroupAddOB.value;
    option.methodName = '';
    option.data = [itemData, this.funcType];
    return true;
  }

  onSaveForm() {
    //xóa khi đã lấy được model chuẩn từ setting 
    this.ob.status='1';
    this.ob.approveStatus='1';
    this.ob.approveControl='1';
    this.ob.okrType=this.isSubKR? OMCONST.VLL.OKRType.SKResult: OMCONST.VLL.OKRType.KResult;
    this.ob.recID= this.ob.parentID;
    this.ob.transID= this.ob.parentID;
    //---------------------------------------
    this.fGroupAddOB=this.form?.formGroup;
    this.fGroupAddOB.patchValue(this.ob);
    
    if (this.funcType == OMCONST.MFUNCID.Add) {
      this.methodAdd(this.ob);
    } else if(this.funcType == OMCONST.MFUNCID.Edit) {
      this.methodEdit(this.ob);
    } else if(this.funcType == OMCONST.MFUNCID.Copy) {
      this.methodCopy(this.ob);
    }
  }
  methodAdd(kr: any) {
    this.codxOmService.addKR(this.ob).subscribe((res: any) => {
      if (res) {
        this.afterSave(res);
      }
    });
  }

  methodCopy(kr: any) {
    this.codxOmService.copyKR(this.ob).subscribe((res: any) => {
      if (res) {
        this.afterSave(res);
      }
    });
  }

  methodEdit(kr: any) {
    this.codxOmService.editKR(this.ob).subscribe((res: any) => {
      if (res) {
        this.afterSave(res);
      }
    });
  }
  afterSave(kr: any) {
    if (this.funcType == OMCONST.MFUNCID.Add) {
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
        this.ob.okrLevel = OMCONST.VLL.OKRLevel.COMP;
        break;
      case OMCONST.FUNCID.DEPT:
        this.ob.okrLevel = OMCONST.VLL.OKRLevel.DEPT;
        break;
      case OMCONST.FUNCID.ORG:
        this.ob.okrLevel = OMCONST.VLL.OKRLevel.ORG;
        break;
      case OMCONST.FUNCID.PERS:
        this.ob.okrLevel = OMCONST.VLL.OKRLevel.PERS;
        break;
    }
    this.detectorRef.detectChanges();
  }
  formatInterval(val:any)
  {
    if(val) return val.toLowerCase();
    return ""
  }
  changeCalendar(e:any)
  {
    this.ob.periodID = e?.text;
  }
  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//
  

  //-----------------------End-------------------------------//
}
