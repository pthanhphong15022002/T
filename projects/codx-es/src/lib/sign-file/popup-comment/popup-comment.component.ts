import {
  Component,
  inject,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'lib-popup-comment',
  templateUrl: './popup-comment.component.html',
  styleUrls: ['./popup-comment.component.scss'],
})
export class PopupCommentComponent extends UIComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  approveControl: string; //'1':Ko comment;'2':ko bat buoc; '3': bat buoc
  title: string = '';
  subTitle: string = '';
  result = { comment: '', reasonID: '' };
  grvSetup: any = {};
  controlName: string;
  mode;
  data;
  dialog;
  user;
  formModel: FormModel;
  isAfterRender: boolean = false;
  constructor(
    private inject: Injector,
    private authStore: AuthStore,
    private notify: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.data = dt.data;
    this.mode = this.data.mode;
    this.formModel = this.data.formModel;
    this.user = this.authStore.get();
    this.cache
      .gridViewSetup(
        this.data.formModel.formName,
        this.data.formModel.gridViewName
      )
      .subscribe((grv) => {
        if (grv) {
          this.grvSetup = grv;
          this.isAfterRender = true;
        }
      });
  }

  onInit(): void {
    this.title = this.data.title;
    this.subTitle = this.data.subTitle;
    this.controlName = this.mode != 2 ? 'RejectControl' : 'RedoControl';
  }

  onSaveForm() {
    if (this.approveControl == '3' && this.result.comment == '') {
      let headerText = this.grvSetup['Comment']?.headerText ?? 'Comment';
      this.notify.notifyCode('SYS009', 0, '"' + headerText + '"');
      return;
    }

    this.dialog.close(this.result);
  }

  valueChange(e) {
    if (e.field && e.data) {
      this.result[e.field] = e.data;
    }
  }
}
