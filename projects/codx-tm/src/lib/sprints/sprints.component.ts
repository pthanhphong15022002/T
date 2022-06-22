import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, AuthStore, ButtonModel, CallFuncService, DataRequest, DialogRef, RequestOption, ResourceModel, SidebarModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { CodxTMService } from '../codx-tm.service';
import { PopupAddComponent } from '../ownertasks/popup-add/popup-add.component';

@Component({
  selector: 'lib-sprints',
  templateUrl: './sprints.component.html',
  styleUrls: ['./sprints.component.css']
})
export class SprintsComponent implements OnInit {
  @ViewChild('view') view!: ViewsComponent;
  @ViewChild('panelLeftRef') panelLeft?: TemplateRef<any>;
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('tmpRight') sidebarRight?: TemplateRef<any>;
  @ViewChild('listCardSprints') listCardSprints: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  model?: DataRequest;
  predicate = 'Owner=@0';
  dataValue = 'ADMIN';
  resourceKanban?: ResourceModel;
  dialog!: DialogRef;
  itemSelected: any;
  user: any
  funcID: string
  moreFunc
  constructor(
    private inject: Injector,
    private tmSv: CodxTMService,
    private changeDetectorRef: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute
  ) {
    this.user = this.authStore.get();
    this.dataValue = this.user.userID
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }
  ngOnInit(): void {

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


  ngAfterViewInit(): void {
    this.views = [{
      id: '2',
      type: ViewType.content,
      sameData: true,
      active: true,
      model: {
        panelLeftRef: this.listCardSprints,
      }
    }];
    this.changeDetectorRef.detectChanges();
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
    this.itemSelected = val.data;
    this.changeDetectorRef.detectChanges();
  }
}
