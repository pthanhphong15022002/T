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
  Util,
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
  ob:any;
  oldOB:any;
  okrPlan: any;
  listShares=[];
  //Chờ c thương thiết lập vll
  //Giả lập vll
  //OM003
  // vll={
  //   datas : [
  //     {
  //       value: "9",
  //       text: "Tất cả",
  //       icon: "All.svg"
  //     },
  //     {
  //       value: "4;P",
  //       text: "Phòng & Quản lý của tôi",
  //       icon: "MyDeptManagement.svg"
  //     },
  //     {
  //       value: "4",
  //       text: "Phòng của tôi",
  //       icon: "MyDept.svg"
  //     },
  //     {
  //       value: "P",
  //       text: "Quản lý của tôi",
  //       icon: "MyManagement.svg"
  //     }
  //   ]
  // }
  okrRecID: any;
  shareModel: any;
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
    this.oldOB = dialogData.data[3];
    this.okrPlan = dialogData.data[4];
    this.dialogRef= dialogRef;
    this.formModel= dialogRef.formModel;
    
  }

  //-----------------------Base Func-------------------------//
  ngAfterViewInit(): void {}

  
  onInit(): void {
    
    if (this.funcType == OMCONST.MFUNCID.Edit) {
      this.okrRecID=this.oldOB.recID;
    }
    else{
      this.okrRecID=null;
    }
    this.codxOmService.getOKRByID(this.okrRecID).subscribe((krModel:any) => {
      if (krModel) {
        if(this.funcType == OMCONST.MFUNCID.Add || this.funcType == OMCONST.MFUNCID.Copy){
          krModel.periodID= this.okrPlan.periodID;          
          krModel.year= this.okrPlan.year;
          krModel.interval= this.okrPlan.interval;
          krModel.transID = this.okrPlan.recID;
        }
        if (this.funcType == OMCONST.MFUNCID.Add) {
          
          this.ob = krModel;          
          if (this.ob.shares && this.ob.shares.length > 0) {
            this.shareModel = this.ob.shares[0];
            this.ob.shares=[];
            this.createShares(this.shareModel)
          }
        } else if (this.funcType == OMCONST.MFUNCID.Edit) {
          this.ob = krModel;
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
                  krModel[fieldName] = this.oldOB[fieldName];
                }                
                this.ob = krModel;
              }
            });
        }
        this.isAfterRender = true;
      }
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
    if (
      this.funcType == OMCONST.MFUNCID.Add ||
      this.funcType == OMCONST.MFUNCID.Copy
    ) {
      this.ob.okrType = OMCONST.VLL.OKRType.Obj;        
        this.OKRLevel();
    }
    else{
      this.ob.edited=true;
    }
    
    //---------------------------------------
    this.fGroupAddOB=this.form?.formGroup;
    this.fGroupAddOB.patchValue(this.ob);
    
    if (this.funcType == OMCONST.MFUNCID.Add || this.funcType == OMCONST.MFUNCID.Copy) {
      this.methodAdd(this.ob,this.listShares);
    } else if(this.funcType == OMCONST.MFUNCID.Edit) {
      this.methodEdit(this.ob,this.listShares);
    }
  }
  methodAdd(ob:any,listShares:any) {
    this.codxOmService.addOB(ob,listShares).subscribe((res: any) => {
      if (res) {
        res.write = true;
        res.delete = true;
        this.afterSave(res);
      }
    });
  }

  methodEdit(ob:any,listShares:any) {
    this.codxOmService.editOB(ob,listShares).subscribe((res: any) => {
      if (res) {
        res.write = true;
        res.delete = true;
        this.afterSave(res);
      }
    });
  }
  afterSave(ob:any) {
    if (this.funcType == OMCONST.MFUNCID.Add || this.funcType == OMCONST.MFUNCID.Copy) {
      this.notificationsService.notifyCode('SYS006');
    } else {
      this.notificationsService.notifyCode('SYS007');
    }
    this.dialogRef && this.dialogRef.close(ob);
  }

  //-----------------------End-------------------------------//

  //-----------------------Logic Event-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Custom Func-----------------------//
  createShares(shareModel){
    if(shareModel!=null){
      let tmpShare = {...shareModel};
      tmpShare.objectType='U';
      tmpShare.permission='1'
      tmpShare.read=1;
      tmpShare.view=1;
      tmpShare.write=1;
      tmpShare.delete=1;
      tmpShare.download=1;
      tmpShare.upload=1;
      tmpShare.share=1;
      tmpShare.autoCreated=1;
      tmpShare.objectID=this.authService.userValue.userID;
      this.listShares.push(tmpShare);      
      tmpShare.objectID=this.okrPlan?.owner;
      this.listShares.push(tmpShare);
    }
  }
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
  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//
  

  //-----------------------End-------------------------------//
}
