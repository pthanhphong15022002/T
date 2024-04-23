import {
  Component,
  ViewEncapsulation,
  OnInit,
  AfterViewInit,
  TemplateRef,
  ViewChild,
  Injector,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FontModel,
  ProgressAnnotationService,
} from '@syncfusion/ej2-angular-progressbar';
import {
  CRUDService,
  CodxService,
  DataService,
  DialogModel,
  FormModel,
  NotificationsService,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
  AuthStore
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupAddProjectComponent } from './popup-add-project/popup-add-project.component';
import { PopupProjectDetailsComponent } from './popup-project-details/popup-project-details.component';

@Component({
  selector: 'lib-projects',
  templateUrl: './pm-projects.component.html',
  styleUrls: ['./pm-projects.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ProgressAnnotationService],
})
export class ProjectsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  views: Array<ViewModel> = [];
  entityName: string = 'PM_Projects';
  service: string = 'PM';
  assemblyName: string = 'ERM.Business.PM';
  className: string = 'ProjectsBusiness';
  method: string = 'GetListProjectAsync';
  idField: string = 'recID';
  button: any;
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
  labelStyle: FontModel = {
    textAlignment: 'Center',
    text: '40% Complete (Success)',
    color: '#000',
  };
  formModel: FormModel;
  animation: any = { enable: true, duration: 2000, delay: 0 };

  @ViewChild('headerTemplate') headerTemplate: TemplateRef<any>;
  @ViewChild('templateList') templateList: TemplateRef<any>;
  @ViewChild('templateCard') templateCard: TemplateRef<any>;

  constructor(
    private injector: Injector,
    private routerActive: ActivatedRoute,
    private shareService: CodxShareService,
    private notificationSv: NotificationsService,
    public override codxService: CodxService,
    private authStore:AuthStore
  ) {
    super(injector);
    this.button = [{ id: 'btnAdd' }];
    this.funcID = this.routerActive.snapshot.params['funcID'];
    if (this.funcID) {
      this.cache.functionList(this.funcID).subscribe((func: any) => {
        this.formModel = func;
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

  override onInit(): void {}
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.list,
        sameData: true,
        //active: true,
        model: {
          headerTemplate: this.headerTemplate,
          template: this.templateList,
        },
      },
      {
        id: '2',
        type: ViewType.card,
        sameData: true,
        //active: true,
        model: {
          template: this.templateCard,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  viewChanging(e: any) {}

  viewChanged(e: any) {}

  add() {
    this.view.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.formModel;
      option.Width = '800px';
      let dialogAdd = this.callfc.openSide(
        PopupAddProjectComponent,
        [res, 'add', this.grvSetup],
        option
      );
      dialogAdd.closed.subscribe((returnData) => {
        if (returnData?.event) {
          //this.view?.dataService?.update(returnData?.event);
        } else {
          this.view.dataService.clear();
        }
      });
    });
  }

  copy(){

    if(this.view.dataService.dataSelected){
      this.view.dataService.copy().subscribe((res:any)=>{
        let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.formModel;
      option.Width = '800px';
      let dialogAdd = this.callfc.openSide(
        PopupAddProjectComponent,
        [res, 'add', this.grvSetup],
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
  }

  viewProject(title: string){
    if(this.view.dataService.dataSelected){
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.formModel;
      option.Width = '800px';
      let dialog = this.callfc.openSide(
        PopupAddProjectComponent,
        [this.view?.dataService.dataSelected, 'edit', this.grvSetup,true,title],
        option
      );
      dialog.closed.subscribe((returnData) => {
        if (returnData?.event) {
          //this.view?.dataService?.update(returnData?.event);
        } else {
          this.view.dataService.clear();
        }
      });
    }
  }

  edit(title: string) {
    var en = this.authStore.get()?.userID == this.view?.dataService.dataSelected.projectManager? false: true;

    this.view.dataService
      .edit(this.view?.dataService.dataSelected)
      .subscribe(() => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.formModel;
        option.Width = '800px';
        let dialog = this.callfc.openSide(
          PopupAddProjectComponent,
          [this.view?.dataService.dataSelected, 'edit', this.grvSetup, en, title],
          option
        );
        dialog.closed.subscribe((returnData) => {
          if (returnData?.event) {
            //this.view?.dataService?.update(returnData?.event);
          } else {
            this.view.dataService.clear();
          }
        });
      });
  }

  delete() {
    let returnData: any;
    let dataDelete = this.view?.dataService.dataSelected;
    this.view.dataService.delete([dataDelete], true).subscribe((res: any) => {
      if (res) {
        this.detectorRef.detectChanges();
      }
    });
    // this.notificationSv.alertCode('SYS030').subscribe((res: any) => {
    //   if (res.event && res.event.status == 'Y') {
    //     this.view.dataService.dataSelected.stop = true;
    //     this.view.dataService
    //       .edit(this.view?.dataService.dataSelected)
    //       .subscribe(() => {
    //         this.view.dataService.save().subscribe((res: any) => {
    //           if (res?.save || res?.update) {
    //             if (!res.save) {
    //               returnData = res?.update;
    //             } else {
    //               returnData = res?.save;
    //             }
    //             if (!returnData?.error) {
    //               this.view.dataService.data =
    //                 this.view.dataService.data.filter(
    //                   (x: any) => x.recID != returnData?.data?.recID
    //                 );
    //               this.detectorRef.detectChanges();
    //             }
    //           } else {
    //             //Trả lỗi từ backend.
    //             return;
    //           }
    //         });
    //       });
    //   }
    // });
  }

  selectedChange(e: any) {
    this.itemSelected = e?.data ? e?.data : e;
    this.detectorRef.detectChanges();
  }

  clickMF(e: any, data: any) {
    switch (e.functionID) {
      case 'SYS03':
        this.edit(e.data.customName);
        break;
      case 'SYS02':
        this.delete();
        break;
      case 'PMT0102':
        this.pinProject(data);
        break;
      case 'PMT0103':
        this.unPinProject(data);
        break;
      case 'SYS04':
        this.copy();
        break;
        case "SYS05":
          this.viewProject(e.data.customName)
          break;
    }
  }

  changeDataMF(e, data) {
    if (data) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'PMT0102':
            res.disabled = data.isPin;
            break;
          case 'PMT0103':
            res.disabled = !data.isPin;
            break;
        }
      });
    }
  }

  textRender(e: any, data: any, progress: any) {
    e.text = '';
    //e.text = `   Đang thực hiện (${(data.done/data.count)*100}%)`;
  }

  click(e: any) {
    if (e.id == 'btnAdd') {
      this.add();
    }
  }

  getMembers(data: any, field: string) {
    if (data.permissions && data.permissions.length) {
      let arr = data.permissions.map((x: any) => x[field]);
      arr = arr.join(';');
      return arr;
    }
    return data.permissions;
  }

  onDbClick(e: any) {
    let newurl = `pm/projects/${this.funcID}/${this.view?.dataService.dataSelected?.projectID}`;
    this.codxService.navigate('', newurl);
    // let option = new DialogModel();
    // option.DataService = this.view?.dataService;
    // option.IsFull=true;
    // option.zIndex = 999;
    // let dialog = this.callfc.openForm(
    //   PopupProjectDetailsComponent,'',0,0,'',
    //   this.view?.dataService.dataSelected,'',
    //   option
    // );
  }
  toFixed(value: number) {
    if (!value || isNaN(value)) {
      return 0;
    }
    return value % 1 === 0 ? value : value.toFixed(2);
  }

  //#region pin project
  pinProject(data) {
    this.api
      .execSv(
        'PM',
        'PM',
        'ProjectsBusiness',
        'PinProjectAsync',
        this.view.dataService.dataSelected?.recID
      )
      .subscribe((item: any) => {
        if (item) {
          this.itemSelected = item;
          this.view.dataService.update(this.itemSelected, true).subscribe();
          this.codxService.reloadMenuAside();
          this.notificationSv.notifyCode('Ghim thành công');
        } else {
          this.notificationSv.notifyCode('Ghim thất bại');
        }
      });
  }
  unPinProject(data) {
    this.api
    .execSv(
      'PM',
      'PM',
      'ProjectsBusiness',
      'UnPinProjectAsync',
      this.view.dataService.dataSelected?.recID
    )
    .subscribe((item: any) => {
      if (item) {
        this.itemSelected = item;
        this.view.dataService.update(this.itemSelected, true).subscribe();
        this.codxService.reloadMenuAside();
        this.notificationSv.notifyCode('Bỏ ghim thành công');
      } else {
        this.notificationSv.notifyCode('Bỏ ghim thất bại');
      }
    });
  }
  //#endregion
}
