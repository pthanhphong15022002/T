import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  Injector,
  ChangeDetectorRef,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  DialogRef,
  LayoutService,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxBpService } from '../codx-bp.service';
import { PopupAddProcessStepsComponent } from './popup-add-process-steps/popup-add-process-steps.component';

@Component({
  selector: 'lib-processsteps',
  templateUrl: './processsteps.component.html',
  styleUrls: ['./processsteps.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProcessStepsComponent extends UIComponent implements OnInit {
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;

  showButtonAdd = true;
  dataObj?: any;
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
  stepType: any;
  service = 'BP';
  entityName = 'BP_ProcessSteps';
  idField = 'recID';
  assemblyName = 'ERM.Business.BP';
  className = 'ProcessStepsBusiness';
  method = 'GetProcessStepsAsync'; //chua viet
  listPhaseName = [] ;

  recIDProcess = '90ab82ac-43d1-11ed-83e7-d493900707c4'; ///thêm để add thử
  // test data tra ve la  1 []
  dataTreeProcessStep = [];
  urlBack = '/bp/processes/BPT1'  //gang tam

//view file
 

  constructor(
    inject: Injector,
    private bpService: CodxBpService,
    private layout : LayoutService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    
    this.dataObj = { processID: '90ab82ac-43d1-11ed-83e7-d493900707c4' }; ///de test

    this.layout.setUrl(this.urlBack);//gan tam
    if(! this.dataObj?.processID){
        this.codxService.navigate('',this.urlBack);
    }
  }

  onInit(): void {
    // this.request = new ResourceModel();
    // this.request.service = 'BP';
    // this.request.assemblyName = 'BP';
    // this.request.className = 'ProcessStepsBusiness';
    // this.request.method = 'GetProcessStepsAsync';
    // this.request.idField = 'recID';
    // this.request.dataObj = {processID : '90ab82ac-43d1-11ed-83e7-d493900707c4'};///de test

    //tam coment da
    // this.resourceKanban = new ResourceModel();
    // this.resourceKanban.service = 'SYS';
    // this.resourceKanban.assemblyName = 'SYS';
    // this.resourceKanban.className = 'CommonBusiness';
    // this.resourceKanban.method = 'GetColumnsKanbanAsync';

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
          id: 'M',
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
        sameData: false,
        model: {
          panelRightRef: this.itemViewList,
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

    this.view.dataService.methodSave = 'AddProcessStepAsync';
    this.view.dataService.methodUpdate = 'UpdateProcessStepAsync';
    this.view.dataService.methodDelete = 'DeleteProcessStepAsync';
    this.changeDetectorRef.detectChanges();
  }

  //#region CRUD bước công việc
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';

      this.view.dataService.dataSelected.processID = this.recIDProcess;
      this.dialog = this.callfc.openSide(
        PopupAddProcessStepsComponent,
        [
          this.view.dataService.dataSelected,
          'add',
          this.titleAction,
          this.stepType,
        ],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
        else {
          var processStep = e?.event;
          if (processStep.stepType != 'P') {
            if (processStep.stepType == 'A') {
              this.view.dataService.data.forEach((obj) => {
                if (obj.recID == processStep?.parentID) {
                  obj.items.push(processStep);
                }
              });
              
            } else {
              this.view.dataService.data.forEach((obj) => {
                if (obj.items.length > 0) {
                  obj.items.forEach((dt) => {
                    if (dt.recID == processStep?.parentID) {
                      dt.items.push(processStep);
                    }
                  });
                }
              });
            }
           
          }else{
            this.view.dataService.data.push(processStep)
            this.listPhaseName.push(processStep.stepName)
          }
          this.dataTreeProcessStep = this.view.dataService.data;
          this.changeDetectorRef.detectChanges();
        }
      });
    });
  }

  edit(data) {}

  copy(data) {}

  delete(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res[0]) {
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
    if (evt.id == 'btnAdd') this.stepType = 'P';
    else this.stepType = evt.id;
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

  viewChanged(e) {
    // test
    if (e?.view.type == 16) {
      this.dataTreeProcessStep = this.view.dataService.data;
      this.listPhaseName = [];
      this.dataTreeProcessStep.forEach(obj=>{
        this.listPhaseName.push(obj?.stepName)
      })
      this.changeDetectorRef.detectChanges();
    }
  }

  //#endregion
  //view Temp
 
 
}
