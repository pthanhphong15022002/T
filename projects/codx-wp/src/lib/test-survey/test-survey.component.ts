import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { A } from '@angular/cdk/keycodes';
import {
  Component,
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
import { TextBoxModel } from '@syncfusion/ej2-angular-inputs';
import { RichTextEditorModel } from '@syncfusion/ej2-angular-richtexteditor';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'lib-test-survey',
  templateUrl: './test-survey.component.html',
  styleUrls: ['./test-survey.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [RteService, MultiSelectService],
})
export class TestSurveyComponent extends UIComponent implements OnInit {
  public titleEditorModel: RichTextEditorModel = {
    toolbarSettings: {
      enableFloating: false,
      items: ['Bold', 'Italic', 'Underline', 'ClearFormat', 'CreateLink'],
    },
  };
  public descriptionEditorModel: RichTextEditorModel = {
    toolbarSettings: {
      enableFloating: false,
      items: ['Bold', 'Italic', 'Underline', 'ClearFormat', 'CreateLink', 'NumberFormatList', 'BulletFormatList'],
    },
  };
  public titleRule: { [name: string]: { [rule: string]: Object } } = {
    Title: { required: [true, 'Enter valid title'] },
  };
  public commentRule: { [name: string]: { [rule: string]: Object } } = {
    rte: { required: [true, 'Enter valid comments'] },
  };

  constructor(inject: Injector) {
    super(inject);
  }

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
    {
      id: '2',
      text: 'TypeScript',
      pic: 'typescript',
      description:
        'It is a typed superset of Javascript that compiles to plain JavaScript.',
      answer: [
        {
          text: 'A',
        },
        {
          text: 'B',
        },
      ],
    },
    {
      id: '3',
      text: 'Angular',
      pic: 'angular',
      description:
        'It is a TypeScript-based open-source web application framework.',
      answer: [
        {
          text: 'A',
        },
        {
          text: 'B',
        },
      ],
    },
    {
      id: '4',
      text: 'React',
      pic: 'react',
      description:
        'A JavaScript library for building user interfaces. It can also render on the server using Node.',
    },
    {
      text: 'Vue',
      pic: 'vue',
      description:
        'A progressive framework for building user interfaces. it is incrementally adoptable.',
    },
  ];

  dataAnswer: any = new Array();

  onInit(): void {}
  valueChange(e) {
    console.log(e);
  }

  items = [
    { value: 'Oranges', disabled: false },
    { value: 'Bananas', disabled: true },
    { value: 'Mangoes', disabled: false },
  ];
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.data, event.previousIndex, event.currentIndex);
  }
  dropAnswer(event: CdkDragDrop<string[]>, idParent) {
    var index = this.data.findIndex((x) => x.id == idParent);
    this.dataAnswer = this.data[index].answer;
    moveItemInArray(this.dataAnswer, event.previousIndex, event.currentIndex);
  }

  public focusIn(target: HTMLElement): void {
    target.parentElement.classList.add('e-input-focus');
  }

  public focusOut(target: HTMLElement): void {
    target.parentElement.classList.remove('e-input-focus');
  }
}
