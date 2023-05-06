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
  selector: 'lib-popup-save-version',
  templateUrl: './popup-save-version.component.html',
  styleUrls: ['./popup-save-version.component.scss'],
})
export class PopupSaveVersionComponent extends UIComponent {
  @ViewChild('attachment') attachment: AttachmentComponent;
  headerText: string = 'Lưu phiên bản';
  subHeaderText:string = 'Cho phép lưu phiên bản bộ mục tiêu'
  dialogRef: DialogRef;
  formModel: FormModel;
  data: any;
  funcID: string;

  constructor(
    private injector: Injector,
    private omService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    //this.data = dialogData?.data[0];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef?.formModel;
  }

  onInit(): void {}

  popupUploadFile(event) {
    this.attachment.uploadFile();
  }

  fileAdded(event: any) {
    this.data.attachments = event.data.length;
  }
  fileCount(event: any) {}

  onSaveForm() {}
}
