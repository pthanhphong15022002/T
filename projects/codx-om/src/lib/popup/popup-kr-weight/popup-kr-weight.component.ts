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

@Component({
  selector: 'popup-kr-weight',
  templateUrl: 'popup-kr-weight.component.html',
  styleUrls: ['popup-kr-weight.component.scss'],
})
export class PopupKRWeightComponent
  extends UIComponent
  implements AfterViewInit
{
  views: Array<ViewModel> | any = [];
  @ViewChild('checkin') checkin: TemplateRef<any>;
  @ViewChild('alignKR') alignKR: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;

  dialogRef: DialogRef;
  formModel: FormModel;
  headerText: string;
  dataOKR: any;
  listWeight = [];
  pbyw = [];
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
    this.dataOKR = dialogData.data[0];
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
    if (this.dataOKR.child) {
      let tempArr = Array.from(this.dataOKR.child);
      tempArr.forEach((item: any) => {
        if (item.weight && item.progress) {
          let pw = item.weight * item.progress;
          this.pbyw.push(+pw.toFixed(2) * 1);
          let newWeight = new EditWeight();
          newWeight.recID = item.recID;
          newWeight.weight = item.weight;
          this.listWeight.push(newWeight);
        } else {
          this.pbyw.push(0);
        }
      });
      this.detectorRef.detectChanges();
    }
  }

  //-----------------------End-------------------------------//

  //-----------------------Base Event------------------------//
  click(event: any) {
    switch (event) {
    }
  }
  valueChange(evt) {}

  //-----------------------End-------------------------------//

  //-----------------------Get Data Func---------------------//

  //-----------------------End-------------------------------//

  //-----------------------Validate Func---------------------//

  //-----------------------End-------------------------------//

  //-----------------------Logic Func------------------------//

  onSaveForm() {}
  //-----------------------End-------------------------------//

  //-----------------------Logic Event-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Custom Func-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//

  //-----------------------End-------------------------------//
}
