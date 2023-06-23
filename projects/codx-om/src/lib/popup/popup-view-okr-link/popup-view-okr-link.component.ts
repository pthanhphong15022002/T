import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import {
  Component,
  inject,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxOmService } from '../../codx-om.service';

@Component({
  selector: 'popup-view-okr-link',
  templateUrl: './popup-view-okr-link.component.html',
  styleUrls: ['./popup-view-okr-link.component.scss'],
})
export class PopupViewOKRLinkComponent extends UIComponent {
  dialog:any
  data:any;
  okrGrv: any;
  okrFM: any;
  isAfterRender=false;
  listLink = [];
  constructor(
    private injector: Injector,
    private omService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.dialog=dialogRef;
    this.data= dialogData.data[0];
    this.okrGrv= dialogData.data[1];
    this.okrFM= dialogData.data[2];
  }

  onInit(): void {
    if(this.data){
      this.omService.getOKRHavedLinks(this.data?.recID).subscribe((res:any)=>{
        if(res){
          this.listLink = res;
          
        }
        this.isAfterRender = true;
      })
    }
  }

  onSaveForm() {}
}
