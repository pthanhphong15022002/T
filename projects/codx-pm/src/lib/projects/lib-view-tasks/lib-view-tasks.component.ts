import { Component, ViewEncapsulation, OnInit, AfterViewInit, Injector, Optional, OnChanges, SimpleChanges, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ProgressAnnotationService } from "@syncfusion/ej2-angular-progressbar";
import { CodxService, DialogData, DialogRef, FormModel, NotificationsService, ResourceModel, UIComponent, ViewModel, ViewType } from "codx-core";
import { CodxShareService } from "projects/codx-share/src/public-api";

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

  views:  Array<ViewModel> = [];;
  entityName:string = 'PM_Projects';
  service:string='TM';
  assemblyName:string='ERM.Business.TM';
  className:string="TaskBusiness";
  method:string="GetTasksAsync";
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

  constructor(
    private injector: Injector,
    private routerActive: ActivatedRoute,
    private shareService: CodxShareService,
    private notificationSv: NotificationsService,
    public override codxService : CodxService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef

  ) {
    super(injector);
    this.funcID='PMT0101';
    this.button = [{ id: 'btnAdd' }];
    this.cache.functionList(this.funcID).subscribe((res:any)=>{
      this.formModel = res;
    })
    this.cache.valueList('PM006').subscribe((res:any)=>{
      this.vllTab = res;
      debugger
    });
    debugger
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['projectID']){
     this.dataObj['projectID']=changes['projectID'].currentValue
    }
  }

  override onInit(): void {

  }
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.list,
        sameData: true,
        //active: true,
        model: {
        },
      },

    ];
    this.detectorRef.detectChanges();
  }

}
