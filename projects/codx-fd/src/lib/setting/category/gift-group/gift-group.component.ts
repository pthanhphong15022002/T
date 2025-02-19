import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
  Injector,
} from '@angular/core';
import {
  AuthStore,
  ButtonModel,
  CodxGridviewComponent,
  DialogRef,
  ImageViewerComponent,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { ActivatedRoute } from '@angular/router';
import { AddGiftGroupComponent } from './add-gift-group/add-gift-group.component';

@Component({
  selector: 'app-gift-group',
  templateUrl: './gift-group.component.html',
  styleUrls: ['./gift-group.component.scss'],
})
export class GiftGroupComponent extends UIComponent implements OnInit {
  views: Array<ViewModel> = [];
  dataItem: any;
  userPermission: any;
  showHeader: boolean = true;
  user: any;
  userName = '';
  button?: ButtonModel[];
  dialog: DialogRef;
  headerText = '';
  moreFuncs = [
    {
      id: 'btnEdit',
      icon: 'icon-list-checkbox',
      text: 'Chỉnh sửa',
    },
    {
      id: 'btnDelete',
      icon: 'icon-list-checkbox',
      text: 'Xóa',
    },
  ];

  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('createdOn', { static: true }) createdOn: TemplateRef<any>;
  @ViewChild('memo', { static: true }) memo: TemplateRef<any>;
  @ViewChild('subheader') subheader;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('tmpMoreFunc') tmpMoreFunc: TemplateRef<any>;

  constructor(
    private changedr: ChangeDetectorRef,
    private authStore: AuthStore,
    private route: ActivatedRoute,
    injector: Injector
  ) {
    super(injector);
    this.user = this.authStore.get();
    this.route.params.subscribe((params) => {
      if (params) this.funcID = params['funcID'];
    });
  }
  columnsGrid = [];
  onInit(): void {
    this.button = [{
      id: 'btnAdd',
    }];
    this.changedr.detectChanges();
  }
  ngAfterViewInit() {}

  onLoading(e) {
    if (this.view.formModel) {
      var formModel = this.view.formModel;
      this.cache
        .gridViewSetup(formModel.formName, formModel.gridViewName)
        .subscribe((res) => {
          if (res) {
            this.columnsGrid = [
              { field: 'giftID', headerText: res.GiftID.headerText },
              {
                field: 'giftName',
                headerText: res.GiftName.headerText,
              },
              {
                field: 'memo',
                headerText: res.Memo.headerText,
                template: this.memo,
              },
              {
                field: 'createBy',
                headerText: res.CreatedBy.headerText,
                template: this.itemCreateBy,
              },
              // {
              //   field: 'createdOn',
              //   headerText: res.CreatedOn.headerText,
              //   template: this.createdOn,
              // },
            ];
          }
        });
      this.views = [
        {
          type: ViewType.grid,
          sameData: true,
          active: false,
          model: {
            resources: this.columnsGrid,
            template2: this.tmpMoreFunc,
          },
        },
      ];
      this.changedr.detectChanges();
    }
  }

  add(e) {
    this.headerText = e?.text;
    var obj = {
      isModeAdd: true,
      headerText: this.headerText,
    };
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      let popupAdd = this.callfc.openSide(AddGiftGroupComponent, obj, option);
      popupAdd.closed.subscribe((e) => {
        if (e?.event) {
          this.view.dataService.add(e.event, 0).subscribe();
          this.changedr.detectChanges();
        } else {
          this.viewbase.dataService.clear();
        }
      });
    });
  }

  edit(data) {
    if (data) this.view.dataService.dataSelected = data;
    var obj = {
      isModeAdd: false,
      headerText: this.headerText,
    };
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        let popupEdit = this.callfc.openSide(
          AddGiftGroupComponent,
          obj,
          option
        );
        popupEdit.closed.subscribe((e) => {
          if (!e?.event) this.viewbase?.dataService?.clear();
          else {
            this.view.dataService.update(e.event).subscribe();
            this.changedr.detectChanges();
          }
        });
      });
  }

  copy(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService
      .copy()
      .subscribe((res: any) => {
        var obj = {
          isModeAdd: true,
          headerText: this.headerText,
        };
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        let popupCopy = this.callfc.openSide(
          AddGiftGroupComponent,
          obj,
          option
        );
        popupCopy.closed.subscribe((e) => {
          if (e?.event) {
            this.view.dataService.add(e.event, 0).subscribe();
            this.changedr.detectChanges();
          } else {
            this.viewbase.dataService.clear();
          }
        });
      });
  }

  delete(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (option: any) =>
        this.beforeDelete(option, this.view.dataService.dataSelected)
      )
      .subscribe((res: any) => {
          if(res)
          {
            this.view.dataService.onAction.next({ type: 'delete', data: data });
            this.changedr.detectChanges();
          }
      });
  }

  beforeDelete(op: any, data) {
    op.methodName = 'DeleteGiftGroupAsync';
    op.data = data?.giftID;
    return true;
  }

  clickMF(e, data) {
    this.headerText = e?.text;
    if (e) {
      switch (e.functionID) {
        case 'SYS03':
          this.edit(data);
          break;
        case 'SYS02':
          this.delete(data);
          break;
        case 'SYS04':
          this.copy(data);
          break;
      }
    }
  }
}
