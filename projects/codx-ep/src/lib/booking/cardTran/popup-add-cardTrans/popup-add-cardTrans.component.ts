import { Util } from 'codx-core';
import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  AuthService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxEpService } from '../../../codx-ep.service';
import { EPCONST } from '../../../codx-ep.constant';

@Component({
  selector: 'popup-add-cardTrans',
  templateUrl: 'popup-add-cardTrans.component.html',
  styleUrls: ['popup-add-cardTrans.component.scss'],
})
export class PopupAddCardTransComponent extends UIComponent {
  @ViewChild('form') form: any;
  formModel: FormModel;
  dialogRef: DialogRef;
  isAfterRender = false;
  returnData: any;
  data: any;
  headerText = '';
  fGroup: any;
  grView: any;
  getCardFuncID=EPCONST.FUNCID.CA_Get;
  returnCardFuncID=EPCONST.FUNCID.CA_Return;
  disableEdit=false;
  constructor(
    injector: Injector,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogData?.data[0];
    this.headerText = dialogData?.data[2];
    this.funcID = dialogData?.data[1];
    this.formModel = dialogData?.data[3];
    this.dialogRef = dialogRef;
    this.dialogRef.formModel = this.formModel;
    this.data.transDate=new Date();
  }

  ngAfterViewInit(): void {}

  onInit(): void {
    if (this.formModel == null) {
      this.codxEpService
        .getFormModel(this.funcID)
        .then((fm) => {
          if (fm) {
            this.formModel = fm;
            this.dialogRef.formModel = this.formModel;
            this.getCache();                                  
          }
        });
    } else {
      this.getCache();      
    }
  }
  getCache(){
    this.cache.gridViewSetup(this.formModel?.formName,this.formModel?.gridViewName).subscribe(grv=>{
      if(grv){
        this.grView=Util.camelizekeyObj(grv);                
        this.isAfterRender = true;
      }
    })
  }
  onSaveForm() {
    if (this.funcID == EPCONST.FUNCID.CA_Get) {
      this.data.transType = '1'; //Cấp thẻ
    } else {
      this.data.transType = '2'; //Trả thẻ
    }
    this.data.resourceType = '2';
    this.data.createdBy = this.authService?.userValue?.userID,
    this.form.formGroup.patchValue(this.data);
    if (this.form.formGroup.invalid == true) {
      this.codxEpService.notifyInvalid(this.form.formGroup, this.formModel);
      return;
    }
    this.codxEpService.createResourceTrans(this.data).subscribe((res) => {
      if (res) {
        this.notificationsService.notifyCode('SYS034');
        this.dialogRef && this.dialogRef.close(res);
      }
    });
  }
  valueChange(evt:any){
    if(evt!=null){
      this.data[evt?.field]=evt?.data;
      this.detectorRef.detectChanges();
    }
  }
  transIDChange(evt:any){
    if(evt!=null && evt?.data!=''){
      this.data.transID=evt?.data;
      this.detectorRef.detectChanges();
      // if(this.funcID==this.returnCardFuncID){
      //   this.codxEpService.getCardTranInfo(this.data.transID).subscribe((res:any)=>{
      //     if(res){
      //       this.data.resourceID=res?.resourceID;
      //       this.disableEdit=true;
      //       this.detectorRef.detectChanges();
      //     }
      //   })
      // }      
    }
  }
}
