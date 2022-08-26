import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, ViewModel, ViewType, ApiHttpService } from 'codx-core';
import { CodxReportViewerComponent } from 'projects/codx-report/src/lib/codx-report-viewer/codx-report-viewer.component';

@Component({
  selector: 'lib-task-daily',
  templateUrl: './task-daily.component.html',
  styleUrls: ['./task-daily.component.css']
})
export class TaskDailyComponent implements OnInit {
  @ViewChild("itemDueDate", { static: true }) itemDueDate: TemplateRef<any>;
  @ViewChild("GiftIDCell", { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild("itemCreate", { static: true }) itemCreate: TemplateRef<any>;
  @ViewChild("itemOwner", { static: true }) itemOwner: TemplateRef<any>;
  @ViewChild("itemStatusVll", { static: true }) itemStatusVll: TemplateRef<any>;
  @ViewChild("itemMemo", { static: true }) itemMemo: TemplateRef<any>;
  @ViewChild("itemCompletedOn", { static: true }) itemCompletedOn: TemplateRef<any>;
  @ViewChild("itemActive", { static: true }) itemActive: TemplateRef<any>;
  @ViewChild('report') report: TemplateRef<any>;
  @ViewChild('reportObj') reportObj: CodxReportViewerComponent;
  @ViewChild('pined') pined?: TemplateRef<any>;

  user: any;
  funcID: any;
  lstPined : any = [];
  param : any = {};
  print: boolean = false;
  isCollapsed = true;
  titleCollapse: string = "Đóng hộp tham số";
  reportUUID: any = 'TMR01';
  constructor(
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private api: ApiHttpService,
  ) {
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
   }

  columnsGrid = [];
  views: Array<ViewModel> = [];

  ngOnInit(): void {
    this.columnsGrid = [
      { field: 'priority', headerText: '', template: this.GiftIDCell, width: 30 },
      { field: 'taskName', headerText: 'Tên công việc', width: 150 },
      { field: 'status', headerText: 'Tình trạng', template: this.itemStatusVll, width: 120 },
      { field: 'memo', headerText: 'Mổ tả công việc', template: this.itemMemo, width: 140 },
      { field: 'owner', headerText: 'Người thực hiện', template: this.itemOwner, width: 200 },
      { field: 'dueDate', headerText: 'Ngày hết hạn', template: this.itemDueDate, width: 140 },
      { field: 'completedOn', headerText: 'Ngày hoàn tất', template: this.itemCompletedOn, width: 140 },
      { field: 'taskGroupName', headerText: 'Nhóm công việc', width: 180 },
      { field: 'projectName', headerText: 'Dự án', width: 180 },
      { field: 'active', headerText: 'Hoạt động', template: this.itemActive, width: 150 },
      { field: 'buid', headerText: 'Bộ phận người thực hiện', width: 140 }
    ];
   // this.loadData();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
      type: ViewType.grid,
      sameData: true,
      active: false,
      model: {
        resources: this.columnsGrid,
      }
    },
     {
      sameData: true,
      type: ViewType.content,
      active: true,
      text: 'Report',
      icon: 'icon-assignment',
      //toolbarTemplate: this.pined,
      reportView:true,
      model: {
        panelLeftRef: this.report,
      },
    },];
  }

  loadData(){
    this.api.callSv('TM','TM','ReportBusiness','ListReportTasksAsync').subscribe(res=>{
      if(res){
        console.log(res);
      }
    })
  }
  paramChange(evt:any){
    if(!evt.data.data.data){
      this.param = {};
    }
    else{
      this.param ={name:'1'};
      setTimeout(()=>{this.param = {}},2000)
    }

  }
  printReport(){
    this.print = true;
    setTimeout(()=>{this.print =false},10000)
  }
  popoverList: any;
  popoverDetail: any;
  PopoverDetail(p: any, emp) {
    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp.memo != null || emp.memo2 != null)
        p.open();
    }
    else
      p.close();
  }

  collapse(evt){
    this.reportObj && this.reportObj.collapse();
    this.titleCollapse = this.reportObj.isCollapsed ? "Mở hộp tham số" : "Đóng hộp tham số";
  }
  valueChange(evt: any, a?: any,type?: any ){

  }

}
