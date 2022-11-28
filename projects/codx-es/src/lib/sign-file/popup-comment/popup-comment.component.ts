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
  data;
  dialog;
  user;

  constructor(
    private inject: Injector,
    private authStore: AuthStore,
    private notify: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    super(inject);
    this.dialog = dialog;
    this.data = dt.data;
    this.user = this.authStore.get();
    this.cache
      .gridViewSetup(
        this.data.formModel.formName,
        this.data.formModel.gridViewName
      )
      .subscribe((grv) => {
        if (grv) this.grvSetup = grv;
      });
  }

  onInit(): void {
    this.title = this.data.title;
    this.subTitle = this.data.subTitle;
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
    if (e.field == 'comment') {
      this.result.comment = e.data;
    }
  }
}
