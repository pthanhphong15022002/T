import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  CodxListviewComponent,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';

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
  formats = {
    item: 'Title',
    fontStyle: 'Arial',
    fontSize: '13',
    fontColor: 'black',
    fontFormat: 'B',
  };
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('lstView') lstView: CodxListviewComponent;

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
    ];
    this.change.detectChanges();
  }

  clickMF(e, data) {}

  createNewSurvey() {
    this.view.dataService.addNew().subscribe((res) => {
      res.title = "Mẫu không có tiêu đề"
      this.api.execSv("SV","SV","SurveysBusiness","SaveAsync",[res,this.formats,true]).subscribe((item : any)=>{
        this.codxService.navigate('', 'sv/add-survey', {
          funcID: this.funcID,
          recID: item?.result?.recID,
        });
      })
    });
  }

  update(item) {
    this.codxService.navigate('', 'sv/add-survey', {
      funcID: this.funcID,
      recID: item.recID,
    });
  }
}
