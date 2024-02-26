import { Component, ViewEncapsulation, OnInit, AfterViewInit, Injector, Optional, OnChanges, SimpleChanges, Input, ViewChild, TemplateRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ProgressAnnotationService } from "@syncfusion/ej2-angular-progressbar";
import { AuthStore, CodxService, DialogData, DialogRef, FormModel, NotificationsService, PageTitleService, ResourceModel, SidebarModel, UIComponent, ViewModel, ViewType } from "codx-core";
import { CodxShareService } from "projects/codx-share/src/public-api";
import { PopupAddTaskComponent } from "../popup-add-task/popup-add-task.component";

@Component({
  selector: 'lib-view-tasks',
  templateUrl: './lib-view-tasks.component.html',
  styleUrls: ['./lib-view-tasks.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers:[ProgressAnnotationService]
})
export class ProjectTasksViewComponent
  extends UIComponent
  implements OnInit, AfterViewInit,OnChanges
{


  @Input() projectID:any;
  @Input() projectData:any;
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
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
  grvSetup:any;
  request: ResourceModel;
  container: Object = {
    width: 30,
    roundedCornerRadius: 20,
    backgroundColor: '#D6D6D6',
    type: 'RoundedRectangle',
    border: { width: 1 }
}
  formModel:FormModel;
  vllTab:any;
  dataObj:any={};
  listRoles:any=[];
  vllStatus:any=[];
  user:any;

  constructor(
    private injector: Injector,
    private routerActive: ActivatedRoute,
    private shareService: CodxShareService,
    private notificationSv: NotificationsService,
    public override codxService : CodxService,
    private pageTitle: PageTitleService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef

  ) {
    super(injector);
    this.funcID='PMT0101';
    this.button = [{ id: 'btnAdd' }];
    this.cache.functionList(this.funcID).subscribe((res:any)=>{
      this.formModel = res;
    })
    this.router.params.subscribe((res:any)=>{
      if(res['projectID']){
        this.projectID = res['projectID'];
        this.datavalue=this.projectID+';3'
        this.getProject(this.projectID);
      }
    })
    this.router.queryParams.subscribe((res:any)=>{
      if(res['ProjectID']){
        this.projectID = res['ProjectID'];
        this.datavalue=this.projectID+';3'
        this.getProject(this.projectID);
      }
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

  getProject(projectID){
    if(projectID){
      this.api.execSv('PM','ERM.Business.PM','ProjectsBusiness','GetProjectByIDAsync',projectID).subscribe((res:any)=>{
        if(!this.projectData)this.projectData= res;
        setTimeout(()=>{this.pageTitle.setSubTitle(this.projectData.projectName)},1000)
      })
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['projectID']){
     this.dataObj['projectID']=changes['projectID'].currentValue
    }
    if(changes['projectData']){
     this.dataObj=changes['projectData'].currentValue
    }
  }

  override onInit(): void {

  }

  taskSettings = {
    id: 'recID',
    name: 'taskName',
    startDate: 'startDate',
    endDate: 'endDate',
    parentID:'parentID'
  };
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.listtree,
        sameData: true,
        //active: true,
        request:{
          parentIDField:'parentID'
        },
        model: {
          template:this.itemViewList,
          resourceModel:{
            parentIdField:'parentID'
          },

        },
      },
      {
        id: '2',
        type: ViewType.gantt,
        sameData: true,
        //active: true,

        model: {
          eventModel: this.taskSettings,
        },
      },

    ];
    this.detectorRef.detectChanges();
  }

  addTask(parentID?:any){
    this.view.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.formModel;
      option.Width = '550px';
      option.zIndex=9997;
      res.projectID=this.projectData.projectID;
      if(parentID) res.parentID=parentID;
      let dialogAdd = this.callfc.openSide(
        PopupAddTaskComponent,
        [res,'add',this.projectData],
        option
      );
      dialogAdd.closed.subscribe((returnData) => {
        if (returnData?.event) {
          //this.view?.dataService?.update(returnData?.event);
        } else {
          this.view.dataService.clear();
        }
      });

    })
  }

  editTask(){
    if(this.view.dataService.dataSelected){
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.formModel;
      option.Width = '850px';
      option.zIndex=9997;
      let dialogAdd = this.callfc.openSide(
        PopupAddTaskComponent,
        [this.view.dataService.dataSelected,'edit',this.projectData],
        option
      );
      dialogAdd.closed.subscribe((returnData) => {
        if (returnData?.event) {
          if(returnData.event=='assignTask'){
            setTimeout(()=>{
              this.addTask(this.view.dataService.dataSelected?.recID)
            },100)

          }
          //this.view?.dataService?.update(returnData?.event);
        } else {
          this.view.dataService.clear();
        }
      });
    }

  }

  deleteTask(){

  }

  click(e:any){
    if(e.id=='btnAdd'){
      this.addTask()
    }
  }

  clickMF(e:any){
    switch (e.functionID) {
      case 'SYS03':
        this.editTask();
        break;
      case 'SYS02':
        this.deleteTask();
      break;
      default:
        break;
    }
  }
}
