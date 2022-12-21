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

import { EditWeight } from '../../model/okr.model';
import { PopupCheckInComponent } from '../popup-check-in/popup-check-in.component';
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
  @ViewChild('checkin') checkin: TemplateRef<any>;
  @ViewChild('alignKR') alignKR: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;
  krType = OMCONST.VLL.OKRType.KResult;
  oType = OMCONST.VLL.OKRType.Obj;
  dialogRef: DialogRef;
  formModel: FormModel;
  headerText: string;
  dataOKR: any;
  totalProgress = 0;
  listWeight = [];
  okrChild: any;
  popupTitle = '';
  subTitle = '';
  recID: any;
  editWeight: any;
  totalWeight: number;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.headerText = 'Thay đổi trọng số KR'; //dialogData?.data[2];
    this.dialogRef = dialogRef;
    this.recID = dialogData.data[0];
    this.editWeight = dialogData.data[1];
    this.popupTitle = dialogData.data[2];
    this.subTitle = dialogData.data[3];
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
          panelRightRef: this.alignKR,
          contextMenu: '',
        },
      },
    ];
  }

  onInit(): void {
    if (this.editWeight == OMCONST.VLL.OKRType.KResult) {
      this.getObjectData();
    }
    if (this.editWeight == OMCONST.VLL.OKRType.Obj) {
      this.getOKRPlanData();
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
      this.listWeight[evt.field].weight = parseFloat(evt.data);
      this.listWeight[evt.field].pbyw =
        +(
          this.listWeight[evt.field].weight *
          this.listWeight[evt.field].progress
        ).toFixed(2) * 1;
      this.totalProgress = 0;
      this.listWeight.forEach((item) => {
        this.totalProgress += item.pbyw;
      });
      this.detectorRef.detectChanges();
    }
  }

  //-----------------------End-------------------------------//

  //-----------------------Get Data Func---------------------//
  getObjectData(){
    this.codxOmService
        .getObjectAndKRChild(this.recID)
        .subscribe((res: any) => {
          if (res) {
            this.dataOKR = res;
            this.okrChild = res.child;
            this.totalProgress = this.dataOKR.progress;
            let tempArr = Array.from(this.okrChild);
            tempArr.forEach((item: any) => {
              let newWeight = new EditWeight();
              newWeight.recID = item.recID;
              newWeight.weight = item.weight;
              newWeight.progress = item.progress;
              newWeight.pbyw = +(item.weight * item.progress).toFixed(2) * 1;
              this.listWeight.push(newWeight);
            });
            this.detectorRef.detectChanges();
          }
        });
  }
  getOKRPlanData(){
    this.codxOmService
        .getOKRPlandAndOChild(this.recID)
        .subscribe((res: any) => {
          if (res) {
            this.dataOKR = res;
            this.okrChild = res.child;
            this.totalProgress = this.dataOKR.progress;
            let tempArr = Array.from(this.okrChild);
            tempArr.forEach((item: any) => {
              let newWeight = new EditWeight();
              newWeight.recID = item.recID;
              newWeight.weight = item.weight;
              newWeight.progress = item.progress;
              newWeight.pbyw = +(item.weight * item.progress).toFixed(2) * 1;
              this.listWeight.push(newWeight);
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
    if(this.listWeight){
      this.totalWeight = 0;
      this.listWeight.forEach((okr)=>{
        if(okr.weight!=null){
          this.totalWeight = this.totalWeight+ okr.weight;
          this.detectorRef.detectChanges();
        }
        
        else{   
          okr.weight=0;       
          //this.notificationsService.notify("Trọng số không được bỏ trống","2");         
          return;
        }
      });
      if(this.totalWeight!=1){
        this.notificationsService.notify("Tổng trọng số phải bằng 1","2");
        return;
      }
    }
    this.codxOmService
      .editOKRWeight(this.dataOKR.recID, this.editWeight , this.listWeight)
      .subscribe((res: any) => {
        if (res) {
          let x = res;
          this.dialogRef && this.dialogRef.close();
        }
      });
  }
  //-----------------------End-------------------------------//

  //-----------------------Logic Event-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Custom Func-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//

  //-----------------------End-------------------------------//
}
