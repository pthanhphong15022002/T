import { ChangeDetectorRef, Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { HomeComponent } from '@pages/home/home.component';
import { TagsComponent } from '@shared/layout/tags/tags.component';
import { DataRequest } from '@shared/models/data.request';
import { ApiHttpService, AuthStore, CodxListviewComponent, ImageviewersComponent } from 'codx-core';
import { ViewBaseComponent } from 'codx-core/lib/layout/views/view-base/view-base.component';
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


  @Input('viewBase') viewBase: ViewBaseComponent;
  
  constructor(
    private tmSv: TmService,
    // private mainService: MainService,
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
    this.fromDate =moment("3/31/2022").toDate();
    this.toDate = moment("4/30/2022").toDate();
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
    this.api.callSv("TM", "ERM.Business.TM", "TaskBusiness", "GetTaskByParentIDAsync", [this.itemSelected?.id]).subscribe(res => {

      if (res && res.msgBodyData[0]?.length > 0) {
        let objectId = res.msgBodyData[0][0].owner;
        let objectState = res.msgBodyData[0][0].status;
        for (let i = 1; i < res.msgBodyData[0]?.length; i++) {
          objectId += ";" + res.msgBodyData[0][i].owner;
          objectState += ";" + res.msgBodyData[0][i].status;
        };
        this.objectAssign = objectId;
        this.objectState = objectState;
      }
    })

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
      this.api.callSv("TM", "ERM.Business.TM", "TaskBusiness", "GetTaskByParentIDAsync", [task?.id]).subscribe(res => {
        if (res && res.msgBodyData[0]?.length > 0) {
          res.msgBodyData[0].forEach(element => {
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
}
