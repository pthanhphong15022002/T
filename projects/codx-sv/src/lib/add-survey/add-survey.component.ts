import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Injector,
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
import { UIComponent, ViewModel, ViewType } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { SV_Surveys } from '../model/SV_Surveys';

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
  MODE_IMAGE_VIDEO = 'VIEW';
  lstEditIV: any = new Array();
  lstViewIV: any = new Array();
  @ViewChild('ATM_Image') ATM_Image: AttachmentComponent;
  constructor(inject: Injector, private change: ChangeDetectorRef) {
    super(inject);
    this.questions = [
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
        answerType: 'L',
        category: 'Q',
      },
      {
        seqNo: 1,
        question: 'Câu hỏi 2',
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
        answerType: 'L',
        category: 'Q',
      },
    ];
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

  add() {
    this.surveys.title = 'Khảo sát địa điểm team building';
    this.surveys.memo = 'Mẫu không có mô tả';
    this.api
      .exec('ERM.Business.SV', 'SurveysBusiness', 'SaveAsync', [
        this.surveys,
        this.formats,
        this.isModeAdd,
      ])
      .subscribe((res) => {
        if (res) {
        }
      });
  }

  itemActive: any;
  clickToScroll(seqNo) {
    var html = document.getElementById(`card-survey-${seqNo}`);
    var htmlE = html as HTMLElement;
    var htmlMF = document.querySelector('.moreFC');
    if (htmlMF)
      htmlMF.setAttribute('style', `top: calc(${htmlE?.offsetTop}px - 151px);`);
    this.activeCard(seqNo);
  }

  activeCard(seqNo) {
    // this.questions[seqNo]['active'] = true;
    // this.questions.forEach(x => {
    //   if(x.seqNo == seqNo) x['active'] = true;
    //   else x['active'] = false;
    // })
    this.questions.forEach((x) => {
      if (x['active'] == true) x['active'] = false;
      if (x.seqNo == seqNo) {
        x['active'] = true;
        this.itemActive = x;
      }
    });
  }

  addAnswer(dataQuestion) {
    this.questions[dataQuestion.seqNo]?.answers.filter((x) => x.other == false);
    var seqNo = this.questions[dataQuestion.seqNo]?.answers.length;
    var dataAnswerTemp = {
      seqNo: seqNo,
      answer: `Tùy chọn ${seqNo + 1}`,
      other: false,
      isColumn: false,
      hasPicture: false,
    };
    var index = this.questions[dataQuestion.seqNo].answers.findIndex(
      (x) => x.other == true
    );
    if (index >= 0) {
      var dataotherTemp = {
        seqNo: seqNo - 1,
        answer: `Tùy chọn ${seqNo}`,
        other: false,
        isColumn: false,
        hasPicture: false,
      };
      this.questions[dataQuestion.seqNo].answers.splice(
        seqNo - 1,
        0,
        dataotherTemp
      );
      this.questions[dataQuestion.seqNo].answers[index + 1].seqNo = seqNo;
    } else this.questions[dataQuestion.seqNo].answers.push(dataAnswerTemp);
  }

  deleteAnswer(dataQuestion, dataAnswer) {
    var data = JSON.parse(
      JSON.stringify(this.questions[dataQuestion.seqNo]?.answers)
    );
    data = data.filter((x) => x.seqNo != dataAnswer.seqNo);
    data.forEach((x, index) => {
      x.seqNo = index;
    });
    this.questions[dataQuestion.seqNo]!.answers = data;
    if (dataAnswer.other) this.questions[dataQuestion.seqNo].other = true;
  }

  deleteQuestion(dataQuestion) {
    var data = JSON.parse(JSON.stringify(this.questions));
    data = data.filter((x) => x.seqNo != dataQuestion.seqNo);
    data.forEach((x, index) => {
      x.seqNo = index;
    });
    if (dataQuestion.seqNo == 0) dataQuestion.seqNo = 1;
    data[dataQuestion.seqNo - 1].active = true;
    this.questions = data;
  }

  addOtherAnswer(dataQuestion) {
    var seqNo = this.questions[dataQuestion.seqNo]?.answers?.length;
    var dataAnswerTemp = {
      seqNo: seqNo,
      answer: '',
      other: true,
      isColumn: false,
      hasPicture: false,
    };
    var data = JSON.parse(
      JSON.stringify(this.questions[dataQuestion.seqNo]?.answers)
    );
    data.push(dataAnswerTemp);
    this.questions[dataQuestion.seqNo]!.answers = data;
    this.questions[dataQuestion.seqNo]['other'] = false;
  }

  copyQuestion(dataQuestion) {
    var data = JSON.parse(JSON.stringify(this.questions));
    data[dataQuestion.seqNo].active = false;
    data.splice(dataQuestion.seqNo + 1, 0, dataQuestion);
    data.forEach((x, index) => {
      x.seqNo = index;
    });
    this.questions = data;
  }

  clickMF(functionID, eleAttachment = null) {
    if (functionID) {
      switch (functionID) {
        case 'LTN01':
          this.addQuestion(this.itemActive);
          break;
        case 'LTN02':
          break;
        case 'LTN03':
          break;
        case 'LTN04':
          this.uploadFileImage(eleAttachment);
          break;
        case 'LTN05':
          break;
        case 'LTN06':
          break;
      }
    }
  }

  uploadFileImage(attachmentEle) {
    if (attachmentEle) this.ATM_Image = attachmentEle;
    if (this.ATM_Image) this.ATM_Image.uploadFile();
  }

  async selectedImage(e, attachmentEle) {
    let obj = JSON.parse(JSON.stringify(this.questions));
    this.generateGuid();
    let recID = JSON.parse(JSON.stringify(this.guidID));
    obj[this.itemActive.seqNo].recID = recID;
    e.data[0].objectID = recID;
    let files = e.data;
    // up file
    if (files.length > 0) {
      files.map((dt: any) => {
        if (dt.mimeType.indexOf('image') >= 0) {
          dt['referType'] = this.REFER_TYPE.IMAGE;
        } else if (dt.mimeType.indexOf('video') >= 0) {
          dt['referType'] = this.REFER_TYPE.VIDEO;
        } else {
          dt['referType'] = this.REFER_TYPE.APPLICATION;
        }
      });
      debugger;
      // let lstIVTemp = JSON.parse(JSON.stringify(this.lstEditIV));
      if (this.lstViewIV.length > 0) {
        if (this.MODE_IMAGE_VIDEO == 'VIEW') this.lstEditIV = this.lstViewIV;
        this.lstEditIV.push(files[0]);
      } else this.lstEditIV.push(files[0]);
    }
    if (files) {
      // this.ATM_Image.objectId = recID;
      this.ATM_Image.fileUploadList = files;
    }
    (await this.ATM_Image.saveFilesObservable()).subscribe((result: any) => {
      if (result) {
        debugger;
        this.MODE_IMAGE_VIDEO = 'EDIT';
        this.change.detectChanges();
        this.uploadImage(this.itemActive, attachmentEle);
      }
    });
    console.log('check listEdit', this.lstEditIV);
  }

  guidID: any;
  generateGuid() {
    var d = new Date().getTime(); //Timestamp
    var d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0; //Time in microseconds since page-load or 0 if unsupported
    this.guidID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
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

  addQuestion(dataQuestion) {
    if (dataQuestion) {
      var dataAnswerTemp = {
        seqNo: 0,
        answer: 'Tùy chọn 1',
        other: true,
        isColumn: false,
        hasPicture: false,
      };
      var tempQuestion = JSON.parse(JSON.stringify(dataQuestion));
      tempQuestion.seqNo = dataQuestion.seqNo + 1;
      tempQuestion.answers = dataAnswerTemp;
      tempQuestion.answerType = 'L';
      tempQuestion.question = `Câu hỏi`;
      this.questions.splice(dataQuestion.seqNo + 1, 0, tempQuestion);
      this.questions.forEach((x, index) => (x.seqNo = index));
      this.questions[dataQuestion.seqNo].active = false;
      this.questions[dataQuestion.seqNo + 1].active = true;
      this.itemActive = this.questions[dataQuestion.seqNo + 1];
      this.clickToScroll(dataQuestion.seqNo + 1);
    }
  }

  importQuestion(dataQuestion) {}

  addTitle(dataQuestion) {}

  uploadImage(dataQuestion, eleAttachment) {
    if (dataQuestion) {
      var tempQuestion = JSON.parse(JSON.stringify(dataQuestion));
      tempQuestion.seqNo = dataQuestion.seqNo + 1;
      tempQuestion.answerType = null;
      tempQuestion.question = null;
      tempQuestion.category = 'P';
      tempQuestion.recID = this.guidID;
      this.questions.splice(dataQuestion.seqNo + 1, 0, tempQuestion);
      this.questions.forEach((x, index) => (x.seqNo = index));
      this.questions[dataQuestion.seqNo].active = false;
      this.questions[dataQuestion.seqNo + 1].active = true;
      this.itemActive = this.questions[dataQuestion.seqNo + 1];
      this.clickToScroll(dataQuestion.seqNo + 1);
    }
  }

  uploadVideo(dataQuestion) {}

  addSection(dataQuestion) {}

  clickQuestionMF(functionID, dataQuestion) {
    if (functionID) {
      this.questions[dataQuestion.seqNo].answerType = functionID;
      var data = JSON.parse(JSON.stringify(this.questions[dataQuestion.seqNo]));
      if (
        functionID == 'T' ||
        functionID == 'T2' ||
        functionID == 'D' ||
        functionID == 'H'
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
      } else if (functionID == 'L3') data.other = false;
      else data.other = true;
      if (data.answers.length == 1) {
        data.answers[0].answer = 'Tùy chọn 1';
      }
      this.questions[dataQuestion.seqNo] = data;
    }
  }
}
