import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { UIComponent, ViewModel, ViewType } from 'codx-core';

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
  changeMode: any;

  @ViewChild('itemTemplate') panelLeftRef: TemplateRef<any>;

  constructor(private injector: Injector, private change: ChangeDetectorRef) {
    super(injector);
    this.router.queryParams.subscribe((queryParams) => {
      if (queryParams?.funcID) this.funcID = queryParams.funcID;
      if (queryParams?.recID) {
        this.recID = queryParams.recID;
      }
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) this.functionList = res;
    });
  }

  onInit(): void {}

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
    this.changeMode = Math.random();
  }

  onSubmit() {
    
  }
}
