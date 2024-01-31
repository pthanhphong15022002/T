import { Component, ViewEncapsulation, OnInit, AfterViewInit, TemplateRef, ViewChild, Injector } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ProgressAnnotationService } from "@syncfusion/ej2-angular-progressbar";
import { CodxService, FormModel, NotificationsService, ResourceModel, SidebarModel, UIComponent, ViewModel, ViewType } from "codx-core";
import { CodxShareService } from "projects/codx-share/src/public-api";
import { PopupAddProjectComponent } from "./popup-add-project/popup-add-project.component";

@Component({
  selector: 'lib-projects',
  templateUrl: './pm-projects.component.html',
  styleUrls: ['./pm-projects.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers:[ProgressAnnotationService]
})
export class ProjectsComponent
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

  @ViewChild('headerTemplate') headerTemplate: TemplateRef<any>;
  @ViewChild('templateList') templateList: TemplateRef<any>;

  constructor(
    private injector: Injector,
    private routerActive: ActivatedRoute,
    private shareService: CodxShareService,
    private notificationSv: NotificationsService,
    public override codxService : CodxService

  ) {
    super(injector);
    this.button = [{ id: 'btnAdd' }]
    this.funcID = this.routerActive.snapshot.params['funcID'];
    if(this.funcID){
      this.cache.functionList(this.funcID).subscribe((func: any) => {
        this.formModel=func;
        if (func?.formName && func?.gridViewName) {
          this.cache
            .gridViewSetup(func.formName, func.gridViewName)
            .subscribe((grd: any) => {
              if (grd) {
                this.grvSetup = grd;
              }
            });
        }
      });
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
          headerTemplate:this.headerTemplate,
          template:this.templateList
        },
      },

    ];
    this.detectorRef.detectChanges();
  }

  viewChanging(e:any){

  }

  viewChanged(e:any){

  }

  add(){
    this.view.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.formModel;
      option.Width = '800px';
      let dialogAdd = this.callfc.openSide(
        PopupAddProjectComponent,
        [res,'add'],
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

  selectedChange(e:any){

  }

  clickMF(e:any,data:any){

  }

  textRender(e:any,data:any){
    e.text = `   Đang thực hiện (${(data.done/data.count)*100}%)`;
  }

  click(e:any){
    if(e.id=='btnAdd'){
      this.add();
    }
  }

}
