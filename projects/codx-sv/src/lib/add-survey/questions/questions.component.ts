import { EventEmitter, OnChanges, Output, SimpleChanges } from '@angular/core';
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
  CodxInputComponent,
  DialogModel,
  NotificationsService,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { Observable, Subscription, range } from 'rxjs';
import { ImageGridComponent } from 'projects/codx-share/src/lib/components/image-grid/image-grid.component';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { SV_Surveys } from '../../models/SV_Surveys';
import { CodxSvService } from '../../codx-sv.service';
import { SV_Questions } from '../../models/SV_Questions';
import { TemplateSurveyOtherComponent } from './template-survey-other.component/template-survey-other.component';
import { PopupQuestionOtherComponent } from './template-survey-other.component/popup-question-other/popup-question-other.component';
import { PopupUploadComponent } from './popup-upload/popup-upload.component';
import { SortSessionComponent } from './sort-session/sort-session.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [RteService, MultiSelectService],
})
export class QuestionsComponent
  extends UIComponent
  implements OnInit, OnChanges
{
  @ViewChild('attachment') attachment: AttachmentComponent;
  @Input() dataSV: any;

  avatar: any;
  primaryColor: any;
  backgroudColor: any;
  surveys: SV_Surveys = new SV_Surveys();
  respondResults: any = new Array();
  formats: any = new Array();
  questions: any = new Array();
  sessions: any = new Array();
  answers: any = new Array();
  isModeAdd = true;
  functionList: any;
  emptyText = 'Mẫu không có tiêu đề';
  en = environment;
  valueFrom = 1;
  valueTo = 5;
  valueRFrom = '';
  valueRTo = '';
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
  fieldName = {
    question: 'question',
    transID: 'transID',
    seqNo: 'seqNo',
    category: 'category',
    answerType: 'answerType',
    answers: 'answers',
    parentID: 'parentID',
    mandatory: 'mandatory',
    random: 'random',
    hideComment: 'hideComment',
    qPicture: 'qPicture',
    aPicture: 'aPicture',
    url: 'url',
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
  defaultMoreFunc: any;
  listMoreFunc = [
    {
      id: 'T',
      name: 'Trả lời ngắn',
      icon: 'icon-short_text',
    },
    {
      id: 'T2',
      name: 'Trả lời đoạn',
      icon: 'icon-text_snippet',
      group: true,
    },
    {
      id: 'O',
      name: 'Trắc nghiệm',
      icon: 'icon-radio_button_checked',
    },
    {
      id: 'C',
      name: 'Hộp kiểm',
      icon: 'icon-check_box',
    },
    {
      id: 'L',
      name: 'Menu thả xuống',
      icon: 'icon-arrow_drop_down_circle',
      group: true,
    },
    {
      id: 'A',
      name: 'Tải lên tệp',
      icon: 'icon-cloud_upload',
      group: true,
    },
    {
      id: 'R',
      name: 'Phạm vi tuyến tính',
      icon: 'fa fa-ellipsis-h',
    },
    {
      id: "O2",
      name: "Lưới trắc nghiệm",
      icon: "icon-grid_round"
    },
    {
      id: "C2",
      name: "Lưới hộp kiểm",
      icon: "icon-grid_on",
      group: true
    },
    {
      id: 'D',
      name: 'Ngày',
      icon: 'icon-calendar_today',
    },
    {
      id: 'H',
      name: 'Giờ',
      icon: 'icon-access_time',
    },
  ];
  dataAnswer: any = new Array();
  active = false;
  MODE_IMAGE_VIDEO = 'EDIT';
  lstEditIV: any = [];
  children: any = new Array();
  itemActive: any;
  indexSessionA = 0;
  indexQuestionA = 0;
  idSession = '';
  amountOfRow = 2;
  public r = range(1, 10);
  @Input() changeModeQ: any;
  @Input() formModel: any;
  @Input() dataService: any;
  @Input() recID = '';

  @ViewChild('ATM_Image') ATM_Image: AttachmentComponent;
  @ViewChild('templateQuestionMF') templateQuestionMF: TemplateRef<any>;
  @ViewChild('itemTemplate') panelLeftRef: TemplateRef<any>;
  @ViewChild('input_check') input_check: CodxInputComponent;
  @Output() changeAvatar = new EventEmitter<any>();
  src: any;
  constructor(
    inject: Injector,
    private change: ChangeDetectorRef,
    private SVServices: CodxSvService,
    private shareService: CodxShareService,
    private notification: NotificationsService,
    private sanitizer: DomSanitizer
  ) {
    super(inject);
    this.formats = {
      item: 'Title',
      fontStyle: 'Arial',
      fontSize: '13',
      fontColor: 'black',
      fontFormat: 'B',
    };
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes?.funcID &&
      changes.funcID?.previousValue != changes.funcID?.currentValue
    ) {
      this.funcID = changes.funcID?.currentValue;
      //if(this.funcID) this.loadDataFunc();
    }
    if (
      changes?.recID &&
      changes.recID?.previousValue != changes.recID?.currentValue
    ) {
      this.recID = changes.recID?.currentValue;
      this.loadDataFunc();
    }
    if (
      changes?.dataSV &&
      changes.dataSV?.previousValue != changes.dataSV?.currentValue
    ) {
      this.dataSV = changes.dataSV?.currentValue;
      this.getAvatar();
    }
  }
  //lấy answerType
  setAnswerType(answerType: any, type: any) {
    return this.listMoreFunc.filter((x) => x.id == answerType)[0][type];
  }

  createNewQ() {
    this.questions = [
      {
        seqNo: 0,
        question: this.emptyText,
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
            other: false,
            mandatory: false,
            answerType: 'O',
            category: 'Q',
          },
        ],
      },
    ];
    this.questions[0].children[0]['active'] = true;
    this.itemActive = this.questions[0].children[0];
    this.defaultMoreFunc = this.listMoreFunc.filter((x) => x.id == 'O')[0];
  }

  onInit(): void {
    //this.getAvatar();
  }

  getAvatar() {
    if (this.dataSV && this.dataSV.settings) {
      if (typeof this.dataSV.settings == 'string')
        this.dataSV.settings = JSON.parse(this.dataSV.settings);
      if (this.dataSV?.settings?.image)
        this.avatar = this.shareService.getThumbByUrl(
          this.dataSV?.settings?.image,
          900
        );
      if (this.dataSV?.settings?.primaryColor)
        this.primaryColor = this.dataSV?.settings?.primaryColor;
      if (this.dataSV?.settings?.backgroudColor) {
        this.backgroudColor = this.dataSV?.settings?.backgroudColor;
        document.getElementById('bg-color-sv').style.backgroundColor =
          this.backgroudColor;
      }
    }
  }

  loadDataFunc() {
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.functionList = res;
        if (this.recID) {
          this.loadData(this.recID);
        } else this.createNewQ();
      }
    });
  }
  ngAfterViewInit() {
    var html = document.querySelector('app-questions');
    let myInterVal = setInterval(() => {
      if (html) {
        clearInterval(myInterVal);
        this.onLoading(html);
      }
    }, 1000);
  }

  onLoading(html) {
    if (html) {
      html.addEventListener('scroll', (e) => {
        var htmlMF = document.querySelector('.moreFC');
        htmlMF.setAttribute('style', `top: ${html.scrollTop}px`);
        console.log('check html.scrollTop', html.scrollTop);
      });
    }
  }

  loadData(recID) {
    this.questions = null;
    this.api
      .execSv('SV', 'SV', 'QuestionsBusiness', 'GetByRecIDAsync', recID)
      .subscribe((res: any) => {
        if (res && res[0] && res[0].length > 0) {
          this.questions = this.getHierarchy(res[0], res[1]);
          this.SVServices.getFilesByObjectTypeRefer(
            this.functionList.entityName,
            this.recID
          ).subscribe((res: any) => {
            if (res) {
              res.forEach((x) => {
                if (x.referType == this.recID + '_' + this.REFER_TYPE.VIDEO)
                  x['srcVideo'] = `${environment.urlUpload}/${x.pathDisk}`;
              });
              this.lstEditIV = res;
            }
          });
        } else {
          this.questions = [
            {
              recID: this.generateGUID(),
              seqNo: 0,
              question: null,
              answers: null,
              other: false,
              mandatory: false,
              answerType: null,
              category: 'S',
              transID: this.recID,
              children: [
                {
                  recID: this.generateGUID(),
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
          var list = [];
          list.push(this.questions[0]);
          list = list.concat(this.questions[0].children);
          this.addNewQ(list);
        }
        this.questions[0].children[0]['active'] = true;
        this.itemActive = this.questions[0].children[0];
      });
  }
  addNewQ(listQ: any) {
    this.api
      .exec('ERM.Business.SV', 'QuestionsBusiness', 'SaveAsync', [
        this.recID,
        listQ,
        true,
      ])
      .subscribe((item: any) => {
        if (item) {
          this.idSession = item.idSession;
          this.questions[0].children = item.lst;
          this.questions[0].children[0]['active'] = true;
        }
      });
  }
  getHierarchy(dtS: any, dtQ: any) {
    if (dtS) {
      for (var i = 0; i < dtS.length; i++) {
        dtS[i].children = dtQ.filter((x) => x.parentID == dtS[i].recID);
        dtQ = dtQ.filter((x) => x.parentID != dtS[i].recID);
        if (dtS[i].children && dtS[i].children.length > 0) {
          for (var a = 0; a < dtS[i].children.length; a++) {
            //Phạm vi tuyến tính
            if (dtS[i].children[a].answerType == 'R') {
              if (dtS[i].children[a].answers[0].answer) {
                var split = dtS[i].children[a].answers[0].answer.split('/');
                if (split && split.length > 0) {
                  this.valueFrom = split[0];
                  this.valueTo = split[1];
                  this.valueRFrom = split[2];
                  this.valueRTo = split[3];
                }
              }
            }
            else if(dtS[i].children[a].answerType == "O2")
            {
              this.amountOfRow = dtS[i].children[a].answers.filter((x) => !x.isColumn).length + 1
            }
            else if (dtS[i].children[a].answers) {
              var check = dtS[i].children[a].answers.filter((x) => x.other);
              if (check && check.length > 0) dtS[i].children[a].other = true;
            }
          }
        }
      }
      if (dtS[0].children && dtS[0].children.length > 0)
        dtS[0].children[0]['active'] = true;

      return dtS;
    }
  }

  valueChangeMandatory(e,itemSession ,dataQuestion) {
    if (e) {
      this.SVServices.signalSave.next('saving');
      this.questions[itemSession.seqNo].children[dataQuestion.seqNo].mandatory = e.data;
      this.setTimeoutSaveData(
        [this.questions[itemSession.seqNo].children[dataQuestion.seqNo]],
        false
      );
    }
  }

  drop(seqNoSession, event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.questions[seqNoSession].children,
      event.previousIndex,
      event.currentIndex
    );
    this.questions[seqNoSession].children.forEach(
      (x, index) => (x.seqNo = index)
    );
    this.SVServices.signalSave.next('saving');
    this.setTimeoutSaveData(this.questions[seqNoSession].children, false);
  }

  dropAnswer(event: CdkDragDrop<string[]>, idParent) {
    var index = this.questions[0].children.findIndex(
      (x) => x.seqNo == idParent
    );
    this.dataAnswer = this.questions[0].children[index].answers;
    moveItemInArray(this.dataAnswer, event.previousIndex, event.currentIndex);
    this.dataAnswer.forEach((x, index) => (x.seqNo = index));
    this.questions[0].children[idParent].answers = this.dataAnswer;
    this.SVServices.signalSave.next('saving');
    this.setTimeoutSaveData(this.questions[0].children, false);
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
    }
    this.questions[seqNoSession].children[seqNoQuestion].answers = dataMerge;
    this.setTimeoutSaveData(this.questions[seqNoSession].children, false);
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
    this.questionAdd.transID = '88079007-543c-11ed-a633-e454e8b52262';
    this.questionAdd.seqNo = 0;
    this.questionAdd.category = 'Q';
    this.questionAdd.question = 'Ngày giờ buổi?';
    this.questionAdd.answers = dataAnswerTemp;
    this.questionAdd.answerType = 'O';
    this.questionAdd.parentID = '9c4c9095-6a06-11ed-a643-e454e8b52262';

    this.api
      .exec('ERM.Business.SV', 'QuestionsBusiness', 'SaveAsync', [
        '88079007-543c-11ed-a633-e454e8b52262',
        this.questionAdd,
        true,
      ])
      .subscribe((res) => {
        if (res) {
        }
      });
  }

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
    var data = this.questions[indexSession].children[indexQuestion];
    data?.answers.filter((x) => x.other == false);
    var seqNo = data?.answers.length;
    var dataAnswerTemp = {
      recID: this.generateGUID(),
      seqNo: seqNo,
      answer: `Tùy chọn ${seqNo + 1}`,
      other: false,
      isColumn: false,
      hasPicture: false,
    };
    var index = data.answers.findIndex((x) => x.other == true);
    if (index >= 0) {
      var dataOtherTemp = {
        recID: this.generateGUID(),
        seqNo: seqNo - 1,
        answer: `Tùy chọn ${seqNo}`,
        other: false,
        isColumn: false,
        hasPicture: false,
      };
      data.answers.splice(seqNo - 1, 0, dataOtherTemp);
      data.answers[index + 1].seqNo = seqNo;
    } else data.answers.push(dataAnswerTemp);
    //this.questions[indexSession].children[indexQuestion].answers = data.answers;
    this.SVServices.signalSave.next('saving');
    this.setTimeoutSaveDataAnswer([data], false);
  }

  deleteAnswer(indexSession, indexQuestion, dataAnswer) {
    var data = this.questions[indexSession].children[indexQuestion].answers;
    var i = data.findIndex((x) => x.seqNo == dataAnswer.seqNo);
    data.splice(i, 1);
    data.forEach((x, index) => {
      x.seqNo = index;
    });
    //this.questions[indexSession].children[indexQuestion].answers = data;
    if (dataAnswer.other)
      this.questions[indexSession].children[indexQuestion].other = false;
    console.log('check questions', this.questions);
    this.SVServices.signalSave.next('saving');
    this.setTimeoutSaveDataAnswer(
      [this.questions[indexSession].children[indexQuestion]],
      false,
      dataAnswer
    );
  }

  deleteCard(seqNoSession, seqNoQuestion, recIDQuestion, category) {
    if (category == 'S') this.deleteSession(seqNoSession);
    else this.deleteNoSession(seqNoSession, seqNoQuestion, recIDQuestion);
  }

  mergeSession(itemSession) {
    if (this.questions[itemSession.seqNo].children.length == 0)
      this.questions.splice(itemSession.seqNo, 1);
    else {
      var dataChildren = this.questions[itemSession.seqNo].children;
      dataChildren.forEach(
        (x) => (x.parentID = this.questions[itemSession.seqNo - 1].recID)
      );
      this.questions[itemSession.seqNo - 1].children =
        this.questions[itemSession.seqNo - 1].children.concat(dataChildren);
      this.questions[itemSession.seqNo - 1].children.forEach((x, index) => {
        x.seqNo = index;
      });
      this.questions.splice(itemSession.seqNo, 1);
    }
    this.SVServices.signalSave.next('saving');
    this.setTimeoutDeleteData(
      [itemSession],
      this.questions[itemSession.seqNo - 1].children
    );
    console.log('check mergeSession', this.questions);
  }

  deleteSession(seqNoSession) {
    if(this.questions[seqNoSession].children.length == 0)
    {
      this.deleteBefore(seqNoSession)
    }
    else
    {
      this.notification
      .alert(
        'Xóa câu hỏi và mục?',
        'Việc xóa một mục cũng sẽ xóa các câu hỏi và câu trả lời trong mục đó.'
      )
      .closed.subscribe((x) => {
        if (x.event?.status == 'Y') {
          this.deleteBefore(seqNoSession)
        }
      });
    }

  }
  deleteBefore(seqNoSession:any)
  {
    var dataTemp = JSON.parse(JSON.stringify(this.questions));
    let tempQuestion = this.questions[seqNoSession];
    dataTemp = dataTemp.filter((x) => x.seqNo != seqNoSession);
    dataTemp.forEach((x, index) => {
      x.seqNo = index;
    });
    this.questions = dataTemp;
    this.change.detectChanges();
    let data = [...[tempQuestion], ...tempQuestion.children];
    this.SVServices.signalSave.next('saving');
    if (this.questions.length + 1 == seqNoSession + 1)
      this.setTimeoutDeleteData(
        tempQuestion.children.length > 0 ? data : [tempQuestion]
      );
    else
      this.setTimeoutDeleteData(
        tempQuestion.children.length > 0 ? data : [tempQuestion],
        this.questions
      );
  }

  deleteNoSession(seqNoSession, seqNoQuestion, recIDQuestion) {
    var data = JSON.parse(
      JSON.stringify(this.questions[seqNoSession].children)
    );
    let tempQuestion = this.questions[seqNoSession].children[seqNoQuestion];
    data = data.filter((x) => x.seqNo != seqNoQuestion);
    data.forEach((x, index) => {
      x.seqNo = index;
    });
    if (seqNoQuestion == 0) this.questions[seqNoSession].active = true;
    else data[seqNoQuestion - 1].active = true;
    this.questions[seqNoSession].children = data;
    this.SVServices.signalSave.next('saving');
    this.setTimeoutDeleteData([tempQuestion],this.questions[seqNoSession].children);
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
    var data = this.questions[indexSession].children[indexQuestion].answers;
    data.push(dataAnswerTemp);
    //this.questions[indexSession].children[indexQuestion]!.answers = data;
    this.questions[indexSession].children[indexQuestion]['other'] = true;
    this.SVServices.signalSave.next('saving');
    this.setTimeoutSaveData(
      [this.questions[indexSession].children[indexQuestion]],
      false
    );
  }

  copyCard(itemSession, itemQuestion, category) {
    if (category == 'S') this.copySession(itemSession);
    else this.copyNoSession(itemSession, itemQuestion);
  }

  copySession(itemSession) {
    let itemSessionNew = JSON.parse(JSON.stringify(itemSession));
    delete itemSessionNew.id;
    itemSessionNew.recID = this.generateGUID();
    var dataTemp = JSON.parse(JSON.stringify(this.questions));
    dataTemp[itemSession.seqNo].active = false;
    dataTemp.splice(itemSession.seqNo + 1, 0, itemSessionNew);
    dataTemp.forEach((x, index) => {
      x.seqNo = index;
    });
    this.questions = dataTemp;
    if (itemSessionNew.children && itemSessionNew.children.length > 0)
      itemSessionNew.children.forEach((x, index) => {
        x.seqNo = index;
        delete x.id;
        x.recID = this.generateGUID();
        x.parentID = itemSessionNew.recID;
        x.answers.forEach((z) => {
          delete z.id;
          z.recID = this.generateGUID();
        });
      });
    //Update lại seqNo cho questions
    itemSessionNew.seqNo = itemSession.seqNo + 1;
    let data = [...[itemSessionNew], ...itemSessionNew.children];
    this.SVServices.signalSave.next('saving');
    // Check nếu là session cuối cùng thì không phần update seqNo
    if (this.questions.length - 1 == itemSession.seqNo + 1) {
      this.setTimeoutSaveData(
        itemSessionNew.children.length > 0 ? data : [itemSessionNew],
        true
      );
    } else {
      this.setTimeoutSaveData(
        itemSessionNew.children.length > 0 ? data : [itemSessionNew],
        true,
        this.questions
      );
    }
    //Xử lí copy hình ảnh nếu có
    this.copyFileSession(itemSession, itemSessionNew);
  }

  copyFileSession(itemSession, itemSessionNew) {
    let lstUploadNew = [];
    if (itemSession.children.length > 0) {
      itemSession.children.forEach((x, indexS) => {
        //Clone lstUpdate của questions
        if (x.qPicture || x.category == 'V' || x.category == 'P') {
          this.lstEditIV.forEach((y) => {
            if (y.objectID == x.recID) {
              lstUploadNew.push(JSON.parse(JSON.stringify(y)));
            }
          });
          //update lại objectID cho lst của questions
          if (lstUploadNew.length > 0) {
            lstUploadNew.forEach((i) => {
              delete i['recID'];
              delete i['id'];
              i.storeType = '';
              if (i.objectID == x.recID)
                i.objectID = itemSessionNew.children[indexS].recID;
            });
          }
        }
        //Clone lstUpdate của answers
        if (x.answers.length > 0) {
          x.answers.forEach((z, indexA) => {
            if (z.hasPicture) {
              this.lstEditIV.forEach((i) => {
                if (i.objectID == z.recID) {
                  lstUploadNew.push(JSON.parse(JSON.stringify(i)));
                }
              });
            }
            //update lại objectID cho lst của answers
            if (lstUploadNew.length > 0) {
              lstUploadNew.forEach((x) => {
                delete x['recID'];
                delete x['id'];
                x.storeType = '';
                if (x.objectID == z.recID)
                  x.objectID =
                    itemSessionNew.children[indexS].answers[indexA].recID;
              });
            }
          });
        }
      });
    }
    this.lstEditIV = [...this.lstEditIV, ...lstUploadNew];
    this.SVServices.onSaveListFile(lstUploadNew).subscribe((res) => {});
  }

  copyNoSession(itemSession, itemQuestion) {
    var itemQuestionNew = JSON.parse(JSON.stringify(itemQuestion));
    this.generateGuid();
    delete itemQuestionNew.id;
    itemQuestionNew.recID = this.GUID;
    itemQuestionNew.seqNo = itemQuestion.seqNo + 1;
    itemQuestionNew.answers.forEach((z) => {
      delete z.id;
      z.recID = this.generateGUID();
    });
    var data = JSON.parse(
      JSON.stringify(this.questions[itemSession.seqNo].children)
    );
    data[itemQuestion.seqNo].active = false;
    data.splice(itemQuestionNew.seqNo + 1, 0, itemQuestionNew);
    data.forEach((x, index) => {
      x.seqNo = index;
      if (x.parentID == itemQuestion.recID) x.parentID = itemSession.recID;
    });
    this.questions[itemSession.seqNo].children = data;
    // Check nếu là session cuối cùng thì không phần update seqNo
    this.SVServices.signalSave.next('saving');
    if (
      itemQuestionNew.seqNo ==
      this.questions[itemSession.seqNo].children.length - 1
    )
      this.setTimeoutSaveData([itemQuestionNew], true);
    else this.setTimeoutSaveData([itemQuestionNew], true, data);
    this.copyFileNoSession(itemQuestion, itemQuestionNew);
  }

  copyFileNoSession(itemQuestion, itemQuestionNew) {
    let lstUploadNew = [];
    //Clone lstUpdate của questions
    if (
      itemQuestion.qPicture ||
      itemQuestion.category == 'V' ||
      itemQuestion.category == 'P'
    ) {
      this.lstEditIV.forEach((y) => {
        if (y.objectID == itemQuestion.recID) {
          lstUploadNew.push(JSON.parse(JSON.stringify(y)));
        }
      });
      //update lại objectID cho lst của questions
      if (lstUploadNew.length > 0) {
        lstUploadNew.forEach((i) => {
          delete i['recID'];
          delete i['id'];
          i.storeType = '';
          if (i.objectID == itemQuestion.recID)
            i.objectID = itemQuestionNew.recID;
        });
      }
    }
    //Clone lstUpdate của answers
    if (itemQuestion.answers.length > 0) {
      itemQuestion.answers.forEach((z, indexA) => {
        if (z.hasPicture) {
          this.lstEditIV.forEach((i) => {
            if (i.objectID == z.recID) {
              lstUploadNew.push(JSON.parse(JSON.stringify(i)));
            }
          });
        }
        //update lại objectID cho lst của answers
        if (lstUploadNew.length > 0) {
          lstUploadNew.forEach((x) => {
            delete x['recID'];
            delete x['id'];
            x.storeType = '';
            if (x.objectID == z.recID)
              x.objectID = itemQuestionNew.answers[indexA].recID;
          });
        }
      });
    }
    this.lstEditIV = [...this.lstEditIV, ...lstUploadNew];
    this.SVServices.onSaveListFile(lstUploadNew).subscribe((res) => {});
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
          this.popupUploadFile('P', 'upload', false, null, null, null, true);
          break;
        case 'LTN05':
          this.popupUploadFile('V', 'upload', false, null, null, null, true);
          break;
        case 'LTN06':
          this.addCard(this.itemActive, this.indexSessionA, 'S');
          break;
      }
    }
  }

  addQuestionOther() {
    var option = new DialogModel();
    option.DataService = this.dataService;
    option.FormModel = this.formModel;
    var dialog = this.callfc.openForm(
      TemplateSurveyOtherComponent,
      '',
      1000,
      700,
      '',
      '',
      '',
      option
    );
    dialog.closed.subscribe((res) => {
      if (res.event) {
        var dataQuestion = new Array();
        if (res.event.recID == this.recID) dataQuestion = this.questions;
        else {
          this.SVServices.loadTemplateData(res.event.recID).subscribe(
            (res: any) => {
              if (res[0] && res[0].length > 0) {
                dataQuestion = this.getHierarchy(res[0], res[1]);
              } else {
                dataQuestion = [
                  {
                    seqNo: 0,
                    question: 'Mẫu không có tiêu đề',
                    answers: null,
                    other: false,
                    mandatory: false,
                    answerType: null,
                    category: 'S',
                    children: [
                      {
                        seqNo: 0,
                        question: 'Tiêu đề câu hỏi',
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
            }
          );
        }
        let myInterval = setInterval(() => {
          if (dataQuestion && dataQuestion.length > 0) {
            clearInterval(myInterval);
            var obj = { dataSurvey: res.event, dataQuestion: dataQuestion };
            var option = new SidebarModel();
            option.DataService = this.dataService;
            option.FormModel = this.formModel;
            var dialog = this.callfc.openSide(
              PopupQuestionOtherComponent,
              obj,
              option
            );
            dialog.closed.subscribe((res) => {
              if (res.event.changeTemplate == true) {
                // Choose other template
                this.addQuestionOther();
              } else if (res.event.changeTemplate == false) {
                var result = this.SVServices.getDataQuestionOther(
                  res.event.dataSession,
                  res.event.dataQuestion
                );
                if (result) {
                  if (result.dataSession && result.dataSession.length > 0) {
                    result.dataSession.forEach((x) => {
                      delete x.id;
                      delete x?.check;
                      x.recID = this.generateGUID();
                      x.children.forEach((y) => {
                        delete y.id;
                        delete y?.check;
                        y.recID = this.generateGUID();
                      });
                    });
                    this.addTemplateCard(
                      this.itemActive,
                      this.indexSessionA,
                      result.dataSession,
                      'S'
                    );
                  }
                  if (result.dataQuestion && result.dataQuestion.length > 0) {
                    result.dataQuestion.forEach((x) => {
                      delete x.id;
                      delete x?.check;
                      x.recID = this.generateGUID();
                    });
                    this.addTemplateCard(
                      this.itemActive,
                      this.indexSessionA,
                      result.dataQuestion,
                      'Q'
                    );
                  }
                }
              }
            });
          }
        }, 200);
      }
    });
  }

  popupUploadFile(
    typeFile,
    modeFile,
    inline = false,
    seqNoSession = null,
    seqNoQuestion = null,
    itemAnswer = null,
    isModeAdd = false
  ) {
    var obj = {
      functionList: this.functionList,
      typeFile: typeFile,
      modeFile: modeFile,
      data: this.itemActive,
      inline: inline,
      itemAnswer: itemAnswer,
      referType: this.recID,
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
        if (inline) {
          let myInterval = setInterval(() => {
            if (this.questions && this.questions.length > 0) {
              clearInterval(myInterval);
              const t = this;
              if (itemAnswer) {
                t.questions[seqNoSession].children[seqNoQuestion].answers[
                  itemAnswer.seqNo
                ].hasPicture = true;
                // let index = t.questions.findIndex(x => x.recID == seqNoSession);
                // t.questions[index]
                t.questions[seqNoSession].children[seqNoQuestion].APicture =
                  true;
              } else {
                if (modeFile == 'change') {
                  t.lstEditIV = t.lstEditIV.filter(
                    (x) =>
                      x.objectID !=
                      t.questions[seqNoSession]?.children[seqNoQuestion].recID
                  );
                }
                this.questions[seqNoSession].children[seqNoQuestion].qPicture =
                  true;
              }
              for (var i = 0; i < res.event[0].dataUpload.length; i++) {
                this.lstEditIV.push(res.event[0].dataUpload[i]);
              }
              this.lstEditIV = [...this.lstEditIV];
              this.SVServices.signalSave.next('saving');
              this.setTimeoutSaveData(
                this.questions[seqNoSession].children[seqNoQuestion],
                false
              );
              this.change.detectChanges();
            }
          }, 200);
        } else {
          this.uploadFile(
            this.indexSessionA,
            this.itemActive,
            res.event?.dataUpload,
            res.event?.referType,
            modeFile,
            res.event?.youtube,
            res.event?.videoID,
            isModeAdd
          );
        }
      }
    });
  }

  updateOneFieldA(seqNoSession, seqNoQuestion, seqNoAnswer, fieldName, data) {
    this.questions[seqNoSession].children[seqNoQuestion].answers[seqNoAnswer][
      fieldName
    ] = data;
  }

  deleteFile(seqNoSession, itemQuestion, objectID) {
    this.questions[seqNoSession].children.splice(this.itemActive.seqNo, 1);
    this.questions[seqNoSession].children.forEach(
      (x, index) => (x.seqNo = index)
    );
    if (!itemQuestion?.url || !itemQuestion?.videoID) {
      this.SVServices.deleteFile(
        objectID,
        this.functionList.entityName
      ).subscribe((res) => {
        if (res)
          this.lstEditIV = this.lstEditIV.filter((x) => x.objectID != objectID);
      });
    }
  }

  delFileInline(objectID) {
    this.SVServices.deleteFile(
      objectID,
      this.functionList.entityName
    ).subscribe((res) => {
      if (res) {
        this.lstEditIV = this.lstEditIV.filter((x) => x.objectID != objectID);
      }
    });
  }

  GUID: any;
  generateGuid() {
    this.GUID = this.generateGUID();
  }

  generateGUID() {
    return Util.uid();
  }

  addCard(itemActive, seqNoSession = null, category) {
    if (itemActive) {
      if (category == 'S') this.addSession(itemActive, seqNoSession);
      else this.addNoSession(itemActive, seqNoSession, category);
    } else if (
      this.questions[0].children &&
      this.questions[0].children.length < 1
    ) {
      this.addNewQuestion();
    }
  }
  addNewQuestion() {
    this.questions[0].children = [];
    var newQ = {
      seqNo: 0,
      question: 'Tiêu đề câu hỏi',
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
      parentID: this.questions[0].recID,
    };
    this.questions[0].children.push(newQ);
    this.addNewQ(this.questions[0].children);
  }
  addTemplateCard(itemActive, seqNoSession, data, category) {
    if (category == 'S') this.addTemplateSession(seqNoSession, data);
    else this.addTemplateQuestion(itemActive, seqNoSession, data);
  }

  addTemplateSession(seqNoSession, data) {
    let lstDataAdd = data;
    data.forEach((x, index) => {
      this.questions.splice(seqNoSession + index + 1, 0, x);
      x.children.forEach((y) => {
        y.parentID = x.recID;
        lstDataAdd.push(y);
      });
    });
    this.questions.forEach((x, index) => (x.seqNo = index));
    console.log('check addTemplateSession', this.questions);
    this.change.detectChanges();
    this.SVServices.signalSave.next('saving');
    this.setTimeoutSaveData(lstDataAdd, true, this.questions);
  }

  addTemplateQuestion(itemActive, seqNoSession, data) {
    data.forEach((x, index) => {
      this.questions[seqNoSession].children.splice(
        itemActive.seqNo + index + 1,
        0,
        x
      );
    });
    this.questions[seqNoSession].children.forEach(
      (x, index) => (x.seqNo = index)
    );
    var indexLast = this.questions[seqNoSession].children.length - 1;
    this.questions[seqNoSession].children[itemActive.seqNo].active = false;
    this.questions[seqNoSession].children[indexLast].active = true;
    this.itemActive = this.questions[seqNoSession].children[indexLast];
    this.clickToScroll(
      seqNoSession,
      this.questions[seqNoSession].children[indexLast].recID,
      'Q'
    );
    console.log('check addTemplateQuestion', this.questions);
    this.change.detectChanges();
    // this.SVServices.signalSave.next('saving');
    // this.setTimeoutSaveData(
    //   [data],
    //   true,
    //   this.questions[seqNoSession].children
    // );
  }

  addSession(itemActive, seqNoSession) {
    this.generateGuid();
    var tempQuestion = JSON.parse(JSON.stringify(itemActive));
    tempQuestion.answers = null;
    tempQuestion.answerType = null;
    tempQuestion.question = 'Mục không có tiêu đề';
    tempQuestion.seqNo = seqNoSession + 1;
    tempQuestion.category = 'S';
    tempQuestion.recID = this.GUID;
    tempQuestion.parentID = null;
    this.questions.splice(seqNoSession + 1, 0, tempQuestion);
    this.questions.forEach((x, index) => (x.seqNo = index));
    this.questions[seqNoSession].active = false;
    this.questions[seqNoSession + 1].active = true;
    this.itemActive = this.questions[seqNoSession + 1];
    var lstMain = this.questions[seqNoSession].children;
    if (itemActive.category == 'S') {
      this.questions[seqNoSession + 1].children =
        this.questions[seqNoSession].children;
      this.questions[seqNoSession].children = [];
    } else {
      var lstUp = [];
      var lstDown = [];
      // lstUp = lstMain.slice(0, seqNoSession + 1);
      // lstDown = lstMain.slice(seqNoSession + 1, lstMain.length);

      //Tách thành lst của session trên và sesion dưới
      lstUp = lstMain.slice(0, itemActive.seqNo + 1);
      lstDown = lstMain.slice(itemActive.seqNo + 1, lstMain.length);
      //Update lại parentID cho đúng với session mới tạo
      lstUp.forEach((x) => (x.parentID = this.questions[seqNoSession].recID));

      if (lstDown.length > 0) {
        for (var i = 0; i < lstDown.length; i++) {
          lstDown[i].parentID = this.questions[seqNoSession + 1].recID;
          lstDown[i].seqNo = i;
        }
      }

      this.questions[seqNoSession + 1]['children'] = lstDown;
      this.questions[seqNoSession]['children'] = lstUp;
    }
    this.clickToScroll(seqNoSession + 1, this.GUID, 'S');
    this.SVServices.signalSave.next('saving');
    if (this.questions.length - 1 == seqNoSession + 1) {
      if (itemActive.category == 'Q')
        this.setTimeoutSaveData([tempQuestion], true, lstDown);
      else this.setTimeoutSaveData([tempQuestion], true);
    } else if (this.questions.length - 1 != seqNoSession + 1) {
      this.setTimeoutSaveData([tempQuestion], true, this.questions);
    }
  }

  lstDataAdd: any = [];
  lstDataDelete: any = [];
  addNoSession(itemActive, seqNoSession, category) {
    var dataAnswerTemp = {
      seqNo: 0,
      answer: 'Tùy chọn 1',
      other: false,
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
      tempQuestion.question = 'Tiêu đề câu hỏi';
    }
    tempQuestion.seqNo = itemActive.category == 'S' ? 0 : itemActive.seqNo + 1;
    tempQuestion.category = category;
    tempQuestion.recID = this.generateGUID();
    tempQuestion.parentID = this.questions[seqNoSession].recID;
    tempQuestion.other = false;
    delete tempQuestion.id;

    this.questions[seqNoSession].children.splice(
      itemActive.category == 'S' ? 0 : itemActive.seqNo + 1,
      0,
      tempQuestion
    );
    this.questions[seqNoSession].children.forEach(
      (x, index) => (x.seqNo = index)
    );
    this.questions[seqNoSession].transID = this.recID;
    this.SVServices.signalSave.next('saving');
    this.setTimeoutSaveData(
      [tempQuestion],
      true,
      this.questions[seqNoSession].children
    );
    this.GUID = tempQuestion.recID;
    if (itemActive.category == 'S') this.questions[seqNoSession].active = false;
    else this.questions[seqNoSession].children[itemActive.seqNo].active = false;
    this.questions[seqNoSession].children[
      itemActive.category == 'S' ? 0 : itemActive.seqNo + 1
    ].active = true;

    this.itemActive =
      this.questions[seqNoSession].children[
        itemActive.category == 'S' ? 0 : itemActive.seqNo + 1
      ];
    this.clickToScroll(seqNoSession, this.GUID, category);
  }

  importQuestion(dataQuestion) {}

  addTitle(dataQuestion) {}

  uploadFile(
    seqNoSession,
    dataQuestion,
    data,
    referType,
    modeFile,
    youtube,
    videoID,
    isModeAdd
  ) {
    if (dataQuestion && modeFile == 'upload') {
      var tempQuestion = JSON.parse(JSON.stringify(dataQuestion));
      tempQuestion.seqNo = dataQuestion.seqNo + 1;
      tempQuestion.answerType = null;
      tempQuestion.answers = null;
      tempQuestion.question = null;
      tempQuestion.category = referType;
      tempQuestion.qPicture = referType == 'image' ? true : false;
      tempQuestion.recID = !youtube ? data[0].objectID : this.generateGUID();
      tempQuestion.url = youtube ? data?.avatar : null;
      tempQuestion.videoID = videoID;
      if (dataQuestion.category == 'S')
        tempQuestion.parentID = dataQuestion.recID;
      this.questions[seqNoSession].children.splice(
        dataQuestion.seqNo + 1,
        0,
        tempQuestion
      );
      this.questions[seqNoSession].children.forEach(
        (x, index) => (x.seqNo = index)
      );
      //active card video, picture này để phát triển sau, chưa ưu tiên
      // if(dataQuestion.category == 'S')
      //   this.questions[seqNoSession].active = false;
      // else
      //   this.questions[seqNoSession].children[dataQuestion.seqNo].active = false;
      // this.questions[seqNoSession].children[dataQuestion.seqNo + 1].active =
      //   true;
      //active card video, picture này để phát triển sau, chưa ưu tiên

      if (dataQuestion.category == 'S')
        this.itemActive = this.questions[seqNoSession].children[0];
      else
        this.itemActive =
          this.questions[seqNoSession].children[dataQuestion.seqNo + 1];
      // this.clickToScroll(dataQuestion.seqNo + 1);
    } else if (modeFile == 'change' && youtube) {
      this.questions[seqNoSession].children[dataQuestion.seqNo + 1].videoID =
        videoID;
      this.questions[seqNoSession].children[dataQuestion.seqNo + 1].url = data;
    } else if (modeFile == 'change') {
      this.lstEditIV = this.lstEditIV.filter(
        (x) =>
          x.objectID !=
          this.questions[seqNoSession].children[dataQuestion.seqNo].recID
      );
      this.questions[seqNoSession].children[dataQuestion.seqNo].recID =
        data[0].objectID;
      this.setTimeoutSaveData(
        [this.questions[seqNoSession].children[dataQuestion.seqNo]],
        isModeAdd
      );
    }

    if (!youtube) {
      data[0]['recID'] = data[0].objectID;
      if (referType == 'V' && !data[0]?.srcVideo) {
        var src = `${environment.urlUpload}/${data[0].urlPath}`;
        data[0]['srcVideo'] = src;
      }
      this.lstEditIV.push(data[0]);
    }
    this.SVServices.signalSave.next('saving');
    this.setTimeoutSaveData(
      dataQuestion.category == 'S'
        ? [this.questions[seqNoSession].children[0]]
        : [this.questions[seqNoSession].children[dataQuestion.seqNo + 1]],
      isModeAdd,
      this.questions[seqNoSession].children
    );
    console.log('check data file', this.lstEditIV);
    console.log('check data after uploadFile', this.questions);
    this.change.detectChanges();
  }

  getUrlImageOfVideo(ID) {
    var url = `https://img.youtube.com/vi/${ID}/hqdefault.jpg`;
    return url;
  }

  uploadVideo(dataQuestion) {}

  clickQuestionMF(seqNoSession, itemQuestion, answerType ) {
    this.generateGuid();
    var recID = JSON.parse(JSON.stringify(this.GUID));
    if (answerType) {
      this.defaultMoreFunc = this.listMoreFunc.filter(
        (x) => x.id == answerType
      )[0];
      var data = this.questions[seqNoSession].children[itemQuestion.seqNo];
      data.answerType = answerType;
      if (
        answerType == 'O' ||
        answerType == 'C' ||
        answerType == 'L' ||
        answerType == 'R' ||
        answerType == 'T' ||
        answerType == 'T2' ||
        answerType == 'D' ||
        answerType == 'H'
      ) {
        // if (itemQuestion.answerType != 'O' && itemQuestion.answerType != 'C') {
        //   data.answers = new Array();
        //   let dataAnswerTemp = {
        //     recID: recID,
        //     seqNo: 0,
        //     answer: 'Tùy chọn 1',
        //     other: false,
        //   };
        //   data.answers.push(dataAnswerTemp);
        // }
        if (
          answerType != 'O' &&
          answerType != 'C' &&
          answerType != 'L' &&
          answerType != 'R'
        ) {
          data.answers = new Array();
          let dataAnswerTemp = {
            recID: recID,
            seqNo: 0,
            answer: 'Tùy chọn 1',
            other: false,
          };
          data.answers.push(dataAnswerTemp);
        }

        if (answerType == 'R') {
          data.answers = new Array();
          let dataAnswerTemp = {
            recID: recID,
            seqNo: 0,
            answer: '1/5//',
            other: false,
          };
          data.answers.push(dataAnswerTemp);
        }

        //Xóa File
        if (answerType != 'O' && answerType != 'C') {
          this.lstEditIV = this.lstEditIV.filter(
            (x) => x.objectID != itemQuestion.recID
          );
          this.SVServices.deleteFilesByContainRefer(
            itemQuestion.recID
          ).subscribe();
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
        } else {
          itemQuestion.answers[0].answer = 'Hàng 1';
        }
      }

      //Lọc câu hỏi "khác"
      if (answerType == 'L' && data.answers && data.answers.length > 0) {
        data.answers = data.answers.filter((x) => !x.other);
        data.other = false;
      }
      //this.questions[seqNoSession].children[itemQuestion.seqNo] = data;
      this.change.detectChanges();
      this.SVServices.signalSave.next('saving');
      this.setTimeoutSaveData(
        this.questions[seqNoSession].children[itemQuestion.seqNo],
        false
      );
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

    this.SVServices.signalSave.next('saving');
    this.setTimeoutSaveData(
      this.questions[seqNoSession].children[seqNoQuestion],
      false
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

    this.SVServices.signalSave.next('saving');
    this.setTimeoutSaveData(
      this.questions[seqNoSession].children[seqNoQuestion],
      false
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
      this.amountOfRow -= 1;
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

    this.SVServices.signalSave.next('saving');
    this.setTimeoutSaveData(
      this.questions[seqNoSession].children[seqNoQuestion],
      false
    );
  }

  changeRating(
    value,
    type,
    seqNoQuestion = null,
    itemQuestion = null,
    itemAnswer = null
  ) {
    var valueFrom = '1';
    var valueTo = '5';
    var valueRFrom = '';
    var valueRTo = '';

    var split = itemAnswer.answer.split('/');
    valueFrom = split[0];
    valueTo = split[1];
    valueRFrom = split[2];
    valueRTo = split[3];

    if (type == 'FROM') valueFrom = value;
    else if (type == 'TO') valueTo = value;
    else if (type == 'RFROM') valueRFrom = value?.data;
    else if (type == 'RTO') valueRTo = value?.data;

    var data = {
      data: valueFrom + '/' + valueTo + '/' + valueRFrom + '/' + valueRTo,
      field: 'answer',
    };
    this.valueChangeAnswer(data, seqNoQuestion, itemQuestion, itemAnswer);
  }

  sortSession() {
    var obj = {
      data: this.questions,
      transID: this.recID,
    };
    var dialog = this.callfc.openForm(
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
    this.questions[seqNoSession].children[seqNoQuestion].hideComment =
      !this.questions[seqNoSession].children[seqNoQuestion].hideComment;
  }

  getSrcImage(data) {
    if (data?.avatar) return data?.avatar;
    return environment.urlUpload + '/' + data?.pathDisk;
  }

  getSrcVideo(data) {
    var result: any;
    this.SVServices.getFileByObjectID(data.recID).subscribe((res: any) => {
      if (res)
        result = data['srcVideo'] = `${environment.urlUpload}/${res.pathDisk}`;
    });
    return result;
  }

  alignImg(seqNoSession, seqNoQuestion, typeTrue, typeFalse, typeFalse1) {
    this.questions[seqNoSession].children[seqNoQuestion][typeTrue] = true;
    this.questions[seqNoSession].children[seqNoQuestion][typeFalse] = false;
    this.questions[seqNoSession].children[seqNoQuestion][typeFalse1] = false;
  }

  showAnswer(seqNoSession, seqNoQuestion) {
    this.questions[seqNoSession].children[seqNoQuestion]['showAnswer'] =
      !this.questions[seqNoSession].children[seqNoQuestion]['showAnswer'];
  }

  valueChangeShowAnswer(event, seqNoSession, seqNoQuestion, seqNoAnswer) {
    if (event.data == true) {
      var dataTemp = JSON.parse(
        JSON.stringify(
          this.questions[seqNoSession].children[seqNoQuestion].answers[
            seqNoAnswer
          ]
        )
      );
      var obj: any;
      if (
        this.questions[seqNoSession].children[seqNoQuestion].category != 'O2' &&
        this.questions[seqNoSession].children[seqNoQuestion].category != 'C2'
      ) {
        obj = {
          seqNo: dataTemp.seqNo,
          answer: dataTemp.answer,
          other: dataTemp.other,
          columnNo: 0,
        };
      }
      this.respondResults.push(obj);
      this.respondResults = this.SVServices.getUniqueListBy(
        this.respondResults,
        'seqNo'
      );
    } else {
      var index = this.respondResults.findIndex((x) => x.seqNo == seqNoAnswer);
      this.respondResults.splice(index, 1);
    }
    console.log('check respondResults', this.respondResults);
  }

  valueChangeQuestion(event: any, seqNoSession, seqNoQuestion) {
    if (event) {
      var dataTemp = JSON.parse(JSON.stringify(this.questions[seqNoSession]));
      dataTemp.children[seqNoQuestion][event.field] = event.data;
    }
    console.log('check valueChangeQuestion', dataTemp);
  }

  saveDataTimeout = new Map();
  setTimeoutSaveData(data, isModeAdd, list = null) {
    let checkArray = Array.isArray(data);
    if (checkArray) this.lstDataAdd = [...this.lstDataAdd, ...data];
    else this.lstDataAdd = [...this.lstDataAdd, ...[data]];
    clearTimeout(this.saveDataTimeout?.get(this.lstDataAdd[0].recID));
    this.saveDataTimeout?.delete(
      this.saveDataTimeout?.get(this.lstDataAdd[0].recID)
    );
    this.saveDataTimeout.set(
      this.lstDataAdd[0].recID,
      setTimeout(
        this.onSave.bind(this, this.recID, this.lstDataAdd, isModeAdd, list),
        2000
      )
    );
  }

  saveDataAnswerTimeout = new Map();
  setTimeoutSaveDataAnswer(data, isModeAdd, dataHasPicture = null) {
    clearTimeout(this.saveDataTimeout?.get(data[0].recID));
    this.saveDataTimeout?.delete(this.saveDataTimeout?.get(data[0].recID));
    this.saveDataTimeout.set(
      data[0].recID,
      setTimeout(
        this.onSave.bind(
          this,
          this.recID,
          data,
          isModeAdd,
          null,
          dataHasPicture
        ),
        2000
      )
    );
  }

  deleteDataTimeout = new Map();
  setTimeoutDeleteData(data, listUpdate = null) {
    this.lstDataDelete = [...this.lstDataDelete, ...data];
    clearTimeout(this.deleteDataTimeout?.get(this.lstDataDelete[0].recID));
    this.deleteDataTimeout?.delete(
      this.deleteDataTimeout?.get(this.lstDataDelete[0].recID)
    );
    this.deleteDataTimeout.set(
      this.lstDataDelete[0].recID,
      setTimeout(this.onDelete.bind(this, this.lstDataDelete, listUpdate), 2000)
    );
  }

  onSave(transID, data, isModeAdd, listUpdate, dataAnswer = null) {
    if (isModeAdd) {
      let isArr = Array.isArray(data);
      if (isArr) data.forEach((x) => delete x.id);
      else delete data.id;
    }
    this.api
      .execSv('SV', 'ERM.Business.SV', 'QuestionsBusiness', 'SaveAsync', [
        transID,
        data,
        isModeAdd,
        listUpdate,
      ])
      .subscribe((res) => {
        if (res) {
          this.SVServices.signalSave.next('done');
          if (dataAnswer) {
            if (dataAnswer.hasPicture) this.delFileInline(dataAnswer.recID);
          }
        } else this.notification.alertCode('');
      });
    this.lstDataAdd = [];
  }

  onDelete(data, listUpdate) {
    this.api
      .execSv('SV', 'ERM.Business.SV', 'QuestionsBusiness', 'DeleteAsync', [
        data,
        listUpdate,
      ])
      .subscribe((res) => {
        if (res) {
          this.SVServices.signalSave.next('done');
          data.forEach((x) => {
            if (x.answers && x.answers.length > 0) this.delFileInline(x.recID);
          });
        } else this.notification.alertCode('');
      });
    this.lstDataDelete = [];
  }

  valueChangeSessionEJS(e, itemSession, field) {
    if (e && e != itemSession[field]) {
      let dataTemp = JSON.parse(JSON.stringify(this.questions));
      dataTemp[itemSession.seqNo][field] = e;
      this.SVServices.signalSave.next('saving');
      this.setTimeoutSaveData([dataTemp[itemSession.seqNo]], false);
    }
  }

  valueChangeQuestionEJS(e, itemSession, itemQuestion, field) {
    if (e && e != itemQuestion[field]) {
      this.questions[itemSession.seqNo].children[itemQuestion.seqNo][field] = e;
      this.SVServices.signalSave.next('saving');
      this.setTimeoutSaveData(
        [this.questions[itemSession.seqNo].children[itemQuestion.seqNo]],
        false
      );
    }
  }
  valueChangeAnswer(e, seqNoSession, itemQuestion, itemAnswer) {
    if (e.data && e.data != itemAnswer[e.field]) {
      // let dataTemp = JSON.parse(JSON.stringify(this.questions));
      // dataTemp[seqNoSession].children[itemQuestion.seqNo].answers[
      //   itemAnswer.seqNo
      // ][e.field] = e.data;
      this.questions[seqNoSession].children[itemQuestion.seqNo].answers[
        itemAnswer.seqNo
      ][e.field] = e.data;
      this.SVServices.signalSave.next('saving');
      this.setTimeoutSaveDataAnswer(
        [this.questions[seqNoSession].children[itemQuestion.seqNo]],
        false
      );
    }
  }

  valueChangeAnswerMatrix(seqNoSession, itemQuestion, itemAnswer, data)
  {
    var index =  this.questions[seqNoSession].children[itemQuestion.seqNo].answers.findIndex(x=>x.seqNo == itemAnswer.seqNo && x.isColumn == itemAnswer.isColumn);
    this.questions[seqNoSession].children[itemQuestion.seqNo].answers[index]['answer'] = data;
    this.SVServices.signalSave.next('saving');
    this.setTimeoutSaveDataAnswer(
      [this.questions[seqNoSession].children[itemQuestion.seqNo]],
      false
    );
  }

  convertAnswer(answer: any, type = null) {
    if (answer) {
      var spilts = answer.split('/');
      if (spilts && spilts.length > 0) {
        if (type == 'l') return spilts[2];
        else if (type == 'r') return spilts[3];
        else if (type == 'f') return spilts[0] ? spilts[0] : '1';
        else if (type == 't') return spilts[1] ? spilts[1] : '5';
        else {
          var arr = [];
          for (var i = Number(spilts[0]); i <= spilts[1]; i++) {
            arr.push(i);
          }
          return arr;
        }
      }
      return null;
    }
    return null;
  }
  // onUpdateList(data) {
  //   return this.api.execSv(
  //     'SV',
  //     'ERM.Business.SV',
  //     'QuestionsBusiness',
  //     'UpdateListAsync',
  //     [data]
  //   );
  // }
  updateAvatar() {
    this.attachment.uploadFile();
  }
  fileAdded(e: any) {
    if (e?.pathDisk) {
      this.avatar = this.shareService.getThumbByUrl(e?.pathDisk, 120);
      if (typeof this.dataSV.settings == 'string')
        this.dataSV.settings = JSON.parse(this.dataSV.settings);
      this.dataSV.settings.image = this.shareService.getThumbByUrl(
        e?.pathDisk,
        120
      );
      this.SVServices.signalSave.next('saving');
      this.dataSV.settings = JSON.stringify(this.dataSV.settings);
      this.changeAvatar.emit(this.dataSV.settings);
      this.SVServices.updateSV(this.dataSV.recID, this.dataSV).subscribe(
        (res) => {
          if (res) {
            this.SVServices.signalSave.next('done');
          }
        }
      );
    }
  }
}
class GuId {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
