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
  AuthStore,
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';
import { CodxOmService } from '../../codx-om.service';

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
  @ViewChild('form') form: CodxFormComponent;

  headerText = '';
  allowCopyField = [];
  formModel: FormModel;
  dialogRef: DialogRef;
  isAfterRender: boolean;
  fGroupAddOB: FormGroup;
  oParentID: any;
  dialogTargets: DialogRef;
  funcID: any;
  tempTarget: any;
  funcType: any;
  isSubKR: boolean;
  ob: any;
  oldOB: any;
  okrPlan: any;
  onSaving = false;
  listShares = [];
  okrRecID: any;
  shareModel: any;
  curUser: any;
  groupModel: any;
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
    this.oldOB = dialogData.data[3];
    this.okrPlan = dialogData.data[4];
    this.groupModel = dialogData.data[5];

    this.dialogRef = dialogRef;
    this.formModel = dialogRef.formModel;

    this.curUser = authStore.get();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  ngAfterViewInit(): void {}

  onInit(): void {
    this.getCurrentOB();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  // getCacheData(){

  // }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  getCurrentOB() {
    if (this.funcType == OMCONST.MFUNCID.Add) {
      this.afterOpenAddForm();
      this.isAfterRender = true;
    } else {
      this.codxOmService.getOKRByID(this.oldOB.recID).subscribe((obModel) => {
        if (obModel) {
          if (this.funcType == OMCONST.MFUNCID.Edit) {
            this.afterOpenEditForm(obModel);
          } else if (this.funcType == OMCONST.MFUNCID.Copy) {
            this.afterOpenCopyForm(obModel);
          }
          this.isAfterRender = true;
        }
      });
    }
  }

  afterOpenAddForm() {
    this.ob = { ...this.groupModel?.obModel };
    this.ob.periodID = this.okrPlan.periodID;
    this.ob.year = this.okrPlan.year;
    this.ob.interval = this.okrPlan.interval;
    this.ob.transID = this.okrPlan.recID;
    this.ob.parentID = this.okrPlan.recID;
  }

  afterOpenEditForm(obModel: any) {
    this.ob = obModel;
  }

  afterOpenCopyForm(obModel: any) {
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
            this.ob[fieldName] = obModel[fieldName];
          }
        }
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  valueChange(evt: any) {
    if (evt && evt.field) {
      this.ob[evt.field] = evt?.data;
      if(evt?.field =='okrGroupID'){
        let cbbGr = evt?.component?.dataService?.data.filter(x=>x.RecID ==evt?.data);
        if(cbbGr?.length>0){
          this.ob.bscType = cbbGr[0]?.BSCType;
        }
      }
    }
    this.detectorRef.detectChanges();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  beforeSave(option: RequestOption) {
    let itemData = this.ob;
    option.methodName = '';
    option.data = [itemData, this.funcType];
    return true;
  }

  onSaveForm() {
    this.onSaving = true;
    if (
      this.funcType == OMCONST.MFUNCID.Add ||
      this.funcType == OMCONST.MFUNCID.Copy
    ) {
      this.ob.okrType = OMCONST.VLL.OKRType.Obj;
      this.OKRLevel();
    } else {
      this.ob.edited = true;
    }

    //---------------------------------------
    this.fGroupAddOB = this.form?.formGroup;
    this.ob.buid = this.ob.buid ?? this.curUser?.buid;
    this.fGroupAddOB.patchValue(this.ob);
    // if (this.fGroupAddOB.invalid == true) {
    //   this.codxOmService.notifyInvalid(
    //     this.fGroupAddOB,
    //     this.formModel
    //   );
    //   return;
    // }
    if (
      this.funcType == OMCONST.MFUNCID.Add ||
      this.funcType == OMCONST.MFUNCID.Copy
    ) {
      this.methodAdd(this.ob);
    } else if (this.funcType == OMCONST.MFUNCID.Edit) {
      this.methodEdit(this.ob);
    }
  }
  methodAdd(ob: any) {
    this.codxOmService.addOB(ob).subscribe((res: any) => {
      if (res) {
        res.write = true;
        res.delete = true;
        this.afterSave(res);
      } else {
        this.onSaving = false;
        return;
      }
    });
  }

  methodEdit(ob: any) {
    this.codxOmService.editOB(ob).subscribe((res: any) => {
      if (res) {
        res.write = true;
        res.delete = true;
        this.afterSave(res);
      } else {
        this.onSaving = false;
        return;
      }
    });
  }
  afterSave(ob: any) {
    if (
      this.funcType == OMCONST.MFUNCID.Add ||
      this.funcType == OMCONST.MFUNCID.Copy
    ) {
      this.notificationsService.notifyCode('SYS006');
    } else {
      this.notificationsService.notifyCode('SYS007');
    }
    this.dialogRef && this.dialogRef.close(ob);
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//

  createShares(shareModel) {
    if (shareModel != null) {
      let tmpShare = { ...shareModel };
      tmpShare.objectType = 'U';
      tmpShare.permission = '1';
      tmpShare.read = 1;
      tmpShare.view = 1;
      tmpShare.write = 1;
      tmpShare.delete = 1;
      tmpShare.download = 1;
      tmpShare.upload = 1;
      tmpShare.share = 1;
      tmpShare.autoCreated = 1;
      tmpShare.objectID = this.authService.userValue.userID;
      this.listShares.push(tmpShare);
      if (this.okrPlan?.owner != this.authService.userValue.userID) {
        tmpShare.objectID = this.okrPlan?.owner;
        this.listShares.push(tmpShare);
      }
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
  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
}
