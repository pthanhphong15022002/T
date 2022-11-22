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
  dataSelected: any;
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
  seqNoSessionChoosed: any;
  seqNoQuestionChoosed: any;
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

  resultQuestion: any = new Array();
  onSave() {
    var dataSession = JSON.parse(JSON.stringify(this.dataQuestion));
    var rsSession: any = new Array();
    var rsQuestion: any = new Array();
    //TH1 chọn session
    rsSession = dataSession.filter((x) => x['check']);
    if (rsSession.length > 0) {
      rsSession.forEach((y) => {
        y.children = y.children.filter((z) => z['check']);
      });
    }
    //TH2 chọn question
    rsQuestion = this.getUniqueListBy(this.resultQuestion, 'recID');
    var dt = new Array();
    rsSession.forEach((x) => {
      x.children.forEach((y) => {
        dt.push(y);
      });
    });
    //Check xem list children trong session trùng với list question thì xóa bên list question
    rsQuestion.forEach((x, index) => {
      dt.forEach((y) => {
        if (x.recID == y.recID) rsQuestion.splice(index, 1);
      });
    });
    var obj = {
      dataSession: rsSession,
      dataQuestion: rsQuestion,
      changeTemplate: false,
    };
    this.dialog.close(obj);
  }

  private getUniqueListBy(arr: any, key: any) {
    return [
      ...new Map(arr.map((item: any) => [item[key], item])).values(),
    ] as any;
  }

  valueChangeAll(e) {
    if (e) {
      this.dataQuestion.forEach((x) => {
        x['check'] = e.data;
        x.children.forEach((y) => {
          y['check'] = e.data;
        });
      });
      this.disableSave = !e.data;
    }
  }

  valueChangeSession(e, seqNoSession) {
    if (e) {
      this.dataQuestion[seqNoSession]['check'] = e.data;
      this.dataQuestion[seqNoSession].children.forEach((x) => {
        x['check'] = e.data;
      });
      this.disableSave = !e.data;
    }
  }

  valueChangeQuestion(e, itemSession, itemQuestion) {
    if (e) {
      this.dataQuestion[itemSession.seqNo].children[itemQuestion.seqNo][
        'check'
      ] = e.data;
      if (!this.dataQuestion[itemSession.seqNo]['check']) {
        if (e.data) this.disableSave = false;
        else this.disableSave = true;
      } else this.disableSave = false;
      if (itemSession['check'] == false || !itemSession['check']) {
        if (e.data) this.resultQuestion.push(itemQuestion);
        else if (e.data == false) this.resultQuestion.filter((x) => x['check']);
      }
    }
  }

  chooseOtherTemplate() {
    var obj = { data: this.dataQuestion, changeTemplate: true };
    this.dialog.close(obj);
  }

  generateGuid() {
    var d = new Date().getTime(); //Timestamp
    var d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0; //Time in microseconds since page-load or 0 if unsupported
    var GUID;
    return (GUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16; //random number between 0 and 16
        if (d > 0) {
          //Use timestamp until depleted
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          //Use microseconds since page-load if supported
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }
    ));
  }
}
