import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  DialogRef,
  NotificationsService,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxBpService } from '../codx-bp.service';
import { PopupAddProcessStepComponent } from './popup-add-processstep/popup-add-processstep.component';

@Component({
  selector: 'lib-processstep',
  templateUrl: './processstep.component.html',
  styleUrls: ['./processstep.component.css'],
})
export class ProcessStepComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;

  model?: DataRequest;
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  modelResource: ResourceModel;
  resource: ResourceModel;
  dialog!: DialogRef;
  titleAction = '';
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  user: any;
  funcID: any;
  itemSelected: any;
  vllStepType = 'BP004';
  arrStepType = [];
  idForm ='T' 

  service = 'BP';
  entityName = 'BP_ProcessSteps';
  idField = 'recID';
  assemblyName = 'ERM.Business.BP';
  className = 'ProcessStepsBusiness';
  method = 'GetProcessStepsAsync'; //chua viet

  constructor(
    inject: Injector,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private svBp: CodxBpService
  ) {
    super(inject);
    this.user = this.authStore.get();
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe((f) => {
      if (f) {
        this.cache.gridViewSetup(f.formName, f.gridViewName).subscribe((gr) => {
          // this.vllStepType = gr['StepType']['referedValue'] ; //dang null
          this.cache.valueList(this.vllStepType).subscribe((res) => {
            if (res) {
              // res.forEach(o=>{
              // })
            }
          });
        });
      }
    });
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
      //setcung tam đoi thuong
      // P;Phase;A;Activity;T;Task;E;Email;E;Calendar;Q;QuEstionarie;I;Interview;C;Check list
      items: [
        {
          id: 'P',
          icon: 'icon-list-checkbox',
          text: 'Phase',
        },
        {
          id: 'A',
          icon: 'icon-list-checkbox',
          text: 'Activity',
        },
        {
          id: 'T',
          icon: 'icon-add_task',
          text: 'Tasks',
        },
        {
          id: 'E',
          icon: 'icon-email',
          text: 'Email',
        },
        {
          id: 'E',
          icon: 'icon-calendar_today',
          text: 'Calendar',
        },
        {
          id: 'Q',
          icon: 'icon-question_answer',
          text: 'Questionarie',
        },
        {
          id: 'I',
          icon: 'icon-list-checkbox',
          text: 'Interview',
        },
        {
          id: 'C',
          icon: 'icon-list-checkbox',
          text: 'Check list',
        },
      ],
    };

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'SYS';
    this.resourceKanban.assemblyName = 'SYS';
    this.resourceKanban.className = 'CommonBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: false,
        sameData: true,
        model: {
          template: this.itemViewList,
        },
      },
      {
        type: ViewType.kanban,
        active: false,
        sameData: false,
        request: this.request,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
        },
      },
    ];
  }

  //#region event
  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    this.idForm =evt.id
    switch (evt.id) {
      case 'btnAdd':
      case 'T':
      case 'E':
      case 'Q':
        this.add();
        break;
    }
  }

  receiveMF(e: any) {
    this.clickMF(e.e, e.data);
  }

  changeDataMF(e, data) {}

  clickMF(e: any, data?: any) {
    this.itemSelected = data;
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS01':
        this.add();
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS02':
        this.delete(data);
    }
  }

  onDragDrop(e: any) {
    console.log(e);
  }
  //#endregion

  //#region CRUD
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(
        PopupAddProcessStepComponent,
        [this.view.dataService.dataSelected, 'add', this.titleAction,this.idForm],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
      });
    });
  }
  edit(data) {}
  copy(data) {}

  delete(data) {}
  //endregion
}
