import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent extends UIComponent implements OnInit {
  funcID = '';
  views: Array<ViewModel> = [];
  service = 'SV';
  assemblyName = 'ERM.Business.SV';
  className = 'SurveysBusiness';
  method = 'GetAsync';
  functionList: any;

  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('lstView') lstView: TemplateRef<any>;

  constructor(private injector: Injector, private change: ChangeDetectorRef) {
    super(injector);
    this.router.params.subscribe((params) => {
      if (params) this.funcID = params['funcID'];
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) this.functionList = res;
    });
  }

  onInit(): void {}

  ngAfterViewInit() {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.panelLeftRef,
        },
      },
      {
        id: '2',
        type: ViewType.list,
        // active: true,
        sameData: true,
        model: {
          template: this.lstView,
        },
      },
    ];
    this.view.dataService.requestEnd = (t, data) => {
      if (t == 'loaded') {
        console.log('check listSurvey', this.view.dataService.data);
      }
    };
    this.change.detectChanges();
  }
}
