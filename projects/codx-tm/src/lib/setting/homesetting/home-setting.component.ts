import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiHttpService, CodxService, ViewModel, ViewType } from 'codx-core';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'lib-home-setting',
  templateUrl: './home-setting.component.html',
  styleUrls: ['./home-setting.component.css']
})
export class HomeSettingComponent implements OnInit {
  @ViewChild('main') main: TemplateRef<any>;

  views: Array<ViewModel> = [];
  currentActive = 2;
  active: any;
  func = {};
  funcID: any;
  page: any;
  tenant: string;
  constructor(private dt: ChangeDetectorRef,
    public codxService: CodxService,
    private api: ApiHttpService,
    private ngxLoader: NgxUiLoaderService, 
    private router: Router, 
    private at: ActivatedRoute,) { }

  ngOnInit(): void {
    this.LoadData();

    this.at.queryParams.subscribe(params => {
      if (params.page) {
        this.funcID = params.funcID;
        this.router.navigate(["/" + this.tenant + "/tm/setting/"], { queryParams: { funcID: "TMS" } });
        this.page = params.page;
      }
      if (params.funcID) {

        this.funcID = params.funcID;
      }
    });
  }

  ngAfterViewInit(): void {
    this.views = [{
      active: true,
      type: ViewType.content,
      sameData: true,
      model: {
        panelLeftRef: this.main,
      }
    }];
    this.dt.detectChanges();
  }
  LoadData() {
    this.ngxLoader.start();
    this.api.exec("SYS", "FunctionListBusiness", "GetFuncByParentAsync", ['TMS']).subscribe((result) => {
      if (result)
        this.func = result;
        this.ngxLoader.stop();
    });
  }

   onSectionChange(data: any) {
    this.active = data.current;
    this.currentActive = data.index;
  }

}
