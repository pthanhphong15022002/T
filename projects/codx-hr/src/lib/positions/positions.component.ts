import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { ApiHttpService, AuthStore, ButtonModel, CallFuncService, DialogRef, NotificationsService, SidebarModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { PopupAddPositionsComponent } from './popup-add-positions/popup-add-positions.component';

@Component({
  selector: 'lib-positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.css']
})
export class PositionsComponent implements OnInit {
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  dialog!: DialogRef;
  moreFuncs: Array<ButtonModel> = [];
  funcID: string;

  
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('view') view!: ViewsComponent;


  constructor(
    private changedt: ChangeDetectorRef,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private codxHr: CodxHrService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private api: ApiHttpService,
  ) {
    
    // this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
   }

  ngOnInit(): void {
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

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.list,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
        }
      },
    ];
    this.changedt.detectChanges();
  }

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'btnAdd':
        this.add();
        break;
      case 'edit':
        this.edit(data);
        break;
      case 'copy':
        this.copy(data);
        break;
      case 'delete':
        this.delete(data);
        break;
      // case 'sendemail':
      //   this.sendemail(data);
      //   break;
      // case 'TMT025':
      //   this.assignTask(data);
      //   break;
      // default:
      //   this.changeStatusTask(e, data);
      //   break;
    }
  }

  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      // option.Width = '750px';
      this.dialog = this.callfunc.openSide(
        PopupAddPositionsComponent,
        [this.view.dataService.dataSelected, 'add'],
        option
      );
      this.dialog.closed.subscribe((e) => {
        console.log(e);
      });
    });
  }

  edit(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        // option.Width = '750px';
        this.dialog = this.callfunc.openSide(
          PopupAddPositionsComponent,
          [this.view.dataService.dataSelected, 'edit'],
          option
        );
      });
  }

  copy(data) {
    this.view.dataService.copy().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      // option.Width = '750px';
      this.view.dataService.dataSelected = data;
      this.dialog = this.callfunc.openSide(
        PopupAddPositionsComponent,
        [this.view.dataService.dataSelected, 'copy'],
        option
      );
    });
  }

  delete(data: any) {

  }

  requestEnded(evt: any) {
    this.view.currentView;
  }

  selectedChange(val: any) {
    // this.itemSelected = val.data;
    // this.dt.detectChanges();
  }

  onDragDrop(e: any) {
    // if (e.type == 'drop') {
    //   this.api
    //     .execSv<any>('ERM.Business.HR','PositionsBusiness', 'UpdateAsync', e.data)
    //     .subscribe((res) => {
    //       if (res) {
    //         this.view.dataService.update(e.data);
    //       }
    //     });
    // }
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
}
