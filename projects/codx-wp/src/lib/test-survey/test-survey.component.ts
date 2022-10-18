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
import {
  RichTextEditorModel,
} from '@syncfusion/ej2-angular-richtexteditor'; 
import { UIComponent } from 'codx-core';

@Component({
  selector: 'lib-test-survey',
  templateUrl: './test-survey.component.html',
  styleUrls: ['./test-survey.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [RteService, MultiSelectService],
})
export class TestSurveyComponent extends UIComponent implements OnInit {
  public titleEditorValue: String = 'Succinctly E-Book about TypeScript';
  public commentEditorValue: String =
    'The extensive adoption of JavaScript for application development, and the ability to use HTML and JavaScript to create Windows Store apps, has made JavaScript a vital part of the Windows development ecosystem. Microsoft has done extensive work to make JavaScript easier to use';
  public titleEditorModel: TextBoxModel = {
    placeholder: 'Enter your question title',
  };
  public commentEditorModel: RichTextEditorModel = {
    toolbarSettings: {
      enableFloating: false,
      items: ['Bold', 'Italic', 'Underline', 'ClearFormat', 'CreateLink'],
    },
  };
  public titleRule: { [name: string]: { [rule: string]: Object } } = {
    Title: { required: [true, 'Enter valid title'] },
  };
  public commentRule: { [name: string]: { [rule: string]: Object } } = {
    rte: { required: [true, 'Enter valid comments'] },
  };

  constructor(inject: Injector, 
    ) {
    super(inject);
  }

  public data: any = [
    {
      text: 'JavaScript',
      pic: 'javascript',
      description:
        'It is a lightweight interpreted or JIT-compiled programming language.',
    },
    {
      text: 'TypeScript',
      pic: 'typescript',
      description:
        'It is a typed superset of Javascript that compiles to plain JavaScript.',
    },
    {
      text: 'Angular',
      pic: 'angular',
      description:
        'It is a TypeScript-based open-source web application framework.',
    },
    {
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

  onInit(): void {}
  valueChange(e) {
    console.log(e);
  }
}
