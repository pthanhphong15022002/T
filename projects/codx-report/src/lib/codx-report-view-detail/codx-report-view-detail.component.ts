import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  AuthService,
  AuthStore,
  DialogModel,
  LayoutService,
  NotificationsService,
  PageLink,
  PageTitleService,
  UIComponent,
  Util,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { PopupAddReportComponent } from '../popup-add-report/popup-add-report.component';
import { PopupShowDatasetComponent } from '../popup-show-dataset/popup-show-dataset.component';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { setTime } from '@syncfusion/ej2-angular-schedule';
import { NgxCaptureService } from 'ngx-capture';
import { tap } from 'rxjs';

@Component({
  selector: 'codx-report-view-detail',
  templateUrl: './codx-report-view-detail.component.html',
  styleUrls: ['./codx-report-view-detail.component.scss'],
})
export class CodxReportViewDetailComponent
  extends UIComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  @Input() predicate: any = '';
  @Input() dataValue: any = '';
  @Input() print: any = 'false';
  @ViewChild('report') report: TemplateRef<any>;
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('breadCrumb') breadCrumb!: ElementRef<any>;
  @ViewChild('upload') upload: ElementRef<any>;

  views: ViewModel[];
  viewType = ViewType;
  reportID: string;
  mssgSYS043: string = '';
  mssgSYS044: string = '';
  reload: boolean = false;
  isRunMode = false;
  _paramString: any = '';
  _labelString: any = '';
  _formatString: any = '';
  params:any = {};
  orgReportList: any = [];
  moreFc: any = [
    {
      id: 'btnAddReport',
      icon: 'icon-list-chechbox',
      text: 'Thông tin báo cáo',
    },
    // {
    //   id: 'btnScreenshot',
    //   icon: 'icon-insert_photo',
    //   text: 'Screenshot',
    // },
    {
      id: 'btnUploadAvatar',
      icon: 'icon-cloud_upload',
      text: 'Upload avatar',
    },
  ];
  rootFunction: any;
  data: any;
  reportList: any = [];
  user: any = null;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    injector: Injector,
    private layout: LayoutService,
    private pageTitle: PageTitleService,
    private routerNg: Router,
    private auth: AuthStore,
    private authSV: AuthService,
    private apihttp: HttpClient,
    private notiService: NotificationsService,
    private captureService: NgxCaptureService
  ) {
    super(injector);
    this.user = this.auth.get();
  }

  onInit(): void {
    this.router.params.subscribe((param: any) => {
      if (param['funcID']) {
        this.reportID = param['funcID'];
        this.getReport(this.reportID);
      }
          });

    this.router.queryParams.subscribe((param: any) => {
    if (param['params'])
    {
      this._paramString = decodeURIComponent(param['params']);
      this.params = JSON.parse(this._paramString);
    }
    });
    let objFormat: any = {};
    objFormat['timeZone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this._formatString = JSON.stringify(objFormat);
    this.getMessageDefault();
  }

  ngOnDestroy(): void {
    (this.viewBase as any).pageTitle.setSubTitle('');
    let wrapper = document.querySelector('codx-wrapper');
    wrapper && wrapper.classList.remove('p-0', 'px-1');
  }
  ngOnChanges(changes: SimpleChanges): void {}

  ngAfterViewInit(): void {
    this.reportID && this.getReport(this.reportID);
    this.views = [
      {
        type: ViewType.content,
        sameData: false,
        active: true,
        reportView: true,
        reportType: 'R',
        text: 'Report',
        icon: 'icon-assignment',
        model: {
          panelLeftRef: this.report,
        },
      },
      {
        type: ViewType.content,
        sameData: true,
        active: false,

        model: {
          panelLeftRef: this.report,
        },
      },
    ];
    console.log(this.view);
  }
  viewChanged(e: any) {
    //this.viewBase.moreFuncs = this.moreFc;
    let wrapper = document.querySelector('codx-wrapper');
    wrapper && wrapper.classList.add('p-0', 'px-1');
  }
  //get report by ID
  getReport(recID: string) {
    this.api
      .execSv(
        'rptrp',
        'Codx.RptBusiness.RP',
        'ReportListBusiness',
        'GetAsync',
        [recID]
      )
      .subscribe((res: any) => {
        if (res) {
          this.data = res;
          this.reportID = res.reportID;
          this.isRunMode = res.runMode == '1';
          //this.pageTitle.setRootNode(res.customName);
          this.getRootFunction(res.moduleID, res.reportType);
          // if (
          //   res.displayMode == '2' ||
          //   res.displayMode == '3' ||
          //   res.displayMode == '4'
          // )
          // {

          //   this.getReportPDF(res.recID);
          // }
        }
      });
  }

  getRootFunction(module: string, type: string) {
    this.api
      .execSv(
        'SYS',
        'ERM.Business.SYS',
        'FunctionListBusiness',
        'GetFuncByModuleIDAsync',
        [module, type]
      )
      .subscribe((res: any) => {
        if (res) {
          if(this.rootFunction && this.rootFunction.functionID == res.functionID){
            this.getReportList(this.data.moduleID, this.data.reportType);
            return;
          }
          this.rootFunction = res;
          this.viewBase.formModel.funcID = this.rootFunction?.functionID;
          this.viewBase.formModel.formName = this.rootFunction?.formName;
          this.viewBase.formModel.gridViewName =
            this.rootFunction?.gridViewName;
          this.viewBase.pageTitle.setRootNode(this.rootFunction.customName);
          let parent: PageLink = {
            title: this.rootFunction.customName,
            path:
              this.rootFunction.module.toLowerCase() +
              '/report/' +
              this.rootFunction.functionID,
          };
          this.viewBase.pageTitle.setParent(parent);

          this.getReportList(this.data.moduleID, this.data.reportType);
        }
      });
  }

  getReportList(moduleID: string, reportType: string) {
    this.api
      .execSv(
        'rptrp',
        'Codx.RptBusiness.RP',
        'ReportListBusiness',
        'GetReportsByModuleAsync',
        [reportType, moduleID]
      )
      .subscribe((res: any) => {
        this.orgReportList = res;
        let arrChildren: Array<PageLink> = [];

        for (let i = 0; i < this.orgReportList.length; i++) {
          let pageLink: PageLink = {
            title: this.orgReportList[i].customName,
            path:
              this.rootFunction.module.toLowerCase() +
              '/report/detail/' +
              this.orgReportList[i].recID,
          };
          arrChildren.push(pageLink);
        }
        this.viewBase.pageTitle.setChildren(arrChildren);
        this.reportList = this.orgReportList.filter(
          (x: any) => x.recID != this.data.recID
        );
        this.setBreadCrumb(this.data);
      });
  }

  setBreadCrumb(func: any, deleteChild: boolean = false) {
    if (func) {
      !deleteChild && this.viewBase.pageTitle.setSubTitle(func.customName);
      deleteChild && this.viewBase.pageTitle.setSubTitle('');
    }
  }

  // get message
  getMessageDefault() {
    this.cache.message('SYS043').subscribe((mssg: any) => {
      if (mssg.defaultName) this.mssgSYS043 = mssg.defaultName;
    });
    this.cache.message('SYS044').subscribe((mssg: any) => {
      if (mssg.defaultName) this.mssgSYS044 = mssg.defaultName;
    });
  }

  onActions(e: any) {
    if (e.id == 'btnViewDs' && this.data) {
      let dialog = new DialogModel();
      dialog.IsFull = true;
      let parameters = this.data.parameters;
      if (parameters) {
        parameters.forEach((x: any) => {
          if (x.defaultValue) {
            e.parameters[x.mappingName] = x.defaultValue;
          }
        });
      }
      this.callfc.openForm(
        PopupShowDatasetComponent,
        '',
        window.innerWidth,
        window.innerHeight,
        '',
        { report: this.data, parameters: e.parameters },
        '',
        dialog
      );
    }
  }

  click(event: any) {
    switch (event.id) {
      case 'btnAddReport':
        this.editReport();
        break;
      case 'btnScreenshot':
        this.screenshot();
        break;
      case 'btnUploadAvatar':
        this.uploadAvatar();
        break;
    }
  }

  editReport() {
    if (this.data) {
      let option = new DialogModel();
      option.DataService = this.viewBase.dataService;
      option.FormModel = this.viewBase.formModel;
      this.callfc.openForm(
        PopupAddReportComponent,
        '',
        screen.width,
        screen.height,
        ' ',
        {
          module: this.data.moduleID,
          reportID: this.data.recID,
        },
        '',
        option
      );
    }
  }

  screenshot() {
    let recID = this.router.snapshot.params['funcID'];
    if(!document.querySelector('iframe')) return;
    this.captureService
      .getImage(document.querySelector('iframe'), true)
      .subscribe((imgBase64: string) => {
        this.api
          .execSv(
            'rptrp',
            'Codx.RptBusiness.RP',
            'ReportListBusiness',
            'ScreenshotAsync',
            [recID, imgBase64]
          )
          .subscribe((res: boolean) => {
            if (res) {
              this.notiService.notifyCode('SYS034');
            } else {
              this.notiService.notifyCode('SYS021');
            }
          });
      });
  }

  uploadAvatar() {
    this.upload.nativeElement.click();
  }

  handleInputChange(e) {
    let file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    let pattern = /image-*/;
    var reader = new FileReader();
    if (!file.type.match(pattern)) {
      alert('invalid format');
      return;
    }
    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
  }
  _handleReaderLoaded(e) {
    let recID = this.router.snapshot.params['funcID'];
    let reader = e.target;
    let imgBase64 = reader.result;
    this.api
      .execSv(
        'rptrp',
        'Codx.RptBusiness.RP',
        'ReportListBusiness',
        'ScreenshotAsync',
        [recID, imgBase64]
      )
      .subscribe((res: boolean) => {
        if (res) {
          this.notiService.notifyCode('SYS034');
        } else {
          this.notiService.notifyCode('SYS021');
        }
      });
  }

  filterReportChange(e: any) {
    if (e == null) return;
    let objParam: any = {};
    let objLabel: any = {};
    let objFormat: any = {};
    // parameters
    if (e[1]) {
      Object.keys(e[1]).map((key) => {
        if(this.params[key])
          objParam[key] = this.params[key];
        else
         objParam[key] = e[1][key];
      });
      if(this.params)
      {
        for(const key in this.params){
          objParam[key] = this.params[key]
        }
      }
      this._paramString = JSON.stringify(objParam);

    }
    // labels
    if (e[2]) {
      Object.keys(e[2]).map((key) => {
        objLabel[key] = e[2][key];
      });
      this._labelString = JSON.stringify(objLabel);
    }
    // formats
    if (e[4]) {
      Object.keys(e[4]).map((key) => {
        objFormat[key] = e[4][key];
      });
      this._formatString = JSON.stringify(objFormat);
    }
    // get report PDF
    if (this.data.displayMode == '3' || this.data.displayMode == '4') {
      this.getReportPDF(this.data.recID);
    }
  }

  // itemSelect(e: any) {
  //   if (e) {
  //     this.data = e;
  //     this.codxService.navigate(
  //       '',
  //       e.moduleID.toLowerCase() + '/report/detail/' + e.recID
  //     );
  //     this.reportList = this.orgReportList.filter(
  //       (x: any) => x.recID != this.data.recID
  //     );
  //   }
  // }

  homeClick() {
    this.codxService.navigate(
      '',
      this.rootFunction.module.toLowerCase() +
        '/report/' +
        this.rootFunction.functionID
    );
    this.setBreadCrumb(this.data, true);
  }

  clickViewReport() {
    (document.querySelector('.btnApply') as any)?.click();
    if (this.isRunMode) this.isRunMode = false;
    this.detectorRef.detectChanges();
  }

  url: string = '';
  getReportPDF(recID: string)
  {
    let sk =
      'sk=' +
      btoa(
        this.authSV.userValue.userID + '|' + this.authSV.userValue.securityKey
      );
    this.url = `${environment.apiUrl}/api/${
      this.data.service
    }/GetReportByPDF?reportID=${recID}&parameters=${this._paramString}&${sk}&=`+Util.uid();
  }
}
