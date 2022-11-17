import { SortSessionComponent } from './sort-session/sort-session.component';
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
import {
  CallFuncService,
  DialogModel,
  NotificationsService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxSvService } from '../codx-sv.service';
import { SV_Surveys } from '../model/SV_Surveys';
import { PopupUploadComponent } from '../popup-upload/popup-upload.component';
import { Observable, Subscription } from 'rxjs';
import { ImageGridComponent } from 'projects/codx-share/src/lib/components/image-grid/image-grid.component';
import { environment } from 'src/environments/environment';
import { TemplateSurveyOtherComponent } from '../template-survey-other.component/template-survey-other.component';

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
  children: any = new Array();
  views: Array<ViewModel> = [];
  viewType = ViewType;
  @ViewChild('ATM_Image') ATM_Image: AttachmentComponent;
  @ViewChild('templateQuestionMF') templateQuestionMF: TemplateRef<any>;
  @ViewChild('itemTemplate') panelLeftRef: TemplateRef<any>;
  src: any;
  constructor(
    inject: Injector,
    private change: ChangeDetectorRef,
    private SVServices: CodxSvService,
    private notification: NotificationsService,
    private call: CallFuncService
  ) {
    super(inject);

    this.formats = {
      item: 'Title',
      fontStyle: 'Arial',
      fontSize: '13',
      fontColor: 'black',
      fontFormat: 'B',
    };
    // this.router.params.subscribe((params) => {
    //   if (params) this.funcID = params['funcID'];
    // });
    this.router.queryParams.subscribe((queryParams) => {
      if (queryParams?.funcID) this.funcID = queryParams.funcID;
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
    // this.getFileByObjectID('84458c7d-1a7a-470b-a1c6-dedbb5ba66de').subscribe((res: any[]) => {
    //   if (res.length > 0) {
    //     let files = res;
    //     files.map((e: any) => {
    //       if (e && e.referType == this.REFER_TYPE.VIDEO) {
    //         e[
    //           'srcVideo'
    //         ] = `${environment.urlUpload}/${e.url}`;
    //       }
    //     });
    //     this.src = files;
    //   }
    // });
  }

  onLoading(e) {
    if (this.view.formModel) {
      var formModel = this.view.formModel;
      this.views = [
        {
          active: true,
          type: ViewType.content,
          sameData: true,
          model: {
            panelLeftRef: this.panelLeftRef,
          },
        },
      ];
      this.change.detectChanges();
      var html = document.querySelector('codx-wrapper');
      if (html) {
        html.addEventListener('scroll', (e) => {
          var htmlMF = document.querySelector('.moreFC');
          if (htmlMF) htmlMF.setAttribute('style', `top: ${html.scrollTop}px`);
        });
      }
    }
  }

  ngAfterViewInit() {}

  loadData() {
    this.questions = null;
    this.api
      .exec('ERM.Business.SV', 'QuestionsBusiness', 'GetByRecIDAsync', [
        this.recID,
      ])
      .subscribe((res: any) => {
        if (res[0] && res[0].length > 0) {
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
              children: [
                {
                  seqNo: 0,
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
              ],
            },
          ];
        }
        this.questions[0].children[0]['active'] = true;
        this.itemActive = this.questions[0].children[0];
      });
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

  drop(seqNoSession, event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.questions[seqNoSession].children,
      event.previousIndex,
      event.currentIndex
    );
  }

  dropAnswer(event: CdkDragDrop<string[]>, idParent) {
    var index = this.questions.findIndex((x) => x.seqNo == idParent);
    this.dataAnswer = this.questions[index].answers;
    moveItemInArray(this.dataAnswer, event.previousIndex, event.currentIndex);
    this.dataAnswer.forEach((x, index) => (x.seqNo = index));
    this.questions[idParent].answers = this.dataAnswer;
  }

  dropAnswerRC(
    event: CdkDragDrop<string[]>,
    seqNoSession,
    seqNoQuestion,
    answerType
  ) {
    var dataTemp = JSON.parse(
      JSON.stringify(
        this.questions[seqNoSession].children[seqNoQuestion].answers
      )
    );
    moveItemInArray(dataTemp, event.previousIndex, event.currentIndex);
    var dataAnswerR = dataTemp.filter((x) => !x.isColumn);
    var dataAnswerC = dataTemp.filter((x) => x.isColumn);
    if (answerType == 'row') {
      dataAnswerR.forEach((x, index) => {
        x.seqNo = index;
      });
    } else {
      dataAnswerC.forEach((x, index) => {
        x.seqNo = index;
      });
    }
    var dataMerge = [...dataAnswerR, ...dataAnswerC];
    if (dataMerge.length > 0) {
      this.questions[seqNoSession].children[seqNoQuestion].answers = dataMerge;
      console.log(
        'check dropAnswerRC',
        this.questions[seqNoSession].children[seqNoQuestion].answers
      );
    }
    this.questions[seqNoSession].children[seqNoQuestion].answers = dataMerge;
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
    let recID = 0;
    let id = 'card-survey';
    if (category == 'S') recID = seqNoSession;
    else {
      recID = recIDQuestion;
      id = 'card-survey-question';
    }
    let html = document.getElementById(`${id}-${recID}`);
    let htmlE = html as HTMLElement;
    let htmlMF = document.querySelector('.moreFC');
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

  deleteCard(seqNoSession, seqNoQuestion, category) {
    if (category == 'S') this.deleteSession(seqNoSession);
    else this.deleteNoSession(seqNoSession, seqNoQuestion);
    console.log('check delete card', this.questions);
  }

  deleteSession(seqNoSession) {
    this.notification
      .alert(
        'Xóa câu hỏi và mục?',
        'Việc xóa một mục cũng sẽ xóa các câu hỏi và câu trả lời trong mục đó.'
      )
      .closed.subscribe((x) => {
        if (x.event.status == 'Y') {
          var data = JSON.parse(JSON.stringify(this.questions));
          data = data.filter((x) => x.seqNo != seqNoSession);
          data.forEach((x, index) => {
            x.seqNo = index;
          });
          this.questions = data;
          this.change.detectChanges();
        }
      });
  }

  deleteNoSession(seqNoSession, seqNoQuestion) {
    var data = JSON.parse(
      JSON.stringify(this.questions[seqNoSession].children)
    );
    data = data.filter((x) => x.seqNo != seqNoQuestion);
    data.forEach((x, index) => {
      x.seqNo = index;
    });
    if (seqNoQuestion == 0) this.questions[seqNoSession].active = true;
    else data[seqNoQuestion - 1].active = true;
    this.questions[seqNoSession].children = data;
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

  copyCard(itemSession, itemQuestion, category) {
    if (category == 'S') this.copySession(itemSession);
    else this.copyNoSession(itemSession, itemQuestion);
    console.log('check copy questions', this.questions);
  }

  copySession(itemSession) {
    this.generateGuid();
    delete itemSession.id;
    itemSession.recID = this.GUID;
    var data = JSON.parse(JSON.stringify(this.questions));
    data[itemSession.seqNo].active = false;
    data.splice(itemSession.seqNo + 1, 0, itemSession);
    data.forEach((x, index) => {
      x.seqNo = index;
    });
    this.questions = data;
  }

  copyNoSession(itemSession, itemQuestion) {
    var dataTemp = JSON.parse(JSON.stringify(itemQuestion));
    this.generateGuid();
    delete itemQuestion.id;
    itemQuestion.recID = this.GUID;
    var data = JSON.parse(
      JSON.stringify(this.questions[itemSession.seqNo].children)
    );
    data[itemQuestion.seqNo].active = false;
    data.splice(itemQuestion.seqNo + 1, 0, itemQuestion);
    data.forEach((x, index) => {
      x.seqNo = index;
      if (x.parentID == dataTemp.recID) x.parentID = this.GUID;
    });
    this.questions[itemSession.seqNo].children = data;
  }

  clickMF(functionID, eleAttachment = null) {
    if (functionID) {
      switch (functionID) {
        case 'LTN01':
          this.addCard(this.itemActive, this.indexSessionA, 'Q');
          break;
        case 'LTN02':
          this.addQuestionOther();
          break;
        case 'LTN03':
          this.addCard(this.itemActive, this.indexSessionA, 'T');
          break;
        case 'LTN04':
          this.uploadFile('image', 'upload');
          break;
        case 'LTN05':
          this.uploadFile('video', 'upload');
          break;
        case 'LTN06':
          this.addCard(this.itemActive, this.indexSessionA, 'S');
          break;
      }
    }
  }

  addQuestionOther() {
    var obj = {};
    var option = new DialogModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    var dialog = this.callfc.openForm(
      TemplateSurveyOtherComponent,
      '',
      1000,
      700,
      '',
      obj,
      '',
      option
    );
    dialog.closed.subscribe((res) => {
      if (res) {
      }
    });
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
        this.uploadImage(this.indexSessionA, this.itemActive, res.event);
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

  addCard(itemActive, seqNoSession = null, category) {
    if (itemActive) {
      if (category == 'S') this.addSession(itemActive, seqNoSession);
      else this.addNoSession(itemActive, seqNoSession, category);
      console.log('check addCard', this.questions);
    }
  }

  addSession(itemActive, seqNoSession) {
    var index = itemActive.seqNo;
    this.generateGuid();
    var tempQuestion = JSON.parse(JSON.stringify(itemActive));
    tempQuestion.answers = null;
    tempQuestion.answerType = null;
    tempQuestion.question = null;
    tempQuestion.seqNo = index + 1;
    tempQuestion.category = 'S';
    tempQuestion.recID = this.GUID;
    this.questions.splice(index + 1, 0, tempQuestion);
    this.questions.forEach((x, index) => (x.seqNo = index));
    this.questions[index].active = false;
    this.questions[index + 1].active = true;
    this.itemActive = this.questions[index + 1];
    var lstMain = this.questions[seqNoSession].children;
    if (itemActive.category == 'S') {
      this.questions[index + 1].children = this.questions[index].children;
      this.questions[index].children = [];
    } else {
      var lstUp = [];
      var lstDown = [];
      lstUp = lstMain.slice(0, index + 1);
      lstDown = lstMain.slice(index + 1, lstMain.length);
      this.questions[index + 1]['children'] = lstDown;
      this.questions[index]['children'] = lstUp;
    }
    this.clickToScroll(index + 1, this.GUID, 'S');
  }

  addNoSession(itemActive, seqNoSession, category) {
    this.generateGuid();
    var dataAnswerTemp = {
      seqNo: 0,
      answer: 'Tùy chọn 1',
      other: true,
      isColumn: false,
      hasPicture: false,
    };
    var tempQuestion = JSON.parse(JSON.stringify(itemActive));
    if (category == 'T') {
      tempQuestion.answers = null;
      tempQuestion.answerType = null;
      tempQuestion.question = null;
    } else {
      tempQuestion.answers = [dataAnswerTemp];
      tempQuestion.answerType = 'O';
      tempQuestion.question = 'Câu hỏi';
    }
    tempQuestion.seqNo = itemActive.seqNo + 1;
    tempQuestion.category = category;
    tempQuestion.recID = this.GUID;
    this.questions[seqNoSession].children.splice(
      itemActive.seqNo + 1,
      0,
      tempQuestion
    );
    this.questions[seqNoSession].children.forEach(
      (x, index) => (x.seqNo = index)
    );
    this.questions[seqNoSession].children[itemActive.seqNo].active = false;
    this.questions[seqNoSession].children[itemActive.seqNo + 1].active = true;
    this.itemActive =
      this.questions[seqNoSession].children[itemActive.seqNo + 1];
    this.clickToScroll(seqNoSession, this.GUID, category);
  }

  importQuestion(dataQuestion) {}

  addTitle(dataQuestion) {}

  uploadImage(seqNoSession, dataQuestion, data) {
    if (dataQuestion) {
      var tempQuestion = JSON.parse(JSON.stringify(dataQuestion));
      tempQuestion.seqNo = dataQuestion.seqNo + 1;
      tempQuestion.answerType = null;
      tempQuestion.question = null;
      tempQuestion.category = 'P';
      tempQuestion.recID = data[0].objectID;
      this.questions[seqNoSession].children.splice(
        dataQuestion.seqNo + 1,
        0,
        tempQuestion
      );
      this.questions[seqNoSession].children.forEach(
        (x, index) => (x.seqNo = index)
      );
      this.questions[seqNoSession].children[dataQuestion.seqNo].active = false;
      this.questions[seqNoSession].children[dataQuestion.seqNo + 1].active =
        true;
      this.itemActive =
        this.questions[seqNoSession].children[dataQuestion.seqNo + 1];
      // this.clickToScroll(dataQuestion.seqNo + 1);
    }
    data[0]['recID'] = data[0].objectID;
    this.lstEditIV = data;
    if (this.lstEditIV[0].referType == 'video')
      this.lstEditIV[0][
        'srcVideo'
      ] = `${environment.urlUpload}/${this.lstEditIV[0].urlPath}`;
    this.change.detectChanges();
  }

  uploadVideo(dataQuestion) {}

  amountOfRow = 2;
  clickQuestionMF(seqNoSession, itemQuestion, answerType) {
    this.generateGuid();
    var recID = JSON.parse(JSON.stringify(this.GUID));
    if (answerType) {
      var data = JSON.parse(
        JSON.stringify(
          this.questions[seqNoSession].children[itemQuestion.seqNo]
        )
      );
      data.answerType = answerType;
      if (
        answerType == 'O' ||
        answerType == 'C' ||
        answerType == 'L' ||
        answerType == 'R'
      ) {
        if (itemQuestion.answerType != 'O' && itemQuestion.answerType != 'C') {
          data.answers = new Array();
          let dataAnswerTemp = {
            recID: recID,
            seqNo: 0,
            answer: 'Tùy chọn 1',
            other: false,
          };
          data.answers.push(dataAnswerTemp);
        }
      } else if (answerType == 'O2' || answerType == 'C2') {
        if (
          itemQuestion.answerType != 'O2' &&
          itemQuestion.answerType != 'C2'
        ) {
          data.answers = new Array();
          let dataAnswerR = {
            recID: recID,
            seqNo: 0,
            answer: 'Hàng 1',
            isColumn: false,
          };
          data.answers.push(dataAnswerR);
          this.generateGuid();
          let dataAnswerC = {
            recID: this.GUID,
            seqNo: 0,
            answer: 'Cột 1',
            isColumn: true,
          };
          data.answers.push(dataAnswerC);
        }
      }
      this.questions[seqNoSession].children[itemQuestion.seqNo] = data;
    }
  }

  addAnswerR(seqNoSession, seqNoQuestion) {
    this.generateGuid();
    var dataTemp = JSON.parse(
      JSON.stringify(
        this.questions[seqNoSession].children[seqNoQuestion].answers
      )
    );
    var dataAnswerR = dataTemp.filter((x) => !x.isColumn);
    this.amountOfRow = 0;
    this.amountOfRow = dataAnswerR.length;
    var dataAnswerTemp = {
      recID: this.GUID,
      seqNo: dataAnswerR.length,
      answer: `Hàng ${dataAnswerR.length + 1}`,
      isColumn: false,
    };
    dataTemp.push(dataAnswerTemp);
    this.amountOfRow += 2;
    this.questions[seqNoSession].children[seqNoQuestion].answers = dataTemp;
    console.log(
      'check addAnswerR',
      this.questions[seqNoSession].children[seqNoQuestion].answers
    );
  }

  addAnswerC(seqNoSession, seqNoQuestion) {
    this.generateGuid();
    var dataTemp = JSON.parse(
      JSON.stringify(
        this.questions[seqNoSession].children[seqNoQuestion].answers
      )
    );
    var dataAnswerR = dataTemp.filter((x) => x.isColumn);
    var dataAnswerTemp = {
      recID: this.GUID,
      seqNo: dataAnswerR.length,
      answer: `Cột ${dataAnswerR.length + 1}`,
      isColumn: true,
    };
    dataTemp.push(dataAnswerTemp);
    this.questions[seqNoSession].children[seqNoQuestion].answers = dataTemp;
    console.log(
      'check addAnswerC',
      this.questions[seqNoSession].children[seqNoQuestion].answers
    );
  }

  deleteAnswerRC(seqNoSession, seqNoQuestion, itemAnswer, answerType) {
    var dataTemp = JSON.parse(
      JSON.stringify(
        this.questions[seqNoSession].children[seqNoQuestion].answers
      )
    );
    var dataAnswerR = dataTemp.filter((x) => !x.isColumn);
    var dataAnswerC = dataTemp.filter((x) => x.isColumn);
    if (answerType == 'row') {
      dataAnswerR = dataAnswerR.filter((x) => x.recID != itemAnswer.recID);
      dataAnswerR.forEach((x, index) => {
        x.seqNo = index;
      });
    } else {
      dataAnswerC = dataAnswerC.filter((x) => x.recID != itemAnswer.recID);
      dataAnswerC.forEach((x, index) => {
        x.seqNo = index;
      });
    }
    var dataMerge = [...dataAnswerR, ...dataAnswerC];
    if (dataMerge.length > 0) {
      this.questions[seqNoSession].children[seqNoQuestion].answers = dataMerge;
      console.log(
        'check deleteAnswerRC',
        this.questions[seqNoSession].children[seqNoQuestion].answers
      );
    }
  }

  valueFrom = 1;
  valueTo = 5;
  changeRating(value, type) {
    if (type == 'FROM') this.valueFrom = value;
    else this.valueTo = value;
  }

  sortSession() {
    var obj = {
      data: this.questions,
    };
    var dialog = this.call.openForm(
      SortSessionComponent,
      '',
      500,
      600,
      '',
      obj
    );
    dialog.closed.subscribe((res) => {
      if (res.event) {
        this.questions = res.event;
      }
    });
  }

  filterDataColumn(data) {
    data = data.filter((x) => x.isColumn);
    return data;
  }

  filterDataRow(data) {
    data = data.filter((x) => !x.isColumn);
    return data;
  }

  hideComment(seqNoSession, seqNoQuestion) {
    this.questions[seqNoSession].children[seqNoQuestion].hideComment = true;
  }
}
