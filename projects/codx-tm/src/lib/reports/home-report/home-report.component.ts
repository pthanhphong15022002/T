import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiHttpService, CodxService, TenantStore, ViewModel, ViewType } from 'codx-core';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'lib-home-report',
  templateUrl: './home-report.component.html',
  styleUrls: ['./home-report.component.css']
})
export class HomeReportComponent implements OnInit {
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
    private at: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.LoadData();

    this.at.queryParams.subscribe(params => {
      if (params.page) {
        this.funcID = params.funcID;
        this.router.navigate(["/" + this.tenant + "/tm/reports/"], { queryParams: { funcID: "TMR" } });
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
    this.api.exec("SYS", "FunctionListBusiness", "GetFuncByParentAsync", ['TM']).subscribe((result) => {
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
