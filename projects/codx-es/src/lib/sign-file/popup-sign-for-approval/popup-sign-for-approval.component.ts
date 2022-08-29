import {
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PdfViewerComponent } from '@syncfusion/ej2-angular-pdfviewer';
import {
  UIComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { threadId } from 'worker_threads';
import { CodxEsService } from '../../codx-es.service';
import { PdfViewComponent } from '../pdf-view/pdf-view.component';
import { PopupADRComponent } from '../popup-adr/popup-adr.component';

@Component({
  selector: 'lib-popup-sign-for-approval',
  templateUrl: './popup-sign-for-approval.component.html',
  styleUrls: ['./popup-sign-for-approval.component.scss'],
})
export class PopupSignForApprovalComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private esService: CodxEsService,
    private notify: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    debugger;
    this.dialog = dialog;
    this.data = dt.data;
  }

  @ViewChild('pdfView') pdfView: PdfViewComponent;

  isApprover = true;
  dialog;
  data: any = {};
  // data = {
  //   funcID: 'EST021',
  //   recID: 'fda05e5c-24e7-11ed-a51b-d89ef34bb550',
  // };

  formModel: FormModel;
  dialogSignFile: FormGroup;

  recID = '';
  // recID = '';
  funcID;
  cbxName;

  canOpenSubPopup;

  onInit(): void {
    this.canOpenSubPopup = false;
    this.funcID = this.data ? this.data.funcID : 'EST01';
    this.recID = this.data
      ? this.data.recID
      : '8d52a9dc-24ed-11ed-9451-00155d035517';
    this.cache.functionList(this.funcID).subscribe((res) => {
      this.formModel = res;
      this.esService
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((res) => {
          if (res) {
            this.dialogSignFile = res;
            this.detectorRef.detectChanges();
          }
        });
    });
  }

  clickOpenPopupADR(mode) {
    let title = '';
    let subTitle = 'Comment khi duyệt';
    switch (mode) {
      case 1:
        title = 'Duyệt';
        break;
      case 2:
        title = 'Từ chối';
        break;
      case 3:
        title = 'Làm lại';
        break;
      default:
        return;
    }
    this.dialog = this.callfc.openForm(
      PopupADRComponent,
      title,
      500,
      500,
      this.funcID,
      {
        signfileID: this.recID,
        mode: mode,
        title: title,
        subTitle: subTitle,
        funcID: this.funcID,
        formModel: this.formModel,
        formGroup: this.dialogSignFile,
      }
    );
    this.dialog.closed.subscribe((res) => {
      if (res.event == 'ok') {
        console.log('run');
        this.pdfView.renderAnnotPanel();
        this.notify.notifyCode('RS002');
        this.dialog && this.dialog.close();
      }
    });
  }

  changeActiveOpenPopup(e) {
    this.canOpenSubPopup = e;
  }
  saveDialog() {
    this.dialog.close();
  }

  close() {
    this.dialog && this.dialog.close();
  }
}
