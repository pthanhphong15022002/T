import {
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ComponentRef,
} from '@angular/core';
import { UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxSvService } from '../codx-sv.service';
import { SV_Questions } from '../models/SV_Questions';
import { SV_Surveys } from '../models/SV_Surveys';

@Component({
  selector: 'app-add-survey',
  templateUrl: './add-survey.component.html',
  styleUrls: ['./add-survey.component.scss'],
})
export class AddSurveyComponent extends UIComponent {
  isModeAdd = true;
  funcID = '';
  functionList: any;
  recID: any;
  views: Array<ViewModel> = [];
  viewType = ViewType;
  mode: any = 'Q';
  title: any;
  signal: any = null;
  url: any;
  questions: SV_Questions = new SV_Questions();
  surveys: SV_Surveys = new SV_Surveys();

  @ViewChild('itemTemplate') panelLeftRef: TemplateRef<any>;
  @ViewChild('app_question') app_question: ComponentRef<any>;

  constructor(private injector: Injector, private SvService: CodxSvService) {
    super(injector);
    this.router.queryParams.subscribe((queryParams) => {
      if (queryParams?.funcID) this.funcID = queryParams.funcID;
      if (queryParams?.recID) {
        this.recID = queryParams.recID;
      }
      if (queryParams?.title) {
        this.title = queryParams.title;
      }
      this.url = queryParams;
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) this.functionList = res;
    });
  }

  onInit(): void {
    if (!this.funcID) {
      this.codxService.navigate('SVT01');
    }
    this.getSignalAfterSave();
  }

  generateGUID() {
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

  addSV() {
    this.surveys.title = 'Đăng ký sự kiện';
    this.surveys.memo = 'Đăng ký sự kiện';
    this.api
      .exec('ERM.Business.SV', 'SurveysBusiness', 'SaveAsync', [
        this.surveys,
        null,
        true,
      ])
      .subscribe((res) => {
        if (res) {
        }
      });
  }

  // add() {
  //   var dataAnswerTemp = [
  //     {
  //       seqNo: 0,
  //       answer: `Tùy chọn 1`,
  //     },
  //   ];
  //   this.questions.transID = 'dced3e82-8d71-11ed-9499-00155d035517';
  //   this.questions.seqNo = 0;
  //   this.questions.category = 'S';
  //   this.questions.question = 'Câu hỏi session 1';
  //   this.questions.answers = null;
  //   this.questions.answerType = null;
  //   this.questions.parentID = null;

  //   this.api
  //     .exec('ERM.Business.SV', 'QuestionsBusiness', 'SaveAsync', [
  //       'dced3e82-8d71-11ed-9499-00155d035517',
  //       [this.questions],
  //       true,
  //     ])
  //     .subscribe((res) => {
  //       if (res) {
  //       }
  //     });
  // }

  getSignalAfterSave() {
    this.SvService.signalSave.subscribe((res) => {
      if (res) {
        this.signal = res;
        this.detectorRef.detectChanges();
      }
    });
  }

  onLoading(e) {
    if (this.view.formModel) {
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
      this.detectorRef.detectChanges();
    }
  }

  onChangeMode(mode) {
    this.mode = mode;
    this.detectorRef.detectChanges();
  }

  onSelected(e: any) {
    if (e.selectedIndex == 0) this.mode = 'Q';
    else if (e.selectedIndex == 1) this.mode = 'A';
    else if (e.selectedIndex == 2) this.mode = 'S';
  }

  onSubmit() {}

  back() {
    this.codxService.navigate('SVT01');
  }

  review() {
    this.codxService.openUrlNewTab('', 'sv/review', {
      funcID: this.funcID,
      title: this.title,
      recID: this.recID,
    });
  }
}
