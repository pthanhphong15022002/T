import { Component, ViewEncapsulation, OnInit, AfterViewInit, TemplateRef, ViewChild, Injector } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ProgressAnnotationService } from "@syncfusion/ej2-angular-progressbar";
import { CRUDService, CodxService, DataService, DialogModel, FormModel, NotificationsService, ResourceModel, SidebarModel, UIComponent, ViewModel, ViewType } from "codx-core";
import { CodxShareService } from "projects/codx-share/src/public-api";
import { PopupAddProjectComponent } from "./popup-add-project/popup-add-project.component";
import { PopupProjectDetailsComponent } from "./popup-project-details/popup-project-details.component";

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

  edit(){
    this.view.dataService.edit(this.view?.dataService.dataSelected).subscribe(()=>{
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.formModel;
      option.Width = '800px';
      let dialog = this.callfc.openSide(
        PopupAddProjectComponent,
        [this.view?.dataService.dataSelected,'edit'],
        option
      );
      dialog.closed.subscribe((returnData) => {
        if (returnData?.event) {
          //this.view?.dataService?.update(returnData?.event);
        } else {
          this.view.dataService.clear();
        }
      });
    })

  }

  delete(){
    let returnData:any;
    this.notificationSv.alertCode('SYS030').subscribe((res:any)=>{
      if(res.event && res.event.status == 'Y'){
        this.view.dataService.dataSelected.stop=true;
        this.view.dataService.edit(this.view?.dataService.dataSelected).subscribe(()=>{
          this.view.dataService
          .save()
          .subscribe((res:any) => {
            if (res?.save || res?.update) {
              if (!res.save) {
                returnData = res?.update;
              } else {
                returnData = res?.save;
              }
              if (!returnData?.error) {
                this.view.dataService.data = this.view.dataService.data.filter((x:any)=>x.recID!= returnData?.data?.recID);
                this.detectorRef.detectChanges();
              }
            } else {
              //Trả lỗi từ backend.
              return;
            }
          });
        })


          }
        })
       }

  selectedChange(e:any){

  }

  clickMF(e:any,data:any){
    switch (e.functionID) {
      case 'SYS03':
        this.edit();
        break;
      case 'SYS02':
        this.delete();
      break;
      default:
        break;
    }
  }

  textRender(e:any,data:any){
    e.text = `   Đang thực hiện (${(data.done/data.count)*100}%)`;
  }

  click(e:any){
    if(e.id=='btnAdd'){
      this.add();
    }
  }

  getMembers(data:any,field:string){
    if(data.permissions && data.permissions.length){
      let arr = data.permissions.map((x:any)=>x[field]);
      arr =arr.join(';')
      return arr;
    }
    return data.permissions;
  }

  onDbClick(e:any){

    let option = new DialogModel();
    option.DataService = this.view?.dataService;
    option.IsFull=true;
    let dialog = this.callfc.openForm(
      PopupProjectDetailsComponent,'',0,0,'',
      this.view?.dataService.dataSelected,'',
      option
    );
  }
}
