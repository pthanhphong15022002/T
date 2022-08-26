import {
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PdfViewerComponent } from '@syncfusion/ej2-angular-pdfviewer';
import { UIComponent, DialogData, DialogRef, FormModel } from 'codx-core';
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
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.data = dt.data[0];
  }

  @ViewChild('pdfView') pdfView: PdfViewComponent;

  isApprover = true;
  dialog;
  data;
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
    this.funcID = this.data?.funcID;
    this.recID = this.data?.recID;
    this.cache.functionList(this.funcID).subscribe((res) => {
      this.formModel = res;
      this.esService
        .getFormGroup('ApprovalTrans', 'grvApprovalTrans')
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
      }
    });
  }

  changeActiveOpenPopup(e) {
    this.canOpenSubPopup = e;
  }
  saveDialog() {
    this.dialog.close();
  }
}
