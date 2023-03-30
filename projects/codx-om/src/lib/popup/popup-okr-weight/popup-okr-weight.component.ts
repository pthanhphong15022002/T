import { waitForAsync } from '@angular/core/testing';
import { OKRs } from '../../model/okr.model';
import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';

import {
  AuthService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxOmService } from '../../codx-om.service';

import { OMCONST } from '../../codx-om.constant';

@Component({
  selector: 'popup-okr-weight',
  templateUrl: 'popup-okr-weight.component.html',
  styleUrls: ['popup-okr-weight.component.scss'],
})
export class PopupOKRWeightComponent
  extends UIComponent
  implements AfterViewInit
{
  views: Array<ViewModel> | any = [];
  @ViewChild('editWeightTmp') editWeightTmp: TemplateRef<any>;
  krType = OMCONST.VLL.OKRType.KResult;
  obType = OMCONST.VLL.OKRType.Obj;
  skrType = OMCONST.VLL.OKRType.SKResult;
  dialogRef: DialogRef;
  formModel: FormModel;
  headerText: string;
  dataOKR: any;
  totalProgress = 0;
  listWeight = [];
  okrChild: any;
  popupTitle = '';
  subTitle = '';
  oldData: any;
  editWeight: any;
  totalWeight: number;
  okrVll: any;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.dialogRef = dialogRef;
    this.oldData = dialogData.data[0];
    this.editWeight = dialogData.data[1];
    this.popupTitle = dialogData.data[2];
    this.subTitle = dialogData.data[3];
    this.okrVll = dialogData.data[4];
  }

  //-----------------------Base Func-------------------------//
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelRightRef: this.editWeightTmp,
          contextMenu: '',
        },
      },
    ];
  }

  onInit(): void {
    if (this.editWeight == OMCONST.VLL.OKRType.KResult ||this.editWeight == OMCONST.VLL.OKRType.SKResult) {
      this.getObjectData();
    }
    if (this.editWeight == OMCONST.VLL.OKRType.Obj) {
      this.getdataOKRData();
    }
  }

  //-----------------------End-------------------------------//

  //-----------------------Base Event------------------------//
  click(event: any) {
    switch (event) {
    }
  }
  valueChange(evt: any) {
    if (evt.data != null && evt.field != null) {      
      this.okrChild[evt.field].weight = parseFloat(evt.data);
      this.okrChild[evt.field].edited=true;
      this.totalProgress=0;
      let weightNotChanged=[];
      let totalWeightEdited=0;
      for(let i=0;i<this.okrChild.length;i++){        
        if(this.okrChild[i]?.edited!=true){
          weightNotChanged.push(i);
        }
        else{
          totalWeightEdited+=this.okrChild[i]?.weight;
        }
      }
      let avgWeight=(1-totalWeightEdited)/weightNotChanged.length;
      for(let i=0;i<this.okrChild.length;i++){        
        if(this.okrChild[i]?.edited!=true){
          this.okrChild[i].weight=avgWeight;
        }
      }      
      for(let i=0;i<this.okrChild.length;i++){        
        
        this.totalProgress += this.okrChild[i].weight*this.okrChild[i].progress;
      }  
      this.detectorRef.detectChanges();
    }
  }

  //-----------------------End-------------------------------//

  //-----------------------Get Data Func---------------------//
  getObjectData(){
    this.codxOmService
        .getObjectAndKRChild(this.oldData?.recID)
        .subscribe((res: any) => {
          if (res) {
            this.dataOKR = res;
            this.okrChild = res.items;
            this.totalProgress = 0;
            Array.from(this.okrChild).forEach((kr: any) => {
              this.totalProgress += kr?.weight*kr?.progress;
            });
            this.detectorRef.detectChanges();
          }
        });
  }
  getdataOKRData(){
    this.codxOmService
        .getOKRPlanAndOChild(this.oldData?.recID)
        .subscribe((res: any) => {
          if (res) {
            this.dataOKR = res;
            this.okrChild = res.items;
            this.totalProgress = this.dataOKR.progress;
            this.totalProgress = 0;
            Array.from(this.okrChild).forEach((ob: any) => {
              this.totalProgress += ob?.weight * ob?.progress;
            });
            this.detectorRef.detectChanges();
          }
        });
  }
  //-----------------------End-------------------------------//

  //-----------------------Validate Func---------------------//

  //-----------------------End-------------------------------//

  //-----------------------Logic Func------------------------//

  onSaveForm() {
    if(this.okrChild){
      this.totalWeight = 0;
      this.okrChild.forEach((okr)=>{
        if(okr.weight!=null){
          this.totalWeight = this.totalWeight+ okr.weight;
          this.detectorRef.detectChanges();
        }
      });
      if(this.totalWeight!=1){
        this.notificationsService.notify("Tổng trọng số phải bằng 1","2");//OM_WAIT đợi messageCode
        return;
      }
      this.codxOmService
      .editOKRWeight(this.dataOKR?.recID, this.editWeight, this.okrChild)
      .subscribe((res: any) => {
        if (res) {
          let x = res;          
          this.notificationsService.notifyCode('SYS034'); 
          this.dialogRef && this.dialogRef.close();
        }
      });
    }
    
  }
  //-----------------------End-------------------------------//

  //-----------------------Logic Event-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Custom Func-----------------------//
  cancel(){
    this.dialogRef.close();
  }
  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//

  //-----------------------End-------------------------------//
}
