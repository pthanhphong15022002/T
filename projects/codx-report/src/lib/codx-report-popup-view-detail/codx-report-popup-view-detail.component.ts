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
  Optional,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  AuthService,
  AuthStore,
  DialogData,
  DialogModel,
  DialogRef,
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
import { setTime } from '@syncfusion/ej2-angular-schedule';
import { NgxCaptureService } from 'ngx-capture';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'codx-report-popup-view-detail',
  templateUrl: './codx-report-popup-view-detail.component.html',
  styleUrls: ['./codx-report-popup-view-detail.component.scss'],
})
export class CodxReportPopupViewDetailComponent
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
 
  rootFunction: any;
  data: any;
  reportList: any = [];
  user: any = null;
  isPopup=false;
  rpRecID: any;
  popupParams: any;
  isAfterRender=false;
  dialogRef: DialogRef;
  isMorc:any = false;
  constructor(
    injector: Injector,
    private auth: AuthStore,
    private authSV: AuthService,
    private notiService: NotificationsService,
    private captureService: NgxCaptureService,
    @Optional() dialogData?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.user = this.auth.get();
    this.isPopup =dialogData?.data?.isPopup ?? false;
    this.rpRecID = dialogData?.data?.reportList?.recID;
    this.popupParams = dialogData?.data?.params;
    this.dialogRef = dialog;
  }

  onInit(): void {
           
    this.reportID = this.rpRecID;
    this.getReport(this.reportID);  
    this._paramString = decodeURIComponent(this.popupParams);
    this.params = JSON.parse(this._paramString); 

    let objFormat: any = {};
    objFormat['timeZone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this._formatString = JSON.stringify(objFormat);
    this.getMessageDefault();
  }

  ngOnDestroy(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {}

  ngAfterViewInit(): void {
      
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
          this.mappingDefault(this.data);
        }
      });
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
  

  mappingDefault(rpList: any) {
    if (rpList?.parameters?.length == 0) return;
    let objLabel: any = {};
    //let objFormat: any = {};
    
    rpList?.parameters.forEach(para=>{
      if(para?.mappingName !=null){
        // parameters
        if(this.params[para?.mappingName]){
          console.log(this.params[para?.mappingName]);          
        }
        else{
          this.params[para?.mappingName] = para?.defaultValue;
        }
        // labels
        objLabel[para?.mappingName] = para?.description;
      }
    });
    this._paramString = JSON.stringify(this.params);
    this._labelString = JSON.stringify(objLabel);    
    if (this.data.displayMode == '3' || this.data.displayMode == '4') {      
      this.getReportPDF(this.data.recID);
    }
  }
  
  clickViewReport() {
    (document.querySelector('.btnApply') as any)?.click();
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

  closeForm(){
    this.dialogRef.close();
  }

  editReport() {
    if (this.data) {
      let option = new DialogModel();
      option.DataService = this.dialogRef.dataService;
      option.FormModel = this.dialogRef.formModel;
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
      this.isMorc = !this.isMorc;
    }
  }
}
