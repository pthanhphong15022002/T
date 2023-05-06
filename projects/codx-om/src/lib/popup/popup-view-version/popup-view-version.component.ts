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
  headerText: string = 'Phiên bản';
  versions: any = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];

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

  onSaveForm() {}
}
