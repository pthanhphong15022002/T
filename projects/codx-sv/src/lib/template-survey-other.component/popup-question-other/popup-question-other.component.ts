import {
  Component,
  OnInit,
  Injector,
  Optional,
  ViewEncapsulation,
  ChangeDetectorRef,
} from '@angular/core';
import { DialogData, DialogRef, UIComponent } from 'codx-core';

@Component({
  selector: 'app-popup-question-other',
  templateUrl: './popup-question-other.component.html',
  styleUrls: ['./popup-question-other.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupQuestionOtherComponent extends UIComponent implements OnInit {
  dialog: DialogRef;
  dataSurvey: any;
  formModel: any;
  header = 'Nhập câu hỏi';
  disableSave = true;
  dataQuestion: any;
  answerType = {
    A: 'Attachment',
    T: 'Text',
    T2: 'Long text',
    D: 'Date',
    H: 'Time',
    R: 'Rating',
    O: 'Option',
    O2: 'Matrix option',
    C: 'Check',
    C2: 'Matrix check',
    L: 'Manual list',
    L2: 'Value list',
    L3: 'Combobox',
  };

  constructor(
    private injector: Injector,
    private change: ChangeDetectorRef,
    @Optional() dialogRef: DialogRef,
    @Optional() dt: DialogData
  ) {
    super(injector);
    this.dialog = dialogRef;
    this.formModel = dialogRef.formModel;
    this.dataSurvey = JSON.parse(JSON.stringify(dt.data?.dataSurvey));
    this.dataQuestion = JSON.parse(JSON.stringify(dt.data?.dataQuestion));
  }

  onInit(): void {}

  onSave() {}

  valueChange(e) {}

  valueChangeAll(e) {
    if (e) {
      this.dataQuestion.forEach((x) => {
        x['check'] = e.data;
        x.children.forEach((y) => {
          y['check'] = e.data;
        });
      });
      console.log('check this.dataQuestion', this.dataQuestion);
      this.change.detectChanges();
    }
  }

  valueChangeSession(e, seqNoSession) {
    if (e) {
      this.dataQuestion[seqNoSession]['check'] = true;
      this.dataQuestion[seqNoSession].children.forEach((x) => {
        x['check'] = true;
      });
    }
  }
}
