import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
  ComponentRef,
} from '@angular/core';
import { UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxSvService } from '../codx-sv.service';

@Component({
  selector: 'app-add-survey',
  templateUrl: './add-survey.component.html',
  styleUrls: ['./add-survey.component.scss'],
})
export class AddSurveyComponent extends UIComponent implements OnInit {
  isModeAdd = true;
  funcID = '';
  functionList: any;
  recID: any;
  views: Array<ViewModel> = [];
  viewType = ViewType;
  mode: any = 'Q';
  title: any;
  signal: any = null;

  @ViewChild('itemTemplate') panelLeftRef: TemplateRef<any>;
  @ViewChild('app_question') app_question: ComponentRef<any>;

  constructor(
    private injector: Injector,
    private change: ChangeDetectorRef,
    private SVService: CodxSvService
  ) {
    super(injector);
    this.router.queryParams.subscribe((queryParams) => {
      if (queryParams?.funcID) this.funcID = queryParams.funcID;
      if (queryParams?.recID) {
        this.recID = queryParams.recID;
      }
      if (queryParams?.title) {
        this.title = queryParams.title;
      }
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) this.functionList = res;
    });
  }

  onInit(): void {
    this.getSignalAfterSave();
  }

  getSignalAfterSave() {
    this.SVService.signalSave.subscribe((res) => {
      if (res) {
        this.signal = res;
        this.change.detectChanges();
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
      this.change.detectChanges();
    }
  }

  onChangeMode(mode) {
    this.mode = mode;
    this.change.detectChanges();
  }

  onSelected(e: any) {
    if (e.selectedIndex == 0) this.mode = 'Q';
    else if (e.selectedIndex == 1) this.mode = 'A';
    else if (e.selectedIndex == 2) this.mode = 'S';
  }

  onSubmit() {}
}
