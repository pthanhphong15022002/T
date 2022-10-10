import { Component, Input, OnInit, TemplateRef, ViewChild, Injector, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, ButtonModel, DataRequest, DialogRef, RequestOption, ResourceModel, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopupAddProcessStepsComponent } from './popup-add-process-steps/popup-add-process-steps.component';

@Component({
  selector: 'lib-processsteps',
  templateUrl: './processsteps.component.html',
  styleUrls: ['./processsteps.component.css']
})
export class ProcessstepsComponent extends UIComponent implements OnInit {
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;

  @Input() showButtonAdd = true;
  @Input() dataObj?: any;

  model?: DataRequest;
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  modelResource: ResourceModel;
  resource: ResourceModel;
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  dialog!: DialogRef;
  user: any;
  funcID: any;
  titleAction = '';
  itemSelected: any;
  stepType ='A'

  service = 'BP';
  entityName = 'BP_ProcessSteps';
  idField = 'recID';
  assemblyName = 'ERM.Business.BP';
  className = 'ProcessStepsBusiness';
  method = 'GetProcessStepsAsync'; //chua viet

  constructor(
    inject: Injector,
    private dt: ChangeDetectorRef,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  onInit(): void {
    this.button = {
      id: 'P',
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
    
    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'SYS';
    this.resourceKanban.assemblyName = 'SYS';
    this.resourceKanban.className = 'CommonBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';

    this.view.dataService.methodSave = 'AddProcessStepAsync';
    this.view.dataService.methodUpdate = 'UpdateProcessStepAsync';
    this.view.dataService.methodDelete = 'DeleteProcessStepAsync';
    this.dt.detectChanges();
  }



  //#region CRUD bước công việc
  add() {
      this.view.dataService.addNew().subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(
          PopupAddProcessStepsComponent,
          [this.view.dataService.dataSelected,'add', this.titleAction, this.stepType],
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

  edit(data) {
  }

  copy(data) {
  }

  delete(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res[0]) {
          this.itemSelected = this.view.dataService.data[0];
        }
      });
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteProcessStepAsync';

    opt.data = itemSelected.processID;
    return true;
  }
  //#endregion


  //#region event
  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    this.stepType =evt.id ;
    this.add();
    // switch (evt.id) {
    //   case 'btnAdd':
    //   case 'A':
    //   case 'P':
    //   case 'Q':
    //     this.add();
    //     break;
    // }
  }

  receiveMF(e: any) {
    this.clickMF(e.e, e.data);
  }

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
}
