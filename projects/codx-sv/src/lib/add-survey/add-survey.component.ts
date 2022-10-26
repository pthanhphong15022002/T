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

  data: any = {
    text: 'Mẫu không có tiêu đề',
    description: 'Mô tả biểu mẫu',
  };

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
        question: 'Câu hỏi 1',
        answers: [
          {
            seqNo: 0,
            answer: 'Tùy chọn 1',
            other: true,
            isColumn: false,
            hasPicture: false,
          },
        ],
      },
      {
        seqNo: 1,
        question: 'Câu hỏi 2',
        answers: [
          {
            seqNo: 0,
            answer: 'Tùy chọn 1',
            other: true,
            isColumn: false,
            hasPicture: false,
          },
        ],
      },
      {
        seqNo: 2,
        question: 'Câu hỏi 3',
        answers: [
          {
            seqNo: 0,
            answer: 'Tùy chọn 1',
            other: true,
            isColumn: false,
            hasPicture: false,
          },
        ],
      },
      {
        seqNo: 3,
        question: 'Câu hỏi 4',
        answers: [
          {
            seqNo: 0,
            answer: 'Tùy chọn 1',
            other: true,
            isColumn: false,
            hasPicture: false,
          },
        ],
      },
      {
        seqNo: 4,
        question: 'Câu hỏi 5',
        answers: [
          {
            seqNo: 0,
            answer: 'Tùy chọn 1',
            other: true,
            isColumn: false,
            hasPicture: false,
          },
        ],
      },
      {
        seqNo: 5,
        question: 'Câu hỏi 6',
        answers: [
          {
            seqNo: 0,
            answer: 'Tùy chọn 1',
            other: true,
            isColumn: false,
            hasPicture: false,
          },
        ],
      },
      {
        seqNo: 6,
        question: 'Câu hỏi 7',
        answers: [
          {
            seqNo: 0,
            answer: 'Tùy chọn 1',
            other: true,
            isColumn: false,
            hasPicture: false,
          },
        ],
      },
      {
        seqNo: 7,
        question: 'Câu hỏi 8',
        answers: [
          {
            seqNo: 0,
            answer: 'Tùy chọn 1',
            other: true,
            isColumn: false,
            hasPicture: false,
          },
        ],
      },
      {
        seqNo: 8,
        question: 'Câu hỏi 9',
        answers: [
          {
            seqNo: 0,
            answer: 'Tùy chọn 1',
            other: true,
            isColumn: false,
            hasPicture: false,
          },
        ],
      },
      {
        seqNo: 9,
        question: 'Câu hỏi 10',
        answers: [
          {
            seqNo: 0,
            answer: 'Tùy chọn 1',
            other: true,
            isColumn: false,
            hasPicture: false,
          },
        ],
      },
      {
        seqNo: 10,
        question: 'Câu hỏi 11',
        answers: [
          {
            seqNo: 0,
            answer: 'Tùy chọn 1',
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

  scroll(el: HTMLElement) {
    if (el)
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
  }
}
