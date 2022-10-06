import { Component, Input, OnInit, TemplateRef, ViewChild, Injector, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, ButtonModel, DialogRef, RequestOption, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopAddProcessstepsComponent } from './pop-add-processsteps/pop-add-processsteps.component';

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
    this.view.dataService.methodSave = 'AddProcessStepsAsync';
    this.view.dataService.methodUpdate = 'UpdateProcessStepsAsync';
    this.view.dataService.methodDelete = 'DeleteProcessStepsAsync';
    this.dt.detectChanges();
  }

  //#region CRUD
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = 'Auto';
      this.dialog = this.callfc.openSide(
        PopAddProcessstepsComponent,
        ['add', this.titleAction],
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
          ['edit', this.titleAction],
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
        ['copy', this.titleAction],
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
    opt.methodName = 'DeleteProcessesAsync';

    opt.data = itemSelected.processNo;
    return true;
  }
  //#endregion


  //#region event
  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
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
