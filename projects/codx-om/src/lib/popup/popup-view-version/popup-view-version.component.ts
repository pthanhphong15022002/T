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
  selector: 'lib-popup-view-version',
  templateUrl: './popup-view-version.component.html',
  styleUrls: ['./popup-view-version.component.scss'],
})
export class PopupViewVersionComponent extends UIComponent {
  @ViewChild('attachment') attachment: AttachmentComponent;
  headerText='';

  dialogRef: DialogRef;
  formModel: FormModel;
  funcID: string;
  dataPlan: any;
  okrFM: any;
  versions =[];
  isAfterRender: boolean;
  okrGrv: any;
  constructor(
    private injector: Injector,
    private omService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.dataPlan = dialogData?.data[0];
    this.okrFM = dialogData?.data[1];
    this.okrGrv = dialogData?.data[2];
    this.headerText = dialogData?.data[3];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef?.formModel;

  }

  onInit(): void {
    this.getData();
  }

  getData(){
    this.omService.getOKRPlansByID(this.dataPlan?.recID).subscribe(res=>{
      if(res){
        this.dataPlan=res; 
        this.versions = this.dataPlan?.versions?.reverse();
        this.isAfterRender=true;
      }
    })
  }
  onSaveForm() {}
}
