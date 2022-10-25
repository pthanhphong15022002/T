import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import {
  MultiSelectService,
  RteService,
} from '@syncfusion/ej2-angular-inplace-editor';
import { RichTextEditorModel } from '@syncfusion/ej2-angular-richtexteditor';
import { UIComponent } from 'codx-core';
import { SV_Answers } from '../model/SV_Answers';
import { SV_Formats } from '../model/SV_Formats';
import { SV_Questions } from '../model/SV_Questions';
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

  data: any = [
    {
      id: '1',
      text: 'Mẫu không có tiêu đề',
      pic: 'javascript',
      description: 'Mô tả biểu mẫu',
      answer: [
        {
          text: 'A',
        },
        {
          text: 'B',
        },
      ],
    },
  ];

  dataAnswer: any = new Array();

  constructor(inject: Injector) {
    super(inject);
    // this.answers.seqNo = 0;
    // this.answers.answer = 'NVA';
    // this.answers.other = true;
    // this.answers.isColumn = false;
    // this.answers.hasPicture = false;
    // this.questions.question = 'Bạn tên gì nhỉ???';
    // this.questions.answers = this.answers;
    // this.questions.seqNo = 0;
    this.questions = [
      {
        seqNo: 0,
        question: 'Bạn tên gì???',
        answers: [
          {
            seqNo: 0,
            answer: 'NVA',
            other: true,
            isColumn: false,
            hasPicture: false,
          },
          {
            seqNo: 1,
            answer: 'NVB',
            other: true,
            isColumn: false,
            hasPicture: false,
          },
        ],
      },
      {
        seqNo: 1,
        question: 'Bạn ở đâu???',
        answers: [
          {
            seqNo: 0,
            answer: 'VN',
            other: true,
            isColumn: false,
            hasPicture: false,
          },
          {
            seqNo: 1,
            answer: 'US',
            other: true,
            isColumn: false,
            hasPicture: false,
          },
        ],
      },
    ];
    this.formats = {
      item: 'Title',
      fontStyle: 'Arial',
      fontSize: '13',
      fontColor: 'black',
      fontFormat: 'B',
    };
  }

  onInit(): void {
    // this.add();
  }
  valueChange(e) {
    console.log(e);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
  }
  dropAnswer(event: CdkDragDrop<string[]>, idParent) {
    var index = this.questions.findIndex((x) => x.seqNo == idParent);
    this.dataAnswer = this.questions[index].answers;
    moveItemInArray(this.dataAnswer, event.previousIndex, event.currentIndex);
  }

  public focusIn(target: HTMLElement): void {
    target.parentElement.classList.add('e-input-focus');
  }

  public focusOut(target: HTMLElement): void {
    target.parentElement.classList.remove('e-input-focus');
  }

  add() {
    this.surveys.title = 'Đăng ký sự kiện';
    this.surveys.memo = 'Đăng ký sự kiện';
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
}
