import { json } from 'stream/consumers';
import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, ViewModel, ViewType, ApiHttpService, DialogModel, ViewsComponent, CallFuncService, ButtonModel } from 'codx-core';
import { CodxReportViewerComponent } from 'projects/codx-report/src/lib/codx-report-viewer/codx-report-viewer.component';
import { PopupAddReportComponent } from 'projects/codx-report/src/lib/popup-add-report/popup-add-report.component';
// import { CodxReportComponent } from 'projects/codx-share/src/lib/components/codx-report/codx-report.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'lib-task-daily',
  templateUrl: './task-daily.component.html',
  styleUrls: ['./task-daily.component.css'],
})
export class TaskDailyComponent implements OnInit {
  @ViewChild('itemDueDate', { static: true }) itemDueDate: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('itemCreate', { static: true }) itemCreate: TemplateRef<any>;
  @ViewChild('itemOwner', { static: true }) itemOwner: TemplateRef<any>;
  @ViewChild('itemStatusVll', { static: true }) itemStatusVll: TemplateRef<any>;
  @ViewChild('itemMemo', { static: true }) itemMemo: TemplateRef<any>;
  @ViewChild('itemCompletedOn', { static: true })
  itemCompletedOn: TemplateRef<any>;
  @ViewChild('itemActive', { static: true }) itemActive: TemplateRef<any>;
  @ViewChild('report') report: TemplateRef<any>;
  @ViewChild('reportObj') reportObj: CodxReportViewerComponent;
  @ViewChild('pined') pined?: TemplateRef<any>;
  @ViewChild('dashboard') dashboard?: TemplateRef<any>;
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('iframe', {static: false}) iframe: ElementRef;
  @ViewChild('contentFrame', { read: ViewContainerRef}) contentFrame: ViewContainerRef;
  // compRef: ComponentRef<CodxReportComponent>;
  doc:any;
  user: any;
  funcID: any;
  lstPined: any = [];
  param: { [k: string]: any } = {};
  print: boolean = false;
  _paramString: string = '';
  isCollapsed = true;
  titleCollapse: string = 'Đóng hộp tham số';
  reportUUID: any = 'TMR01';
  predicates: any = [];
  dataValues: any = [];
  moreFunc: Array<ButtonModel> = [];
  predicate = '';
  dataValue = '';
  _user: any;
  urlSafe: any;
  src:any;
  constructor(
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private callFuncService: CallFuncService,
    private api: ApiHttpService,
    private resolver: ComponentFactoryResolver,
    private vcRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
    public sanitizer: DomSanitizer
  ) {
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  columnsGrid = [];
  views: Array<ViewModel> = [];

  ngOnInit(): void {
    this._user = this.authStore.get();
    this.columnsGrid = [
      {
        field: 'priority',
        headerText: '',
        template: this.GiftIDCell,
        width: 30,
      },
      { field: 'taskName', headerText: 'Tên công việc', width: 150 },
      {
        field: 'status',
        headerText: 'Tình trạng',
        template: this.itemStatusVll,
        width: 120,
      },
      {
        field: 'memo',
        headerText: 'Mổ tả công việc',
        template: this.itemMemo,
        width: 140,
      },
      {
        field: 'owner',
        headerText: 'Người thực hiện',
        template: this.itemOwner,
        width: 200,
      },
      {
        field: 'dueDate',
        headerText: 'Ngày hết hạn',
        template: this.itemDueDate,
        width: 140,
      },
      {
        field: 'completedOn',
        headerText: 'Ngày hoàn tất',
        template: this.itemCompletedOn,
        width: 140,
      },
      { field: 'taskGroupName', headerText: 'Nhóm công việc', width: 180 },
      { field: 'projectName', headerText: 'Dự án', width: 180 },
      {
        field: 'active',
        headerText: 'Hoạt động',
        template: this.itemActive,
        width: 150,
      },
      { field: 'buid', headerText: 'Bộ phận người thực hiện', width: 140 },
    ];
    //this.loadData();
  }
  ngAfterViewInit(): void {
    //  this._user = this.authStore.get();
    // let sk = `${this._user.userID}|${this._user.securityKey}`
    // let _preArray =this.predicate.split('&&').join(';');
    // this.src = `/${this._user.tenant}/report?reportID=${this.funcID}&predicates=${_preArray}&dataValues=${this.dataValue}`;
    // this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
    //
    // //this.src=`http://localhost:4203/r?token=${this._user.token}&reportID=${this.reportUUID}&parameters=${JSON.stringify(this.param)}`;

    this.views = [
      {
        type: ViewType.grid,
        sameData: false,
        active: false,
        model: {
          resources: this.columnsGrid,
        },
      },
      {
        sameData: false,
        type: ViewType.content,
        active: true,
        text: 'Report',
        icon: 'icon-assignment',
        //toolbarTemplate: this.pined,
        reportView: true,
        model: {
          panelLeftRef: this.report,
        },
      },
      {
        sameData: false,
        type: ViewType.content,
        text: 'Đát Bo Viu ơ',
        active: false,
        model: {
          panelLeftRef: this.dashboard,
        },
      },
    ];

    this.moreFunc = [
      {
        id: 'btnAddReport',
        icon: 'icon-list-chechbox',
        text: 'Thêm/Sửa report',
      },
    ];
  }

  loadData() {
    var fromDate = new Date('2022-08-01');
    var toDate = new Date('2022-08-30');
    this.api
      .callSv('TM', 'TM', 'ReportBusiness', 'ListReportTasksAsync', [
        fromDate,
        toDate,
      ])
      .subscribe((res) => {
        if (res) {
          console.log(res);
        }
      });
  }
  paramChange(evt: any) {
    console.log(evt);

    if (evt.controlName == 'DueDate') {
      if (this.predicates.length > 0) {
        this.predicates.forEach((e) => {
          console.log(e);
          if (!e.includes('DueDate')) {
            this.predicates.push(
              evt.data.controlName + '.Value>=@' + this.predicates.length
            );
            this.predicates.push(
              evt.data.controlName + '.Value<=@' + this.predicates.length
            );
          } else {
            const index = e.indexOf(e.includes('DueDate'));

            if (index !== -1) {
              this.dataValues[index].push(
                evt.data.fromDate.toJSON() +
                  ';' +
                  evt.data.toDate.toJSON()
              );
            }
          }
        });
      } else {
        this.predicates.push(
          evt.controlName + '.Value>=@' + this.predicates.length
        );
        this.predicates.push(
          evt.controlName + '.Value<=@' + this.predicates.length
        );
        this.dataValues.push(
        `${evt.data.fromDate.toJSON()};${evt.data.toDate.toJSON()}`
        );
      }
    }
    if (evt.controlName == 'Owner') {
      this.predicates.push(
        evt.controlName + '=@' + this.predicates.length
      );
      this.dataValues.push(evt.data);
    }

    this.predicate = this.predicates.join('&&');
    this.dataValue = this.dataValues.join(';');
    // this.predicates.forEach((e,i)=> {
    //   if(!e[i].includes(e[i+1])){
    //     pre += e + '&&';
    //   }
    // });
    // this.dataValues.forEach(e => {
    //   if(!data.split(';').includes(e)){
    //     data += e + ';';
    //   }
    // });
    // if(pre != '' && data != ''){
    //   this.predicate = pre.substring(0,pre.length - 2);
    //   this.dataValue = data.substring(0,data.length - 1);
    // }
    this.param = {predicate: this.predicate, dataValue: this.dataValue};
  }

  fields: any = [];
  values: any = [];

  paramChange1(evt){
    let objParams : any = {};
    this.param = {predicate: evt.predicates, dataValue: evt.dataValues};
    this.predicate = evt.predicates;
    this.dataValue = evt.dataValues;
    for(let item in evt[1]){
      let _childProp = evt[1][item];
      if(typeof _childProp  == 'object'){
        for(let i in _childProp){
          objParams[i] = _childProp[i];
        }
      }
      else{
        objParams[item] = _childProp
      }
    }
    this._paramString = JSON.stringify(objParams)
  }

  printReport() {
    this.print = true;
    setTimeout(() => {
      this.print = false;
    }, 10000);
  }
  popoverList: any;
  popoverDetail: any;
  PopoverDetail(p: any, emp) {
    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp.memo != null || emp.memo2 != null) p.open();
    } else p.close();
  }


  valueChange(evt: any, a?: any, type?: any) {}

  addReport() {
      let option = new DialogModel();
      option.DataService = this.viewBase.dataService;
      option.FormModel = this.viewBase.formModel;
      this.callFuncService.openForm(
        PopupAddReportComponent,
        '',
        screen.width,
        screen.height,
        this.funcID,
        this.funcID,
        '',
        option
      );
  }
  onIframeLoad(iframe:any){
    this.doc = iframe.contentDocument || iframe.contentWindow;

    this.createComponent();
  }
  createComponent() {
    // //const compFactory = this.resolver.resolveComponentFactory(CodxReportComponent);
    // this.compRef = this.vcRef.createComponent(CodxReportComponent);
    // this.compRef.location.nativeElement.id = 'reportComp';
    // (<CodxReportComponent>this.compRef.instance).reportUUID = this.reportUUID;
    // (<CodxReportComponent>this.compRef.instance).parameters = this.param;
    // (<CodxReportComponent>this.compRef.instance).showToolbar = true;
    // (<CodxReportComponent>this.compRef.instance).print = this.print;
    // this.doc.body.appendChild(this.compRef.location.nativeElement);
    }
  click(event: any){
    switch(event.id){
      case 'btnAddReport':
        this.addReport();
        break;
    }
  }
}
