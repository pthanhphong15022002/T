import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  Injector,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DataRequest,
  ViewModel,
  ViewsComponent,
  ViewType,
  RequestOption,
  ButtonModel,
  ResourceModel,
  CallFuncService,
  SidebarModel,
  DialogRef,
  ApiHttpService,
  AuthStore,
} from 'codx-core';
import { TM_Tasks } from '../models/TM_Tasks.model';
import { PopupAddComponent } from './popup-add/popup-add.component';
@Component({
  selector: 'test-views',
  templateUrl: './ownertasks.component.html',
  styleUrls: ['./ownertasks.component.scss'],
})
export class OwnerTasksComponent implements OnInit {
  @ViewChild('view') view!: ViewsComponent;
  @ViewChild('panelLeftRef') panelLeft?: TemplateRef<any>;
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate!: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('cardCenterTemplate') cardCenterTemplate!: TemplateRef<any>;
  @ViewChild('kanbanTemplate') kanbanTemplate?: TemplateRef<any>;
  @ViewChild('tmpRight') sidebarRight?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  model?: DataRequest;
  predicate = 'Owner=@0';
  dataValue = 'ADMIN';
  resourceKanban?: ResourceModel;
  dialog!: DialogRef;
  itemSelected : any ;
  user : any 
  funcID : string

  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private activedRouter : ActivatedRoute
  ) { 
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  clickMF(e: any, data: any) {
    switch (e.functionID) {
      case 'btnAdd':
        this.show();
        break;
      case 'edit':
        this.edit();
        break;
      case 'delete':
        this.delete(data);
        break;
    }
  }
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.show();
        break;
      case 'edit':
        this.edit();
        break;
      case 'delete':
        this.delete(evt);
        break;
    }
  }

  ngOnInit(): void {
    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'TM';
    this.resourceKanban.assemblyName = 'TM';
    this.resourceKanban.className = 'TaskBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.button = {
      id: 'btnAdd',
    };

    this.moreFuncs = [
      {
        id: 'edit',
        icon: 'icon-list-checkbox',
        text: 'Sửa',
      },
      {
        id: 'btnMF2',
        icon: 'icon-list-checkbox',
        text: 'more 2',
      },
    ];
  }
  change() {
    // this.view.dataService.dataValues = "1";
    // this.view.dataService.load();
    this.view.dataService.setPredicates(["Status=@0"], ["1"]);

  }
  ngAfterViewInit(): void {
    // this.noti.notifyCode('DM012')
    this.views = [
      {
        type: ViewType.list,
      
        sameData: true,
        model: {
          template: this.template,
        },
      },
      {
        type: ViewType.card,
        sameData: true,
        model: {
          template: this.cardTemplate,
        },
      },
      {
        type: ViewType.card,
        text: 'List card center',
        sameData: true,
        model: {
          template: this.cardCenterTemplate,
        },
      },
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.template,
          panelRightRef: this.panelRight,
        },
      },
      {
        type: ViewType.content,
        sameData: true,
        model: {
          panelRightRef: this.panelRight,
          panelLeftRef: this.panelLeft,
        },
      },
      {
        type: ViewType.kanban,
        sameData: true,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
          panelLeftRef: this.kanbanTemplate,
        },
      },
      {
        active: false,
        type: ViewType.grid,
        sameData: true,
      }
    ];

    this.view.dataService.predicates = "Status=@0";
    this.view.dataService.dataValues = "1";
    this.view.dataService.methodSave = 'TestApiSave';
    this.view.dataService.methodUpdate = 'TestApiBool';
    this.view.dataService.methodDelete = 'TestApi';
    console.log(this.view.formModel);
    this.dt.detectChanges();
  }

  show() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      this.dialog = this.callfunc.openSide(PopupAddComponent, this.view.dataService.dataSelected, option);
      //dialog.close();
    });
  }

  edit() {
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      this.dialog = this.callfunc.openSide(PopupAddComponent, this.view.dataService.dataSelected, option);
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.delete([this.view.dataService.dataSelected], this.beforeDel).subscribe();
  }


  beforeDel(opt: RequestOption) {
    opt.service = 'TM';
    opt.assemblyName = 'TM';
    opt.className = 'TaskBusiness';
    opt.methodName = 'TestApi';
    return true;
  }

  changeView(evt: any) {
    console.log('evt: ', evt);
    var t = this;
  }

  requestEnded(evt: any) {
    // if (evt) {
    //   this.dialog.close();
    // }
  }
  aaa(val: any) {
    console.log(val);
  }
  selectedChange(val: any) {
    console.log(val);
    this.itemSelected = val.data;
    this.dt.detectChanges() ;
  }
}
