import { ActivatedRoute } from '@angular/router';
import {
  ApiHttpService,
  CacheService,
  AuthService,
  CodxService,
  ViewsComponent,
  ViewType,
  PageTitleService,
} from 'codx-core';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'app-personals',
  templateUrl: './personals.component.html',
  styleUrls: ['./personals.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PersonalsComponent implements OnInit {
  formName: any;
  gridViewName: any;
  employeeInfo: any;
  menuUrl: any;
  active = false;
  icon: any;
  funcID = '';
  default = true;
  showHeader: boolean = true;
  checkRefreshAvatar = false;

  headerMF = {
    POST: true,
    IMAGE: false,
    VIDEO: false,
    NOTEBOOK: false,
    STORAGE: false,
    INFORMATION: false,
  };

  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;

  constructor(
    private changedt: ChangeDetectorRef,
    private auth: AuthService,
    private route: ActivatedRoute,
    private codxShareSV: CodxShareService
  ) {
    var data: any = this.auth.user$;
    this.employeeInfo = data.source._value;
    this.active = true;
  }

  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      this.funcID = param['funcID'];
      this.menuUrl = this.funcID;
    });
    this.refreshAvatar();
  }

  ngAfterViewInit() {}

  refreshAvatar() {
    this.codxShareSV.dataRefreshImage.subscribe((res) => {
      if (res) {
        this.checkRefreshAvatar = !this.checkRefreshAvatar;
        this.employeeInfo['modifiedOn'] = res?.modifiedOn;
        this.changedt.detectChanges();
      }
    });
  }

  getFunctionList() {
    // if (this.funcID) {
    //   this.cachesv.functionList(this.funcID).subscribe((res: any) => {
    //     if (res) {
    //       this.pageTitle.setSubTitle(res.customName);
    //       this.formName = res.formName;
    //       this.gridViewName = res.gridViewName;
    //
    //       this.cachesv
    //         .moreFunction(this.formName, this.gridViewName)
    //         .subscribe((res: any) => {
    //
    //           this.moreFunc = res;
    //           this.changedt.detectChanges();
    //         });
    //     }
    //   });
    // }
  }

  activeMF(type) {
    this.headerMF.IMAGE = false;
    this.headerMF.VIDEO = false;
    this.headerMF.POST = false;
    this.headerMF.NOTEBOOK = false;
    this.headerMF.STORAGE = false;
    this.headerMF.INFORMATION = false;
    this.headerMF[type] = true;
    this.changedt.detectChanges();
  }
}
