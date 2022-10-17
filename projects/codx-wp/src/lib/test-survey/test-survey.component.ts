import {
  Component,
  Injector,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ToolbarService } from '@syncfusion/ej2-angular-gantt';
import { TextBoxModel } from '@syncfusion/ej2-angular-inputs';
import {
  LinkService,
  ImageService,
  HtmlEditorService,
  QuickToolbarService,
  RichTextEditorModel,
} from '@syncfusion/ej2-angular-richtexteditor';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'lib-test-survey',
  templateUrl: './test-survey.component.html',
  styleUrls: ['./test-survey.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ToolbarService,
    LinkService,
    ImageService,
    HtmlEditorService,
    QuickToolbarService,
  ],
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
      items: [
        'Bold',
        'Italic',
        'Underline',
        'FontColor',
        'BackgroundColor',
        'LowerCase',
        'UpperCase',
        '|',
        'OrderedList',
        'UnorderedList',
      ],
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

  onInit(): void {}
  valueChange(e) {
    console.log(e);
  }
}
