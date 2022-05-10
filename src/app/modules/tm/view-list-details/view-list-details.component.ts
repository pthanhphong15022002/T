import { ChangeDetectorRef, Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { HomeComponent } from '@pages/home/home.component';
import { TagsComponent } from '@shared/layout/tags/tags.component';
import { DataRequest } from '@shared/models/data.request';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, AuthStore, CodxListviewComponent, ImageviewersComponent, NotificationsService, ViewsComponent } from 'codx-core';
import * as moment from "moment";
import { ActionTypeOnTask } from '../models/enum/enum';
import { DataSv } from '../models/task.model';
import { TmService } from '../tm.service';



@Component({
  selector: 'app-view-list-details',
  templateUrl: './view-list-details.component.html',
  styleUrls: ['./view-list-details.component.scss']
})
export class ViewListDetailsComponent implements OnInit {
  @Input() data = [];
  taskChild = [] ;
  user: any;
  objectAssign: any;
  objectState: any;
  itemSelected = null;
  moment = moment().locale("en");
  today: Date = new Date();
  fromDate: Date = moment(this.today).startOf("day").toDate();
  toDate: Date = moment(this.today).endOf("day").toDate();
  configParam = null;
  dateNow: string = '';
  yesterday = '';
  lstItems = [];
  dataObj = { view: "listDetails", viewBoardID: "" };
  gridView: any;
  listUserTask =[] ;
  listNode =[] ;
  isFinishLoad = false ;
  taskAction : any ; 

  @Input('viewBase') viewBase: ViewsComponent;
  
  constructor(
    private tmSv: TmService,
    private notiService: NotificationsService ,
    // private changeDetectorRef: ChangeDetectorRef,
    // private confirmationDialogService: ConfirmationDialogService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private dt: ChangeDetectorRef,
    injector: Injector
  ) {
    this.user = this.authStore.get();
  }

  ngOnInit(): void {
    this.dateNow = this.formatDateLocal(this.today)
    this.yesterday = this.formatDateLocal(this.getYesterday());
    this.loadData();
  }

  ngAfterViewInit(): void {
  }
  loadData(){
    let fied = this.gridView?.dateControl || 'DueDate';
    let model = new DataRequest();
    model.formName = 'Tasks';
    model.gridViewName = 'grvTasks';
    model.entityName = 'TM_Tasks';
    model.predicate = '';
    model.funcID = "TM003"//this.viewBase.funcID ;
    model.page = 1;
    model.pageSize = 100;
    // model.dataValue = this.user.userID;
   // set max dinh
    this.fromDate =moment("4/15/2022").toDate();
    this.toDate = moment("5/15/2022").toDate();
    model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: fied, value: this.fromDate }, ///cho mac dinh cho filter
        { operator: 'lte', field: fied, value:  this.toDate },
      ],
    };
    // let dataObj = { view: this.view, viewBoardID: '' };

    model.dataObj =  "{\"view\":\"2\"}" //JSON.stringify(this.dataObj);
    const t = this;
    this.lstItems = [];
    t.tmSv.loadTaskByAuthen(model).subscribe(
      (res) => {
      if (res && res.length) {
        this.data = res[0];
        this.lstItems= res[1]
       this.itemSelected = res[1][0] ;  
       this.api.execSv<any>("TM", "ERM.Business.TM", "TaskBusiness", "GetTaskByParentIDAsync", [this.itemSelected?.id]).subscribe(res => {
        if (res && res.length > 0) {
          let objectId = res[0].owner;
          let objectState = res[0].status;
          for (let i = 1; i < res?.length; i++) {
            objectId += ";" + res[i].owner;
            objectState += ";" + res[i].status;
          };
          this.objectAssign = objectId;
          this.objectState = objectState;
        }
      }) ;

      if(this.itemSelected?.category !="1"){
        this.api.execSv<any>("TM", "ERM.Business.TM", "TaskBusiness", "GetListTasksTreeAsync", this.itemSelected?.id).subscribe(res=>{
          this.listNode = res;
          this.isFinishLoad = true ;
      })}
      }else{
        this.data=[] ;
      }
     
      t.dt.detectChanges();
      });
  }

  trackByFn(index: number, item): string {
    return item.taskID;
  }

  clickItem(item) {
    this.getOneItem(item.id)

  }
  getOneItem(id) {
    var itemDefault = this.lstItems.find((item) => item.id == id);
    if (itemDefault != null) {
      this.itemSelected = itemDefault;
    } else {
      this.itemSelected = this.lstItems[0];
    }

    this.api.execSv<any>("TM", "ERM.Business.TM", "TaskBusiness", "GetTaskByParentIDAsync", [this.itemSelected?.id]).subscribe(res => {
      if (res && res.length > 0) {
        let objectId = res[0].owner;
        let objectState = res[0].status;
        for (let i = 1; i < res?.length; i++) {
          objectId += ";" + res[i].owner;
          objectState += ";" + res[i].status;
        };
        this.objectAssign = objectId;
        this.objectState = objectState;
      }
    });
    console.log(this.itemSelected)
    if(this.itemSelected?.category !="1"){
      this.api.execSv<any>("TM", "ERM.Business.TM", "TaskBusiness", "GetListTasksTreeAsync", this.itemSelected?.id).subscribe(res=>{
        this.listNode = res;
    })}
  }

  onChangeStatusTask(data) {
    if (data.actionType == ActionTypeOnTask.ChangeStatus) {
      this.tmSv.onChangeStatusTask(data.data.taskID, data.value);
    }
  }

  getByParentID(task) {
    let objectId = "";
    let objectState = "";
    if (task != null) {
      this.api.execSv<any>("TM", "ERM.Business.TM", "TaskBusiness", "GetTaskByParentIDAsync", [task?.id]).subscribe(res => {
        if (res && res?.length > 0) {
          res.forEach(element => {
            objectId += ";" + element.owner;
            objectState += ";" + element.status;
          })
        }
      })
    }
    this.objectAssign = objectId;
    return objectState;
  }
  formatDateLocal(date: Date): string {
    var month = '';
    var day = '';
    if (date.getMonth() + 1 < 10) {
      month = '0' + (date.getMonth() + 1);
    }
    if (date.getDate() < 10) {
      day = '0' + date.getDate()
    } else {
      day = date.getDate().toString();
    }
    return day + '/' + month + '/' + date.getFullYear();
  }

  getYesterday(): Date {
    var date = new Date(this.today);
    date.setDate(date.getDate() - 1);
    return date;
  }

  formatDateCreatedOn(day: string): string {
    var year = day.substring(0, 4);
    var mm = day.substring(5, 7);
    var dd = day.substring(8, 10)
    return dd + "/" + mm + "/" + year
  }
  // getValueCMParameter() {
  //   const perdicate =
  //     "FieldName=@0 or FieldName=@1 or FieldName=@2 or FieldName=@3";
  //   const fieldName =
  //     "ProjectControl;LocationControl;UpdateControl;PlanControl";
  //   this.tmSv
  //     .getValueCMParameter(
  //       `FormName = 'TM_Parameters' AND (${perdicate})`,
  //       fieldName
  //     )
  //     .subscribe((result) => {
  //       this.configParam = this.mainService.convertListToObject(
  //         result as [],
  //         "fieldName",
  //         "fieldValue"
  //       );
  //     });
  // }


  ///test control
  showControl(p,item){
    this.taskAction = item ;
    p.open();
  }
  viewDetailTask(taskAction){
    alert("edit data")
    this.viewBase.currentView.openSidebarRight() ; /// vi sao call ko dc 
  }

  copyDetailTask(taskAction){
    alert("copy data")}

  clickDelete(taskAction){
    
    if(taskAction.status == 9){
        // this.notiService.notifyCode("TM001")
      this.notiService.notify("Không thể xóa công việc này. Vui lòng kiểm tra lại!") ;
      return ;
    }
    var isCanDelete = true ;
    var listTask = [] ;
    this.api.execSv<any>("TM", "ERM.Business.TM", "TaskBusiness", "GetListTaskChildDetail", taskAction.id).subscribe(res=>{
      listTask = res;
    })
   
    listTask.forEach(t=>{
      if(t.status != '1'){
        isCanDelete = false ; 
      }
    })
    if(!isCanDelete){
      // this.notiService.notifyCode("TM001")
      this.notiService.notify("Đã có phát sinh công việc liên quan, không thể xóa công việc này. Vui lòng kiểm tra lại!") ;
      return ;
    }
    var message = "Bạn có chắc chắn muốn xóa task này !"
    this.notiService
      .alert('Cảnh báo', message, { type: 'YesNo' })
      .subscribe((dialog: Dialog) => {
        dialog.close = this.close;
      });
      // this.notiService
      // .alertCode("TM003", { type: 'YesNo' })
      // .subscribe((dialog: Dialog) => {
      //   dialog.close = this.close;
      //   console.log(dialog);
      // });
  }

  viewItem(taskAction){
    alert("xem data")
  }

  close(e: any ) {
  if(e?.event?.status =="Y"){
   this.tmSv.deleteTask(this.taskAction.id).subscribe(res=>{
      if(res){
       return this.notiService.notifyCode("Xóa task thành công !")
        // this.notiService.notifyCode("TM004")
      }
      this.notiService.notifyCode("Xóa task không thành công. Vui lòng kiểm tra lại !")
    })
  }
  }

}
