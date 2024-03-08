import { Component, ViewEncapsulation, OnInit, AfterViewInit, Injector, Optional, OnChanges, SimpleChanges, Input, ViewChild, TemplateRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ProgressAnnotationService } from "@syncfusion/ej2-angular-progressbar";
import { AuthStore, CodxService, DialogData, DialogRef, FormModel, NotificationsService, PageTitleService, ResourceModel, SidebarModel, UIComponent, ViewModel, ViewType } from "codx-core";
import { CodxShareService } from "projects/codx-share/src/public-api";
import { PopupAddTaskComponent } from "../popup-add-task/popup-add-task.component";
import { PopupViewTaskComponent } from "../popup-view-task/popup-view-task.component";
import { TreeViewComponent } from "projects/codx-share/src/lib/components/codx-tasks/tree-view/tree-view.component";

@Component({
  selector: 'lib-view-tasks',
  templateUrl: './lib-view-tasks.component.html',
  styleUrls: ['./lib-view-tasks.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ProgressAnnotationService],
})
export class ProjectTasksViewComponent
  extends UIComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input() projectID: any;
  @Input() projectData: any;
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('treeView') treeView!: TemplateRef<any>;
  @ViewChild('viewTree') viewTree!: TreeViewComponent;

  views:  Array<ViewModel> = [];;
  entityName:string = 'TM_Tasks';
  service:string='TM';
  assemblyName:string='ERM.Business.TM';
  className:string="TaskBusiness";
  method:string="GetTasksAsync";
  predicate:string = 'ProjectID=@0&&Category=@1'
  datavalue:string=''
  idField:string='recID';
  button:any;
  itemSelected: any;
  grvSetup: any;
  request: ResourceModel;
  container: Object = {
    width: 30,
    roundedCornerRadius: 20,
    backgroundColor: '#D6D6D6',
    type: 'RoundedRectangle',
    border: { width: 1 },
  };
  formModel: any;
  vllTab: any;
  dataObj: any = {};
  listRoles: any = [];
  vllStatus: any = [];
  user: any;

  constructor(
    private injector: Injector,
    private routerActive: ActivatedRoute,
    private shareService: CodxShareService,
    private notificationSv: NotificationsService,
    public override codxService: CodxService,
    private pageTitle: PageTitleService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.funcID = 'PMT0101';
    this.button = [{ id: 'btnAdd' }];
    this.cache.functionList(this.funcID).subscribe((res: any) => {
      this.formModel = res;
      if(this.formModel){
        this.datavalue = this.formModel.dataValue;
        this.predicate = this.formModel.predicate;
        this.predicate = '('+this.predicate+')&&ProjectID=@2'
      }
      this.router.params.subscribe((res: any) => {
        if (res['projectID']) {
          this.projectID = res['projectID'];
          this.datavalue = this.datavalue+';'+this.projectID ;
          this.getProject(this.projectID);
        }
      });
      this.router.queryParams.subscribe((res: any) => {
        if (res['ProjectID']) {
          this.projectID = res['ProjectID'];
          this.datavalue = this.datavalue+';'+this.projectID ;;
          this.getProject(this.projectID);
        }
      });
    });

    this.cache.valueList('PM013').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
    this.cache.valueList('PM012').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.vllStatus = res.datas;
      }
    });
    this.user = this.authStore.get();
  }

  getProject(projectID) {
    if (projectID) {
      this.api
        .execSv(
          'PM',
          'ERM.Business.PM',
          'ProjectsBusiness',
          'GetProjectByIDAsync',
          projectID
        )
        .subscribe((res: any) => {
          if (!this.projectData) this.projectData = res;
          setTimeout(() => {
            this.pageTitle.setSubTitle(this.projectData.projectName);
          }, 1000);
        });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectID']) {
      this.dataObj['projectID'] = changes['projectID'].currentValue;
    }
    if (changes['projectData']) {
      this.dataObj = changes['projectData'].currentValue;
    }
  }

  override onInit(): void {}

  taskSettings = {
    id: 'recID',
    name: 'taskName',
    startDate: 'startDate',
    endDate: 'endDate',
    parentID: 'parentID',
  };
  ngAfterViewInit(): void {
    this.views = [
      // {
      //   id: '1',
      //   type: ViewType.listtree,
      //   sameData: true,
      //   //active: true,
      //   request: {
      //     parentIDField: 'parentID',
      //   },
      //   model: {
      //     template: this.itemViewList,
      //     resourceModel: {
      //       parentIdField: 'parentID',
      //     },
      //   },
      // },
      {
        id: '2',
        type: ViewType.gantt,
        sameData: true,
        //active: true,

        model: {
          eventModel: this.taskSettings,
        },
      },
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        text: this.user?.language == 'VN' ? 'Cây công việc' : 'Tree Assign',
        //icon: 'icon-account_tree',
        model: {
          panelLeftRef: this.treeView,
        },
      },

    ];
    this.detectorRef.detectChanges();
  }

  addTask(parentID?: any) {
    this.view.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      res.projectID = this.projectData.projectID;
      if (parentID) res.parentID = parentID;
      let dialogAdd = this.callfc.openSide(
        PopupAddTaskComponent,
        [res, 'add', this.projectData,this.viewTree],
        option
      );
      dialogAdd.closed.subscribe((returnData) => {
        if (returnData?.event) {
          if(this.viewTree && this.viewTree.dataTree){
            this.viewTree.treeView.setNodeTree(returnData?.event);
            //this.viewTree.dataTree = this.viewTree.dataTree;
            this.detectorRef.detectChanges();
          }
          //this.view?.dataService?.update(returnData?.event);
        } else {
          this.view.dataService.clear();
        }
      });
    });
  }

  editTask() {
    if (this.view.dataService.dataSelected) {
      if(this.view.dataService.dataSelected.category == 'G'){
        //do something here
      }
      else{
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        //option.zIndex = 9997;
        let dialogAdd = this.callfc.openSide(
          PopupAddTaskComponent,
          [this.view.dataService.dataSelected, 'edit', this.projectData],
          option
        );
        dialogAdd.closed.subscribe((returnData) => {
          if (returnData?.event) {
            if (returnData.event == 'assignTask') {
              setTimeout(() => {
                this.addTask(this.view.dataService.dataSelected?.recID);
              }, 100);
            }
            this.viewTree.treeView.setNodeTree(returnData?.event);
            //this.view?.dataService?.update(returnData?.event);
          } else {
            this.view.dataService.clear();
          }
        });
      }

    }
  }

  copyTask(){
    if(!this.view.dataService.dataSelected) return;
    let data = JSON.parse(JSON.stringify(this.view.dataService.dataSelected));
    this.view.dataService.copy().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      res.parentID=data.parentID;
      res.startDate = data.startDate;
      res.endDate = data.endDate;
      res.priority = data.priority;
      res.approveControl = data.approveControl;
      res.status = '10';
      let dialogAdd = this.callfc.openSide(
        PopupAddTaskComponent,
        [res, 'copy', this.projectData,this.viewTree],
        option
      );
      dialogAdd.closed.subscribe((returnData) => {
        if (returnData?.event) {
          if(this.viewTree && this.viewTree.dataTree){
            this.viewTree.treeView.setNodeTree(returnData?.event);
            //this.viewTree.dataTree = this.viewTree.dataTree;
            this.detectorRef.detectChanges();
          }
          //this.view?.dataService?.update(returnData?.event);
        } else {
          this.view.dataService.clear();
        }
      });
    });
  }
  deleteTask(data){
    //this.view.dataService.dataSelected = data;
    if (data.status == '90') {
      this.notificationSv.notifyCode('TM017');
      return;
    }
    if (
      data.category == '2' &&
      !(data.parentID == null && data.createdBy == this.user.userID)
    ) {
      this.notificationSv.notifyCode('TM018');
      return;
    }
    if (data.category == '1') {
      this.deleteConfirm(data);
      return;
    }
    var isCanDelete = true;
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetListTaskChildDetailAsync',
        data.taskID
      )
      .subscribe((res: any) => {
        if (res) {
          if(data.category == "G" && res.length){
            isCanDelete = false;
            this.notificationSv.notifyCode('TM001');
            return;
          }
          res.forEach((element) => {
            if (element.status != '00' && element.status != '10') {
              isCanDelete = false;
              this.notificationSv.notifyCode('TM001');
              return;
            }
          });
          if (!isCanDelete) {
            this.notificationSv.notifyCode('TM001');
          } else {
            this.deleteConfirm(data);
          }
        }
      });
  }

  deleteConfirm(data) {
    this.notificationSv.alertCode('TM003').subscribe((confirm) => {
      if (confirm?.event && confirm?.event?.status == 'Y') {
        this.api.execSv<any>(
          'TM',
          'TM',
          'TaskBusiness',
          'DeleteTaskAsync',
          data.taskID
        ).subscribe((res:any)=>{
          if (res) {
            var listTaskDelete = res[0];
            var parent = res[1];
            listTaskDelete.forEach((x) => {
              this.view.dataService.remove(x).subscribe();
            });
            this.view.dataService.onAction.next({ type: 'delete', data: data });
            this.notificationSv.notifyCode('TM004');
            if (parent) {
              this.view.dataService.update(parent).subscribe();
            }
            this.itemSelected = this.view.dataService.data[0];
            if(this.viewTree.treeView){
              this.viewTree.treeView.removeNodeTree(data.recID);
            }
            this.detectorRef.detectChanges();
          }
        })

      }
    });
  }

  dbClick(data:any){
    this.view.dataService.dataSelected=data;
    this.viewTask();
  }
  viewTask(){
    // if(this.view.dataService.dataSelected){
    //   let option = new SidebarModel();
    //   option.DataService = this.view?.dataService;
    //   option.FormModel = this.formModel;
    //   option.Width = '550px';
    //   option.zIndex=9997;
    //   let dialogAdd = this.callfc.openSide(
    //     PopupViewTaskComponent,
    //     {data:this.view.dataService.dataSelected,projectData:this.projectData},
    //     option
    //   );
    //   dialogAdd.closed.subscribe((returnData) => {
    //     if (returnData?.event) {

    //       //this.view?.dataService?.update(returnData?.event);
    //     } else {
    //       this.view.dataService.clear();
    //     }
    //   });
    // }

    if (this.view.dataService.dataSelected) {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '850px';
      let dialogAdd = this.callfc.openSide(
        PopupAddTaskComponent,
        [this.view.dataService.dataSelected, 'view', this.projectData],
        option
      );
      dialogAdd.closed.subscribe((returnData) => {
        if (returnData?.event) {
          // if (returnData.event == 'assignTask') {
          //   setTimeout(() => {
          //     this.addTask(this.view.dataService.dataSelected?.recID);
          //   }, 100);
          // }
          // this.viewTree.treeView.setNodeTree(returnData?.event);
          //this.view?.dataService?.update(returnData?.event);
        } else {
          this.view.dataService.clear();
        }
      });
    }
  }

  click(e: any) {
    if (e.id == 'btnAdd') {
      this.addTask();
    }
  }

  clickMF(e: any) {
    switch (e.functionID) {
      case 'SYS03':
        this.editTask();
        break;
      case 'SYS02':
        this.deleteTask(this.view.dataService.dataSelected);
      break;
      case "SYS05":
        this.viewTask()
        break;
      case "SYS04":
        this.copyTask()
      break;
      case "PMT01011":
        this.addTask(this.view.dataService.dataSelected?.recID);
      break;

    }
  }

  addChild(data:any){
    if(data){
      this.addTask(data.recID);
    }
  }

  clickMFTree(e:any){
    if(e.e && e.data){
      this.view.dataService.dataSelected = e.data;
      this.clickMF(e.e);
    }
  }

  treeSelect(e:any){
    this.view.dataService.dataSelected = e;
  }
}
