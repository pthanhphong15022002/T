import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, CacheService, AuthService, CodxService, ViewsComponent, ViewType } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, TemplateRef, ViewChild } from '@angular/core';


@Component({
  selector: 'app-personals',
  templateUrl: './personals.component.html',
  styleUrls: ['./personals.component.scss']
})
export class PersonalsComponent implements OnInit {
  @ViewChild('view') view: ViewsComponent;
  formName: any;
  gridViewName: any;
  employeeInfo: any;
  menuUrl: any;
  active = false;
  icon: any;
  funcID = "";
  default = true;
  views = [];
  userPermission: any;
  showHeader: boolean = true;
  moreFunc: any[] = [
    { functionID: `MWP0091`, description: "Bài viết", smallIcon: "mwp_post" },
    { functionID: `MWP0092`, description: "Hình ảnh", smallIcon: "mwp_image" },
    { functionID: `MWP0093`, description: "Video", smallIcon: "mwp_video" },
    { functionID: `MWP0094`, description: "Sổ tay", smallIcon: "mwp_notebooks" },
    { functionID: `MWP0095`, description: "Kho lưu trữ", smallIcon: "mwp_storage" },];

  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;

  constructor(private api: ApiHttpService,
    private cachesv: CacheService,
    private changedt: ChangeDetectorRef,
    private auth: AuthService,
    private route: ActivatedRoute,
    private codxService: CodxService,
  ) {
    var data: any = this.auth.user$;
    this.employeeInfo = data.source._value;
    this.active = true;
  }

  ngOnInit(): void {
    this.route.params.subscribe(param => {
      this.funcID = param["funcID"]
      this.menuUrl = this.funcID;
      this.changedt.detectChanges();
    });
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.panelLeftRef,
        },
      },
    ]
    this.userPermission = this.viewbase.userPermission;
    this.changedt.detectChanges();
  }

  getFunctionList() {
    this.cachesv.functionList(this.funcID).subscribe((res: any) => {
      if (res) {
        this.formName = res.formName;
        this.gridViewName = res.gridViewName;
        this.cachesv.moreFunction(this.formName, this.gridViewName).subscribe((res: any) => {
          this.moreFunc = res;
          this.changedt.detectChanges();
        });
      }
    })
  }

  getMenu(url, icon) {
    this.icon = icon;
    this.active = true;
    this.default = false;
    this.menuUrl = url;

    // this.funcID = url;
    this.codxService.navigate('', `mwp/personals/${url}`);
    this.changedt.detectChanges();
  }

}
