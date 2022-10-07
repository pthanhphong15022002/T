import { Component, Input, OnInit, TemplateRef, ViewChild, Injector, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, ButtonModel, DialogRef, RequestOption, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopAddPhaseComponent } from './popup-add-phase/pop-add-phase.component';
import { PopAddProcessstepsComponent } from './popup-add-processsteps/pop-add-processsteps.component';

@Component({
  selector: 'lib-processsteps',
  templateUrl: './processsteps.component.html',
  styleUrls: ['./processsteps.component.css']
})
export class ProcessstepsComponent extends UIComponent implements OnInit {
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;

  @Input() showButtonAdd = true;
  @Input() dataObj?: any;
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  dialog!: DialogRef;
  user: any;
  funcID: any;
  titleAction = '';
  itemSelected: any;
  idForm ='A'

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
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.list,
        active: false,
        sameData: true,
        model: {
          template: this.itemViewList,
        },
      },
    ];
    this.view.dataService.methodSave = 'AddProcessStepAsync';
    this.view.dataService.methodUpdate = 'UpdateProcessStepAsync';
    this.view.dataService.methodDelete = 'DeleteProcessStepAsync';
    this.dt.detectChanges();
  }



  //#region CRUD bước công việc
  add() {
    if(this.idForm === 'A'){
      this.view.dataService.addNew().subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = 'Auto';
        this.dialog = this.callfc.openSide(
          PopAddProcessstepsComponent,
          ['add', this.titleAction, this.idForm],
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
    }else if(this.idForm === 'P'){
      this.view.dataService.addNew().subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = 'Auto';
        this.dialog = this.callfc.openSide(
          PopAddPhaseComponent,
          ['add', this.titleAction, this.idForm],
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
  }

  edit(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = 'Auto';
        this.dialog = this.callfc.openSide(
          PopAddProcessstepsComponent,
          ['edit', this.titleAction, this.idForm],
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

  copy(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = 'Auto';
      this.dialog = this.callfc.openSide(
        PopAddProcessstepsComponent,
        ['copy', this.titleAction, this.idForm],
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
    this.idForm =evt.id
    switch (evt.id) {
      case 'btnAdd':
      case 'A':
        this.add();
        break;
      case 'P':
        this.add();
        break;
      case 'Q':
        this.add();
        break;
    }
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
      // case 'SYS03':
      //   this.edit(data);
      //   break;
      // case 'SYS04':
      //   this.copy(data);
      //   break;
      // case 'SYS02':
      //   this.delete(data);
    }
  }

  onDragDrop(e: any) {
    console.log(e);
  }


  //#endregion
}
