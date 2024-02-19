import { Component, ViewEncapsulation, OnInit, AfterViewInit, Injector } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ProgressAnnotationService } from "@syncfusion/ej2-angular-progressbar";
import { CodxService, FormModel, NotificationsService, ResourceModel, UIComponent, ViewModel, ViewType } from "codx-core";
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
  implements OnInit, AfterViewInit
{

  views:  Array<ViewModel> = [];;
  entityName:string = 'PM_Projects';
  service:string='PM';
  assemblyName:string='ERM.Business.PM';
  className:string="ProjectsBusiness";
  method:string="GetListProjectAsync";
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

  constructor(
    private injector: Injector,
    private routerActive: ActivatedRoute,
    private shareService: CodxShareService,
    private notificationSv: NotificationsService,
    public override codxService : CodxService

  ) {
    super(injector);
    this.funcID='PMT011';
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
