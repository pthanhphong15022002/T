import { I } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  Optional,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  DialogRef,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxBpService } from '../codx-bp.service';
import { BP_Processes } from '../models/BP_Processes.model';
import { PropertiesComponent } from '../properties/properties.component';
import { PopupAddProcessesComponent } from './popup-add-processes/popup-add-processes.component';
import { RevisionsComponent } from './revisions/revisions.component';


@Component({
  selector: 'lib-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.css'],
})
export class ProcessesComponent
  extends UIComponent
  implements OnInit, AfterViewInit {
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('itemProcessName', { static: true })
  itemProcessName: TemplateRef<any>;
  @ViewChild('itemOwner', { static: true })
  itemOwner: TemplateRef<any>;
  @ViewChild('itemVersionNo', { static: true })
  itemVersionNo: TemplateRef<any>;
  @ViewChild('itemActivedOn', { static: true }) itemActivedOn: TemplateRef<any>;
  @ViewChild('templateListCard', { static: true }) templateListCard: TemplateRef<any>;
  @ViewChild('templateSearch') templateSearch: TemplateRef<any>;
  @ViewChild('view') codxview!: any;
  @ViewChild('itemMemo', { static: true })
  itemMemo: TemplateRef<any>;
  @Input() showButtonAdd = true;
  @Input() dataObj?: any;
  dialog!: DialogRef;
  titleAction = '';
  columnsGrid = [];
  textSearch: string;
  textSearchAll: string;
  data = [];
  isSearch = false;
  predicates: any;
  values: any;
  searchAdvance: boolean;
  viewActive: any;
  titleUpdateFolder = 'Cập nhật thư mục';

  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  user: any;
  funcID: any;
  itemSelected: any;
  titleReName = "Thay đổi tên";
  dialogPopupReName: DialogRef;
  @ViewChild('viewReName', { static: true }) viewReName;
  @Input() process = new BP_Processes();
  newName = '';
  crrRecID = '';
  dataSelected: any;

  constructor(
    inject: Injector,
    private bpService :CodxBpService,
    private notification: NotificationsService,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.columnsGrid = [
      { headerTemplate: this.itemProcessName, width: 300 },
      { headerTemplate: this.itemOwner, width: 300 },
      { headerTemplate: this.itemVersionNo, width: 150 },
      { headerTemplate: this.itemActivedOn, width: 200 },
      { headerTemplate: this.itemMemo, width: 300 },
      { field: '', headerText: '', width: 30 },
      { field: '', headerText: '', width: 30 },

    ];
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          resources: this.columnsGrid,
          template: this.itemViewList,
        },
      },
      {
        id: '2',
        type: ViewType.card,
        sameData: true,
        active: true,
        model: {
          template: this.templateListCard,
        },
      },
      {
        text: 'Search',
        hide: true,
        type: ViewType.listdetail,
        sameData: true,
        active: false,
        model: {
          template2: this.templateSearch,
        },
      },
    ];
    this.view.dataService.methodSave = 'AddProcessesAsync';
    this.view.dataService.methodUpdate = 'UpdateProcessesAsync';
    this.view.dataService.methodDelete = 'DeleteProcessesAsync';
    this.changeDetectorRef.detectChanges();
  } 

  search(isScroll = false) {
    // this.views.forEach(item => {
    //   item.hide = true;
    //   if (item.text == "Search")
    //     item.hide = false;
    // });
    // this.fileService.searchFile(this.textSearchAll, this.dmSV.page, this.dmSV.pageSize).subscribe(item => {
    //   if (item != null) {
    //     if(!isScroll)
    //     {
    //       var view = this.views.filter(x=>x.text == "Search")[0];
    //       view.active = true;
    //       this.view.viewChange(view);
    //     }
       
    //     // this.dmSV.listFiles = item.data;
    //     this.totalSearch = item.total;
    //     this.dmSV.listFiles = [...this.dmSV.listFiles, ...item.data];
    //     this.data = [...this.data, ...this.dmSV.listFiles];
    //     this.getTotalPage(item.total);
    //     this.changeDetectorRef.detectChanges();
    //   }
    //   else {
    //     //this.dmSV.loadedFile = true;
    //     this.totalSearch = 0;
    //     this.dmSV.totalPage = 0;
    //     this.changeDetectorRef.detectChanges();
    //   }
    // });
  }

  searchChange($event) {
    try {
      this.textSearch = $event;
      this.data = [];
      if (this.codxview.currentView.viewModel.model != null)
        this.codxview.currentView.viewModel.model.panelLeftHide = true;
      this.isSearch = true;
      // this.dmSV.page = 1;
      // this.fileService.options.page = this.dmSV.page;
      this.textSearchAll = this.textSearch;
      this.predicates = "FileName.Contains(@0)";
      this.values = this.textSearch;
      this.searchAdvance = false;
      this.viewActive = this.views.filter(x => x.active == true)[0];
      if (this.textSearch == null || this.textSearch == "") {
        this.views.forEach(item => {
          item.active = false;
          item.hide = false;
          if (item.text == "Search")
            item.hide = true;
          if (item.text == this.viewActive.text)
            item.active = true
        });
        if (this.view.funcID == "BPT2") {
          this.view.viewChange(this.viewActive);
          this.codxview.currentView.viewModel.model.panelLeftHide = false;
        }
        this.changeDetectorRef.detectChanges();
      }
      else this.search();
    }
    catch (ex) {
      this.changeDetectorRef.detectChanges();
      console.log(ex);
    }
  }

  //#region CRUD
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = 'Auto';
      this.dialog = this.callfc.openSide(
        PopupAddProcessesComponent,
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
          PopupAddProcessesComponent,
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
        PopupAddProcessesComponent,
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
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      // case 'BPT11':
      //   this.properties(data);
      //   break;
    }
  }

  properties(e: any, data?: any) {
    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = '550px';
    // let data = {} as any;
    data.title = this.titleUpdateFolder;
    data.id = data.recID;
    this.callfc.openSide(PropertiesComponent, data, option);
  }

  reName(data) {
    this.dataSelected = data;
    this.newName = data.processName;
    this.crrRecID = data.recID
    this.dialogPopupReName = this.callfc.openForm(
      this.viewReName,
      '',
      500,
      10
    );
  }

  valueChange(e) {
    this.newName = e.data;
  }

  onSave() {
    this.api.exec('BP', 'ProcessesBusiness', 'UpdateProcessNameAsync', [this.crrRecID, this.newName]).subscribe(res => {
      if (res) {
        this.dataSelected.processName = this.newName;
        this.view.dataService.update(this.dataSelected).subscribe();
        this.notification.notifyCode('SYS007');
        this.changeDetectorRef.detectChanges();
      }
      this.dialogPopupReName.close();
    })
  }

  onDragDrop(e: any) {
    console.log(e);
  }

  convertHtmlAgency(position: any) {
    var desc = '<div class="d-flex">';
    if (position)
      desc += '<div class="d-flex align-items-center me-2"><span class=" text-dark-75 font-weight-bold icon-apartment1"></span><span class="">' + position + '</span></div>';

    return desc + '</div>';
  }

  revisions(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(
          RevisionsComponent,
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
  //#endregion


  //tesst
  clickProscessTessttttttttttttttt(data){
    this.bpService.viewProcesses.next(data);
    this.codxService.navigate('','/bp/processstep/BPT11');
  }
}
