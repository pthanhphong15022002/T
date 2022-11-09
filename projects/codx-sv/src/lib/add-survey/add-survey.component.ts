import { SV_Questions } from './../model/SV_Questions';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  MultiSelectService,
  RteService,
} from '@syncfusion/ej2-angular-inplace-editor';
import { RichTextEditorModel } from '@syncfusion/ej2-angular-richtexteditor';
import { DialogModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxSvService } from '../codx-sv.service';
import { SV_Surveys } from '../model/SV_Surveys';
import { PopupUploadComponent } from '../popup-upload/popup-upload.component';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-add-survey',
  templateUrl: './add-survey.component.html',
  styleUrls: ['./add-survey.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [RteService, MultiSelectService],
})
export class AddSurveyComponent extends UIComponent implements OnInit {
  surveys: SV_Surveys = new SV_Surveys();
  formats: any = new Array();
  questions: any = new Array();
  sessions: any = new Array();
  answers: any = new Array();
  isModeAdd = true;
  funcID = '';
  functionList: any;
  public titleEditorModel: RichTextEditorModel = {
    toolbarSettings: {
      enableFloating: false,
      items: ['Bold', 'Italic', 'Underline', 'ClearFormat', 'CreateLink'],
    },
  };
  public descriptionEditorModel: RichTextEditorModel = {
    toolbarSettings: {
      enableFloating: false,
      items: [
        'Bold',
        'Italic',
        'Underline',
        'ClearFormat',
        'CreateLink',
        'NumberFormatList',
        'BulletFormatList',
      ],
    },
  };
  public titleRule: { [name: string]: { [rule: string]: Object } } = {
    Title: { required: [true, 'Enter valid title'] },
  };
  public commentRule: { [name: string]: { [rule: string]: Object } } = {
    rte: { required: [true, 'Enter valid comments'] },
  };

  data: any = {
    text: 'Mẫu không có tiêu đề',
    description: 'Mô tả biểu mẫu',
  };
  REFER_TYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };

  dataAnswer: any = new Array();
  active = false;
  MODE_IMAGE_VIDEO = 'EDIT';
  lstEditIV: any = new Array();
  recID: any;
  amountOfSession = 0;
  children: any = new Array();
  @ViewChild('ATM_Image') ATM_Image: AttachmentComponent;
  @ViewChild('templateQuestionMF') templateQuestionMF: TemplateRef<any>;
  constructor(
    inject: Injector,
    private change: ChangeDetectorRef,
    private SVServices: CodxSvService
  ) {
    super(inject);

    this.formats = {
      item: 'Title',
      fontStyle: 'Arial',
      fontSize: '13',
      fontColor: 'black',
      fontFormat: 'B',
    };
    this.router.params.subscribe((params) => {
      if (params) this.funcID = params['funcID'];
    });
    this.router.queryParams.subscribe((queryParams) => {
      if (queryParams?.recID) {
        this.recID = queryParams.recID;
        this.loadData();
      }
    });
    this.cache.functionList('SVT01').subscribe((res) => {
      if (res) this.functionList = res;
    });
  }

  onInit(): void {
    // this.add();
  }

  ngAfterViewInit() {
    var html = document.querySelector('codx-wrapper');
    if (html) {
      html.addEventListener('scroll', (e) => {
        var htmlMF = document.querySelector('.moreFC');
        if (htmlMF) htmlMF.setAttribute('style', `top: ${html.scrollTop}px`);
      });
    }
  }

  loadData() {
    this.questions = null;
    this.api
      .exec('ERM.Business.SV', 'QuestionsBusiness', 'GetByRecIDAsync', [
        this.recID,
      ])
      .subscribe((res: any) => {
        if (res[0] && res[0].length > 0) {
          this.amountOfSession = res[1].length - 1;
          this.questions = this.getHierarchy(res[0], res[1]);
          console.log('check questions', this.questions);
        } else {
          this.questions = [
            {
              seqNo: 0,
              question: null,
              answers: null,
              other: false,
              mandatory: false,
              answerType: null,
              category: 'S',
            },
            {
              seqNo: 1,
              question: 'Câu hỏi 1',
              answers: [
                {
                  seqNo: 0,
                  answer: 'Tùy chọn 1',
                  other: false,
                  isColumn: false,
                  hasPicture: false,
                },
              ],
              other: true,
              mandatory: false,
              answerType: 'O',
              category: 'Q',
            },
          ];
          this.amountOfSession = 1;
        }
        this.questions[1]['active'] = true;
      });
    // this.change.detectChanges();
  }

  getHierarchy(dataSession, dataQuestion) {
    var dataTemp = JSON.parse(JSON.stringify(dataSession));
    dataTemp.forEach((res) => {
      res['children'] = [];
      dataQuestion.forEach((x) => {
        if (x.parentID == res.recID) {
          res['children'].push(x);
        }
      });
    });
    return dataTemp;
  }

  valueChange(e, dataQuestion) {
    if (e) {
      this.questions[dataQuestion.seqNo].mandatory = e.data;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
  }
  dropAnswer(event: CdkDragDrop<string[]>, idParent) {
    var index = this.questions.findIndex((x) => x.seqNo == idParent);
    this.dataAnswer = this.questions[index].answers;
    moveItemInArray(this.dataAnswer, event.previousIndex, event.currentIndex);
    this.dataAnswer.forEach((x, index) => (x.seqNo = index));
    this.questions[idParent].answers = this.dataAnswer;
  }

  public focusIn(target: HTMLElement): void {
    target.parentElement.classList.add('e-input-focus');
  }

  public focusOut(target: HTMLElement): void {
    target.parentElement.classList.remove('e-input-focus');
  }

  questionAdd: SV_Questions = new SV_Questions();
  add() {
    var dataAnswerTemp = [
      {
        seqNo: 0,
        answer: `Tùy chọn 1`,
      },
    ];
    this.questionAdd.transID = this.recID;
    this.questionAdd.seqNo = 6;
    this.questionAdd.category = 'S';
    this.questionAdd.question = 'Câu hỏi session 3';
    this.questionAdd.answers = dataAnswerTemp;
    this.questionAdd.answerType = 'O';
    this.questionAdd.parentID = 'a32f2b10-5e76-11ed-a637-e454e8b52262';

    this.api
      .exec('ERM.Business.SV', 'QuestionsBusiness', 'SaveAsync', [
        this.recID,
        this.questionAdd,
        true,
      ])
      .subscribe((res) => {
        if (res) {
        }
      });
  }

  itemActive: any;
  clickToScroll(seqNoSession = null, recIDQuestion = null, category = null) {
    var recID = 0;
    var id = 'card-survey';
    if (category == 'S') recID = seqNoSession;
    else {
      recID = recIDQuestion;
      id = 'card-survey-question';
    }
    var html = document.getElementById(`${id}-${recID}`);
    var htmlE = html as HTMLElement;
    var htmlMF = document.querySelector('.moreFC');
    if (htmlMF)
      htmlMF.setAttribute('style', `top: calc(${htmlE?.offsetTop}px - 151px);`);
    this.activeCard(seqNoSession, recIDQuestion, category);
  }

  indexSessionA = 0;
  indexQuestionA = 0;
  activeCard(seqNoSession, recIDQuestion, category) {
    this.indexSessionA = seqNoSession;
    this.questions.forEach((x) => {
      if (x['active'] == true) x['active'] = false;
      x.children.forEach((y) => {
        if (y['active'] == true) y['active'] = false;
      });
    });
    if (category == 'S') {
      this.questions.forEach((x) => {
        if (x['active'] == true) x['active'] = false;
        if (x.seqNo == seqNoSession) {
          x['active'] = true;
          this.itemActive = x;
        }
      });
    } else {
      this.questions[seqNoSession].children.forEach((x) => {
        if (x['active'] == true) x['active'] = false;
        if (x.recID == recIDQuestion) {
          x['active'] = true;
          this.itemActive = x;
        }
      });
    }
  }

  addAnswer(indexSession, indexQuestion) {
    var data = JSON.parse(
      JSON.stringify(this.questions[indexSession].children[indexQuestion])
    );
    data?.answers.filter((x) => x.other == false);
    var seqNo = data?.answers.length;
    var dataAnswerTemp = {
      seqNo: seqNo,
      answer: `Tùy chọn ${seqNo + 1}`,
      other: false,
      isColumn: false,
      hasPicture: false,
    };
    var index = data.answers.findIndex((x) => x.other == true);
    if (index >= 0) {
      var dataOtherTemp = {
        seqNo: seqNo - 1,
        answer: `Tùy chọn ${seqNo}`,
        other: false,
        isColumn: false,
        hasPicture: false,
      };
      data.answers.splice(seqNo - 1, 0, dataOtherTemp);
      data.answers[index + 1].seqNo = seqNo;
    } else data.answers.push(dataAnswerTemp);
    this.questions[indexSession].children[indexQuestion] = data;
    console.log('check question after addAnswer', this.questions);
  }

  deleteAnswer(indexSession, indexQuestion, dataAnswer) {
    var data = JSON.parse(
      JSON.stringify(
        this.questions[indexSession].children[indexQuestion].answers
      )
    );
    data = data.filter((x) => x.seqNo != dataAnswer.seqNo);
    data.forEach((x, index) => {
      x.seqNo = index;
    });
    this.questions[indexSession].children[indexQuestion].answers = data;
    if (dataAnswer.other)
      this.questions[indexSession].children[indexQuestion].other = false;
    console.log('check questions', this.questions);
  }

  deleteCard(dataQuestion) {
    var data = JSON.parse(JSON.stringify(this.questions));
    data = data.filter((x) => x.seqNo != dataQuestion.seqNo);
    data.forEach((x, index) => {
      x.seqNo = index;
    });
    if (dataQuestion.seqNo == 0) dataQuestion.seqNo = 1;
    data[dataQuestion.seqNo - 1].active = true;
    this.questions = data;
  }

  addOtherAnswer(indexSession, indexQuestion) {
    var seqNo =
      this.questions[indexSession].children[indexQuestion].answers?.length;
    var dataAnswerTemp = {
      seqNo: seqNo,
      answer: '',
      other: true,
      isColumn: false,
      hasPicture: false,
    };
    var data = JSON.parse(
      JSON.stringify(
        this.questions[indexSession].children[indexQuestion].answers
      )
    );
    data.push(dataAnswerTemp);
    this.questions[indexSession].children[indexQuestion]!.answers = data;
    this.questions[indexSession].children[indexQuestion]['other'] = true;
  }

  copyCard(category, dataQuestion) {
    var dataTemp = JSON.parse(JSON.stringify(dataQuestion));
    this.generateGuid();
    delete dataQuestion.id;
    dataQuestion.recID = this.GUID;
    if (category == 'S') dataQuestion.parentID = null;
    var data = JSON.parse(JSON.stringify(this.questions));
    data[dataQuestion.seqNo].active = false;
    data.splice(dataQuestion.seqNo + 1, 0, dataQuestion);
    data.forEach((x, index) => {
      x.seqNo = index;
      if (x.parentID == dataTemp.recID) x.parentID = this.GUID;
    });
    this.questions = data;
    this.amountOfSession = 0;
    this.questions.forEach((x) => {
      if (x.category == 'S') this.amountOfSession++;
    });
    console.log('check copy questions', this.questions);
  }

  clickMF(functionID, eleAttachment = null) {
    if (functionID) {
      switch (functionID) {
        case 'LTN01':
          this.addCard('Q', this.itemActive, this.indexSessionA);
          break;
        case 'LTN02':
          break;
        case 'LTN03':
          this.addCard('T', this.itemActive, this.indexSessionA);
          break;
        case 'LTN04':
          this.uploadFile('image', 'upload');
          break;
        case 'LTN05':
          this.uploadFile('video', 'upload');
          break;
        case 'LTN06':
          this.addCard('S', this.itemActive, this.indexSessionA);
          break;
      }
    }
  }

  uploadFile(typeFile, modeFile) {
    var obj = {
      functionList: this.functionList,
      typeFile: typeFile,
      modeFile: modeFile,
      data: this.itemActive,
    };
    var dialog = this.callfc.openForm(
      PopupUploadComponent,
      '',
      900,
      600,
      '',
      obj,
      ''
    );
    dialog.closed.subscribe((res) => {
      if (res.event) {
        this.uploadImage(this.itemActive, res.event);
      }
    });
  }

  deleteFile() {
    this.SVServices.deleteFile(
      this.itemActive,
      this.functionList.entityName
    ).subscribe((res) => {
      if (res) {
        this.questions.splice(this.itemActive.seqNo, 1);
        this.questions.forEach((x, index) => (x.seqNo = index));
      }
    });
  }

  GUID: any;
  generateGuid() {
    var d = new Date().getTime(); //Timestamp
    var d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0; //Time in microseconds since page-load or 0 if unsupported
    this.GUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
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
    );
  }

  addCard(category, dataQuestion, seqNoSession = null) {
    if (dataQuestion) {
      this.generateGuid();
      var dataAnswerTemp = {
        seqNo: 0,
        answer: 'Tùy chọn 1',
        other: true,
        isColumn: false,
        hasPicture: false,
      };
      var tempQuestion = JSON.parse(JSON.stringify(dataQuestion));
      if (category == 'T' || category == 'S') {
        tempQuestion.answers = null;
        tempQuestion.answerType = null;
        tempQuestion.question = null;
      } else {
        tempQuestion.answers = [dataAnswerTemp];
        tempQuestion.answerType = 'O';
        tempQuestion.question = 'Câu hỏi';
      }
      tempQuestion.seqNo = dataQuestion.seqNo + 1;
      tempQuestion.category = category;
      tempQuestion.recID = this.GUID;
      if (category == 'S') {
        this.questions.splice(dataQuestion.seqNo + 1, 0, tempQuestion);
        this.questions.forEach((x, index) => (x.seqNo = index));
        this.questions[dataQuestion.seqNo].active = false;
        this.questions[dataQuestion.seqNo + 1].active = true;
        this.itemActive = this.questions[dataQuestion.seqNo + 1];
      } else {
        this.questions[seqNoSession].children.splice(
          dataQuestion.seqNo + 1,
          0,
          tempQuestion
        );
        this.questions[seqNoSession].children.forEach(
          (x, index) => (x.seqNo = index)
        );
        this.questions[seqNoSession].children[dataQuestion.seqNo].active =
          false;
        this.questions[seqNoSession].children[dataQuestion.seqNo + 1].active =
          true;
        this.itemActive =
          this.questions[seqNoSession].children[dataQuestion.seqNo + 1];
      }
      this.clickToScroll(seqNoSession, this.GUID, category);
    }
    this.change.detectChanges();
    console.log('check addCard', this.questions);
  }

  importQuestion(dataQuestion) {}

  addTitle(dataQuestion) {}

  uploadImage(dataQuestion, data) {
    if (dataQuestion) {
      var tempQuestion = JSON.parse(JSON.stringify(dataQuestion));
      tempQuestion.seqNo = dataQuestion.seqNo + 1;
      tempQuestion.answerType = null;
      tempQuestion.question = null;
      tempQuestion.category = 'P';
      tempQuestion.recID = data[0].objectID;
      this.questions.splice(dataQuestion.seqNo + 1, 0, tempQuestion);
      this.questions.forEach((x, index) => (x.seqNo = index));
      this.questions[dataQuestion.seqNo].active = false;
      this.questions[dataQuestion.seqNo + 1].active = true;
      this.itemActive = this.questions[dataQuestion.seqNo + 1];
      this.clickToScroll(dataQuestion.seqNo + 1);
    }
    this.lstEditIV = data;
    this.change.detectChanges();
  }

  uploadVideo(dataQuestion) {}

  addSection(dataQuestion) {}

  clickQuestionMF(indexSession, indexQuestion, answerType) {
    if (answerType) {
      var data = JSON.parse(
        JSON.stringify(this.questions[indexSession].children[indexQuestion])
      );
      data.answerType = answerType;
      if (
        answerType == 'T' ||
        answerType == 'T2' ||
        answerType == 'D' ||
        answerType == 'H' ||
        answerType == 'R' ||
        answerType == 'O2' ||
        answerType == 'C2'
      ) {
        data.other = false;
        data.answers = new Array();
        var dataAnswerTemp = {
          seqNo: 0,
          answer: '',
          other: false,
          isColumn: false,
          hasPicture: false,
        };
        data.answers.push(dataAnswerTemp);
      } else if (answerType == 'L') data.other = false;
      else data.other = true;
      if (data.answers.length == 1) {
        data.answers[0].answer = 'Tùy chọn 1';
      }
      this.questions[indexSession].children[indexQuestion] = data;
    }
  }

  valueFrom = 1;
  valueTo = 5;
  changeRating(value, type) {
    if (type == 'FROM') this.valueFrom = value;
    else this.valueTo = value;
  }
}
