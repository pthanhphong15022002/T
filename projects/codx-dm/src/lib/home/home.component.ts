import {
  Component,
  ViewChild,
  ChangeDetectorRef,
  TemplateRef,
  Injector,
  OnDestroy,
  ElementRef,
  ViewEncapsulation,
} from '@angular/core';
import {
  AuthStore,
  ViewType,
  ViewModel,
  UIComponent,
  ButtonModel,
  NotificationsService,
  SidebarModel,
  DialogRef,
  ScrollComponent,
  DialogModel,
  Filters,
  DataRequest,
  AlertConfirmInputConfig,
} from 'codx-core';
import {
  from,
  map,
  mergeMap,
  Observable,
  Observer,
  of,
  isObservable,
} from 'rxjs';
import { CodxDMService } from '../codx-dm.service';
import { FolderInfo } from '@shared/models/folder.model';
import {
  DialogAttachmentType,
  FileInfo,
  ItemInterval,
} from '@shared/models/file.model';
import { FolderService } from '@shared/services/folder.service';
import { FileService } from '@shared/services/file.service';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { ActivatedRoute } from '@angular/router';
import { ViewFileDialogComponent } from 'projects/codx-common/src/lib/component/viewFileDialog/viewFileDialog.component';
import {
  AnimationSettingsModel,
  DialogComponent,
} from '@syncfusion/ej2-angular-popups';
import { CreateFolderComponent } from '../createFolder/createFolder.component';
import { MoveComponent } from '../move/move.component';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends UIComponent implements OnDestroy {
  @ViewChild('divHome') divHome: ElementRef;
  @ViewChild('templateMain') templateMain: TemplateRef<any>;
  @ViewChild('templateSearch') templateSearch: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('templateCard') templateCard: TemplateRef<any>;
  @ViewChild('templateSmallCard') templateSmallCard: TemplateRef<any>;
  @ViewChild('templateList') templateList: TemplateRef<any>;
  @ViewChild('attachment1') attachment1: AttachmentComponent;
  //  @ViewChild('attachment2') attachment2: AttachmentComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('view') codxview: any;
  @ViewChild('Dialog') public Dialog: DialogComponent;

  submenu: string;
  selectedFirst = false;
  animationSettings: AnimationSettingsModel = { effect: 'None' };
  viewActive: any;
  currView?: TemplateRef<any>;
  path: string;
  button?: ButtonModel[];
  typeView: ViewType;
  viewIcon: string;
  views: Array<ViewModel> = [];
  orgViews: Array<ViewModel> = [];
  listFolders: FolderInfo[];
  listFiles: FileInfo[];
  data: any;
  titleAccessDeniedFile = 'Bạn không có quyền truy cập file này';
  titleAccessDenied = 'Bạn không có quyền truy cập thư mục này';
  titleFileName = 'Tên';
  titleCreatedBy = 'Người tạo thư mục / tệp tin';
  titleCreatedOn = 'Ngày tạo thư mục / tệp tin';
  titleLength = 'Dung lượng';
  titleDisc = 'Mô tả';
  sortColumn: string;
  sortDirection: string;
  textSearch: string;
  textSearchAll: string;
  totalSearch: number;
  predicates: any;
  values: any;
  searchAdvance: boolean;
  sys025: any;
  //icon Sort
  itemSelected: any;
  dataFile: any;
  visible: boolean = false;
  isScrollFolder = true;
  isScrollFile = true;
  isScrollSearch = true;
  maxHeightScroll = 500;
  pageSearch = 1;
  hideMF = false;
  isRead = true;
  //loadedFile: boolean;
  //loadedFolder: boolean;
  //page = 1;
  //totalPage = 1;
  isSearch = false;
  user: any;
  dialog!: DialogRef;
  interval: ItemInterval[];
  item: any;
  modelSearch: DataRequest = {
    page: 1,
    pageSize: 20,
    pageLoading: false,
  };
  isChangeFirst = false;
  breakCumbArr = [
    {
      id: 'DMT06',
      sub: [
        {
          id: '1',
          name: 'Tài liệu được yêu cầu',
        },
        {
          id: '2',
          name: 'Tài liệu yêu cầu',
        },
        {
          id: '3',
          name: 'Lịch sử yêu cầu',
        },
      ],
    },
    {
      id: 'DMT05',
      sub: [
        {
          id: '1',
          name: 'Tài liệu được chia sẻ',
        },
        {
          id: '2',
          name: 'Tài liệu chia sẻ',
        },
      ],
    },
    {
      id: 'DMT07',
      sub: [
        {
          id: '1',
          name: 'Tài liệu được yêu cầu',
        },
        {
          id: '2',
          name: 'Tài liệu chờ duyệt',
        },
        {
          id: '3',
          name: 'Lịch sử xét duyệt',
        },
      ],
    },
  ];

  vllDM003: any;
  loaded = false;
  isSelectMulti = false;
  listSeletcMulti = [];
  fDisUpload:any = null;
  fDisCreate:any = null;
  idQueryParams = "";
  constructor(
    inject: Injector,
    public dmSV: CodxDMService,
    private auth: AuthStore,
    private folderService: FolderService,
    private fileService: FileService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private notificationsService: NotificationsService
  ) {
    super(inject);
  }
  onInit(): void {
    this.isChangeFirst = false;
    this.isRead = true;
    //View mặc định
    var check = document.getElementById('dm-home-mark-id');

    if (!check) {
      var elem = document.createElement('div');
      elem.id = 'dm-home-mark-id';
      document.body.appendChild(elem);
    }

    this.user = this.auth.get();
    this.path = this.getPath();
    this.button = [
      {
        id: 'btnUpload',
        text: 'Tải lên',
        hasSet: true,
      },
      {
        id: 'btnSelectMulti',
        text: 'Chọn',
        formName: 'System',
        hasSet: true,
      }
    ];

    if(this.codxService.asideMode == "2")
      this.button.unshift({
        id: 'btnCreatFolder',
        icon: 'icon-i-plus',
        text: 'Tạo thư mục',
        formName: 'System',
        hasSet: true,
      });
    //Mặc định filter
    this.fileService.options.srtColumns = 'CreatedOn';
    this.fileService.options.srtDirections = 'desc';
    this.folderService.options.srtColumns = 'CreatedOn';
    this.folderService.options.srtDirections = 'desc';

    this.dmSV.ChangeDataView.subscribe((res) => {
      if (res) {
        this.loaded = false;
        this.data = this.dmSV.listFolder.concat(this.dmSV.listFiles);
        if (this.data && this.data.length == 0) this.loaded = true;
      }
    });
    this.dmSV.isAddFolder.subscribe((item) => {
      if (item) {
        var tree = this.codxview?.currentView?.currentComponent?.treeView;
        if (
          tree &&
          ((this.funcID != 'DMT00' &&  this.funcID != 'WDMT00')||
            ((this.funcID == 'DMT00' || this.funcID == 'WDMT00') &&
              this.codxview?.currentView?.currentComponent?.treeView?.data[0]
                ?.items &&
              this.codxview?.currentView?.currentComponent?.treeView?.data[0]
                ?.items.length > 0))
        )
          tree.setNodeTree(item);
        if (this.view.dataService.data.length == 0)
          this.view.dataService.data.push(item);
        // var ele = document.getElementsByClassName('item-selected');
        // if (ele.length > 0) ele[0].classList.remove('item-selected');
        // var ele2 = document.getElementsByClassName(item?.recID);
        // if (ele2.length > 0) ele2[0].classList.add('item-selected');
        //this.onSelectionChanged(a);
      }
      this._beginDrapDrop();
    });

    this.dmSV.isNodeSelect.subscribe((res) => {
      if (res) {
        this.disableMark();
        this.loaded = false;
        var tree = this.codxview?.currentView?.currentComponent?.treeView;
        this.dmSV.isSearchView = false;
        this.setHideModeView();
        this.view.viewChange(this.viewActive);
        this.codxview.currentView.viewModel.model.panelLeftHide = false;

        if (this.funcID.includes('DMT04') || this.funcID.includes('DMT05'))
          this.codxview.currentView.viewModel.model.panelLeftHide = true;
        if (tree) {
          tree.textField = 'folderName';
          if (res.recID) {
            if (this.funcID.includes('DMT00')) {
              this.folderService.getFolder(res.recID).subscribe((res2) => {
                if (res) {
                  this.dmSV.folderID = res2.recID;
                  this.dmSV.getRight(res2);
                  this.refeshData();
                  this.getDataFolder(res2.recID, true);
                  var breadcumb = this.dmSV.breadcumb.getValue();
                  if (!breadcumb.includes(res2.folderName))
                    breadcumb.push(res2.folderName);
                  var index = this.dmSV.breadcumbLink.findIndex(
                    (x) => x == res2.recID
                  );
                  if (index >= 0) {
                    this.dmSV.breadcumbLink = this.dmSV.breadcumbLink.slice(
                      0,
                      index + 1
                    );
                  } else this.dmSV.breadcumbLink.push(res2.recID);

                  this.dmSV.breadcumb.next(breadcumb);
                }
              });
            } else tree.getCurrentNode(res.recID);
          } else tree.getCurrentNode(res);

          this.scrollTop();

          //this.refeshData();
          // this.getDataFolder(this.dmSV.folderID);
        } else {
          if (res.recID) {
            this.folderService.getFolder(res.recID).subscribe((res2) => {
              if (res) {
                this.dmSV.folderID = res2.recID;
                this.dmSV.getRight(res2);
                this.refeshData();
                this.getDataFolder(res2.recID);
                var breadcumb = this.dmSV.breadcumb.getValue();
                if (!breadcumb.includes(res2.folderName))
                  breadcumb.push(res2.folderName);
                if (!this.dmSV.breadcumbLink.includes(res2.recID))
                  this.dmSV.breadcumbLink.push(res2.recID);
                this.dmSV.breadcumb.next(breadcumb);
              }
            });
          } else {
            this.dmSV.disableUpload.next(true);
            this.dmSV.disableInput.next(true);
            this.refeshData();
            this.getDataFolder(res.recID);
          }
        }
      }
    });

    this.dmSV.isChangeClickData.subscribe((res) => {
      if (res) {
        this.loaded = false;
        this.disableMark();

        this.dmSV.parentCreate = false;

        if (this.funcID.includes('DMT00')) {
          this.folderService.getFolder(res.recID).subscribe((res2) => {
            if (res) {
              this.dmSV.folderID = res2.recID;
              this.dmSV.getRight(res2);
              this.refeshData();
              this.getDataFolder(res2.recID, true);
              this.dmSV.parentFolder.next(res2);
              var breadcumb = this.dmSV.breadcumb.getValue();
              if (!breadcumb.includes(res2.folderName))
                breadcumb.push(res2.folderName);
              var index = this.dmSV.breadcumbLink.findIndex(
                (x) => x == res2.recID
              );
              if (index >= 0) {
                this.dmSV.breadcumbLink = this.dmSV.breadcumbLink.slice(
                  0,
                  index
                );
              } else this.dmSV.breadcumbLink.push(res2.recID);
              this.dmSV.breadcumb.next(breadcumb);
            }
          });
        } else if (this.funcID.includes('DMT05'))
        {
          this.dmSV.getRight(res);
          this.refeshData();
          this.getDataFolder(res.recID);
          var breadcumb = this.dmSV.breadcumb.getValue();
          breadcumb.push(res.folderName);
          if (!this.dmSV.breadcumbLink) this.dmSV.breadcumbLink = [''];
          this.dmSV.breadcumbLink.push(res.recID);
          this.dmSV.breadcumb.next(breadcumb);
        } else {
          this.refeshData();
          this.dmSV.parentFolder.next(res);
          var treeView = this.codxview?.currentView?.currentComponent?.treeView;
          if (treeView) {
            var list = treeView.getBreadCumb(res.recID);
            if (list.length == 0) treeView.setNodeTree(res);
            treeView.getCurrentNode(res.recID);
            this.scrollTop();
          } else if (this.funcID == 'DMT04') {
            this.dmSV.getRight(res);
            this.refeshData();
            this.getDataFolder(res.recID);
            var breadcumb = this.dmSV.breadcumb.getValue();
            breadcumb.push(res.folderName);
            if (!this.dmSV.breadcumbLink) this.dmSV.breadcumbLink = [''];
            this.dmSV.breadcumbLink.push(res.recID);
            this.dmSV.breadcumb.next(breadcumb);
          }
        }
      }
    });

    this.dmSV.isRefreshTree.subscribe((res) => {
      if (
        this.funcID &&
        !this.funcID.includes('DMT02') &&
        !this.funcID.includes('DMT03') &&
        !this.funcID.includes('DMT04')
      )
        return;
      if (res) {
        var ele = document.getElementsByClassName('collapse');
        for (var i = 0; i < ele.length; i++) {
          // Only if there is only single class
          if (ele[i].className.includes('show')) {
            ele[i].classList.remove('show');
            ele[i].classList.add('hide');
          }
        }
        ele = document.getElementsByClassName('item-selected');
        if (ele.length > 0) ele[0].classList.remove('item-selected');
        ele = document.getElementsByClassName('icon-arrow_drop_down');
        if (ele.length > 0) {
          ele[0].classList.add('icon-arrow_right');
          ele[0].classList.remove('icon-arrow_drop_down');
        }
        this.dmSV.folderId.next('');
        this.dmSV.folderID = '';
        this.view.dataService.dataSelected = null;
        var index = this.button.findIndex(x=>x.id == "btnUpload");
        if (!this.funcID.includes('DMT03')) {
          this.button[index].disabled = true;
          this.dmSV.disableInput.next(true);
        } else {
          this.button[index].disabled = false;
          this.dmSV.disableInput.next(false);
        }
        this.scrollTop();
        this.refeshData();
        this.getDataByFuncID(this.funcID);
        if (!this.dmSV.isSearchView) {
          this.isScrollSearch = false;
          this.setHideModeView();
          this.currView = this.templateCard;
          this.view.viewChange(this.viewActive);
          this.codxview.currentView.viewModel.model.panelLeftHide = false;
        }

        if (this.funcID.includes('DMT04')) {
          this.codxview.currentView.viewModel.model.panelLeftHide = true;
        }
        //this.data = this.view.dataService.data
      }
    });

    this.dmSV.isAddFile.subscribe((item) => {
      if (item) {
        if (this.dmSV.listFiles && this.dmSV.listFiles.length > 0) {
          this.data = this.dmSV.listFolder.concat(this.dmSV.listFiles);
          if (this.data && this.data.length > 0 && this.loaded)
            this.loaded = false;
        }
        this.changeDetectorRef.detectChanges();
      }
    });

    this.dmSV.isNodeDeleted.subscribe((res) => {
      if (res) {
        var tree = this.codxview?.currentView?.currentComponent?.treeView;
        if (tree) {
          try {
            tree.removeNodeTree(res);
          } catch (e) {}
          var breadcumb = [];
          var breadcumbLink = [];
          breadcumb.push(this.dmSV.menuActive.getValue());
          tree.textField = 'folderName';
          var list = tree.arrBreadCumb;
          if (list && list.length > 0) {
            var index = list.findIndex((x) => x.id == res);
            this.codxview.dataService.data =
              this.codxview.dataService.data.filter((x) => x.id != res);
            if (index >= 0) {
              list = list.slice(index + 1);
              if (list.length > 0) {
                this.dmSV.folderId.next(list[0].id);
                this.dmSV.folderID = list[0].id;
                for (var i = list.length - 1; i >= 0; i--) {
                  breadcumb.push(list[i].text);
                  breadcumbLink.push(list[i].id);
                }
              } else {
                this.dmSV.folderId.next('');
                this.dmSV.folderID = '';
              }
              this.dmSV.breadcumbLink = breadcumbLink;
              this.dmSV.breadcumb.next(breadcumb);
            }
          }

          if (breadcumbLink.length <= 1) {
            this.loaded = false;
            this.refeshData();
            this.getDataFolder(this.dmSV.folderID);
          }
        }
        this.data = this.data.filter((x) => x.recID != res);
        if (this.data && this.data.length == 0) this.loaded = true;
        this.view.dataService.data = this.view.dataService.data.filter(
          (x) => x.recID != res
        );
        this.changeDetectorRef.detectChanges();
        this._beginDrapDrop();
      }
    });

    this.dmSV.isDisableUpload.subscribe((res) => {
      var index = this.button.findIndex(x=>x.id == "btnUpload");
      this.button[index].disabled = res;
      this.changeDetectorRef.detectChanges();
    });

    this.dmSV.isDisableInput.subscribe((res) => {
      var index = this.button.findIndex(x=>x.id == "btnCreatFolder");
      this.button[index].disabled = res;
      this.changeDetectorRef.detectChanges();
    });
    //Xóa File
    this.dmSV.isDeleteFileView.subscribe((item) => {
      if (item) {
        this.data = this.data.filter((x) => x.recID != item);
        this.view.dataService.data = this.view.dataService.data.filter(
          (x) => x.recID != item
        );
        if (this.data && this.data.length == 0) this.loaded = true;
      }
    });
    //Thay đổi tên Folder
    this.dmSV.isNodeChange.subscribe((res) => {
      if (res) {
        this.loaded = false;
        var tree = this.codxview?.currentView?.currentComponent?.treeView;
        if (tree != null && !this.funcID.includes('DMT00')) tree.setNodeTree(res);
        //  that.dmSV.folderId.next(res.recID);
        var index = this.data.findIndex((x) => x.recID == res.recID);
        if (index >= 0) {
          this.data[index] = res;
        }
      }
    });

    //RefeshData
    this.dmSV.isRefeshData.subscribe((res) => {
      if (res) {
        this.loaded = false;
        this.refeshData();
        this.getDataFolder(this.dmSV.folderID);
        if (this.fileService.options.favoriteID == '3') this.hideMF = true;
        else this.hideMF = false;
      }
    });

    this.getParaSetting();

    this.dmSV.isChangeOneFolder.subscribe((res) => {
      if (res) {
        var index = this.data.findIndex((x) => x.recID == res.recID);
        if (index >= 0) {
          this.data[index] = res;
          this.detectorRef.detectChanges();
        }
      }
    });

    this.dmSV.isMenuIdActive.subscribe((res) => {
      this.submenu = res;
      this.changeDetectorRef.detectChanges();
    });

  }

  disableMark() {
    var elm = document.getElementById('dm-home-mark-id');
    elm.classList.add('dm-home-mark');
  }

  unableMark() {
    var elm = document.getElementById('dm-home-mark-id');
    elm.classList.remove('dm-home-mark');
  }

  getParaSetting() {
    this.api
      .execSv('SYS', 'SYS', 'SettingValuesBusiness', 'GetParameterByFDAsync', [
        'DMParameters',
        null,
        '1',
      ])
      .subscribe((item: any) => {
        if (item) this.dmSV.paraSetting = JSON.parse(item);
      });
  }

  ngAfterViewInit(): void {
    this.cache.valueList('SYS025').subscribe((item) => {
      if (item) {
        this.sys025 = item;
        this.views[0].text = item.datas[3].text;
        this.views[0].icon = item.datas[3].icon;
        this.views[1].text = item.datas[4].text;
        this.views[1].icon = item.datas[4].icon;
        this.views[2].text = item.datas[0].text;
        this.views[2].icon = item.datas[0].icon;
        if(this.view?.views ) this.view.views = this.views;
        this.changeDetectorRef.detectChanges();
      }
    });
    this.views = [
      {
        id: '1',
        icon: '',
        text: 'card',
        type: ViewType.tree_card,
        active: true,
        sameData: true,
        hide: false,
        /*  toolbarTemplate: this.templateSearch,*/
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          //template2: this.templateCard,
          resizable: false,
        },
      },
      // {
      //   id: '1',
      //   icon: 'icon-search',
      //   text: 'Search',
      //   hide: true,
      //   type: ViewType.tree_list,
      //   sameData: true,
      //   model: {
      //     template: this.templateMain,
      //     panelRightRef: this.templateRight,
      //     template2: this.templateSearch,
      //     resizable: false,
      //   },
      // },
      {
        id: '1',
        icon: '',
        text: 'smallcard',
        hide: false,
        type: ViewType.tree_smallcard,
        active: false,
        sameData: true,
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          //template2: this.templateSmallCard,
          resizable: false,
        },
      },
      {
        id: '1',
        icon: this.sys025?.datas[0].icon,
        text: 'list',
        hide: false,
        type: ViewType.tree_list,
        sameData: true,
        active: false,
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          //template2: this.templateList,
          resizable: false,
        },
      },
    ];

    //View mặc định
    this.currView = this.templateCard;

    //if(this.funcID == "DMT06") this.view.page = null;
    this.viewActive = this.views.filter((x) => x.active == true)[0];
    if(this.codxview?.dataService)
    {
      this.codxview.dataService.pageSize = 50;
      this.codxview.dataService.pageLoading = false;
      this.codxview.dataService.parentIdField = 'parentId';
    }
    this.dmSV.formModel = this.view?.formModel;
    this.dmSV.dataService = this.view?.currentView?.dataService;


    //event.view.model.template2
    this.route.params.subscribe(item=>{
      this.funcID = this.route.snapshot.params.funcID;
      let type = "" ;
      this.idQueryParams = ""
      if(this.route.snapshot.queryParams?._fo)
      {
        type = 'folder';
        this.idQueryParams = this.route.snapshot.queryParams?._fo;
      }
      if(this.route.snapshot.queryParams?._f)
      {
        type = 'file';
        this.idQueryParams = this.route.snapshot.queryParams?._f;
      }
      if (this.funcID)
      {
        this.refeshData();
        this.loaded = false;
        this.hideMF = false;
        this.dmSV.folderID = '';
        this.dmSV.folderId.next('');
        this.dmSV.idMenuActive = this.funcID;
        this.dmSV.menuIdActive.next(this.funcID);
        this.folderService.options.funcID = this.funcID;
        this.fileService.options.funcID = this.funcID;
        this.viewActive.model.panelLeftHide = true;
        if(this.view?.dataService) this.view.dataService.dataSelected = null;
        this.views[2].model.panelLeftHide = false;
        this.dmSV.isSearchView = false;
        this.setDisableAddNewFolder();
        this.setBreadCumb();
        if (this.funcID.includes('DMT00')) {
          if(this.idQueryParams)
          {
            this.selectedFirst = false;
            this.getDataByFuncID00(this.idQueryParams,type);
          }
          else {
            this.selectedFirst = true;
            this.getDataByFunCID002();
          }
        }
        else this.selectedFirst = false;

        if (
          this.funcID.includes('DMT06') ||
          this.funcID.includes('DMT05') ||
          this.funcID.includes('DMT07')
        ) {
          this.fileService.options.favoriteID = '';
          this.folderService.options.favoriteID = '';
        }
        if (
          this.funcID.includes('DMT03') ||
          this.funcID.includes('DMT02') ||
          this.funcID.includes('DMT00')
        ) {
          this.viewActive.model.panelLeftHide = false;
          if(this.view?.viewChange)this.view.viewChange(this.viewActive);
        } else if (
          this.funcID.includes('DMT06') ||
          this.funcID.includes('DMT07') ||
          this.funcID.includes('DMT08')
        ) {
          this.views[2].model.panelLeftHide = true;
          if(this.view?.viewChange) this.view.viewChange(this.views[2]);
        } else if(this.view?.viewChange) this.view.viewChange(this.viewActive);

        if (this.funcID.includes('DMT08')) {
          this.titleCreatedBy = 'Người xóa thư mục / tệp tin';
          this.titleCreatedOn = 'Ngày xóa thư mục / tệp tin';
          var innerDiv = document.getElementById('tabel-div');
          if (innerDiv) innerDiv.style.height = 'calc(100% - 260px)';
        } else {
          this.titleCreatedBy = 'Người tạo thư mục / tệp tin';
          this.titleCreatedOn = 'Ngày tạo thư mục / tệp tin';
          var innerDiv = document.getElementById('tabel-div');
          if (innerDiv) innerDiv.style.height = '100%';
        }
        //if(this.funcID == "DMT00")
      }
    })

  }

  //An cac mode view khac khi search
  setHideModeView(hide = false) {
    this.views.forEach((item) => {
      item.hide = hide;
    });
  }

  //Disable nút tạo mới folder tùy theo funcID
  setDisableAddNewFolder() {
    var index = this.button.findIndex(x=>x.id == "btnUpload");
    var dis = true;
    if (this.funcID.includes('DMT03')) {
      dis = false;
      this.button[index].disabled = false;
    } else this.button[index].disabled = true;
    this.dmSV.disableInput.next(dis);
  }

  //Set chiều cao view list
  setHeight() {
    this.maxHeightScroll = window.innerHeight - 180;
    if (this.funcID.includes('DMT08')) this.maxHeightScroll = window.innerHeight - 250;
  }
  //Refesh lại data
  refeshData() {
    this.fileService.options.page = 1;
    this.folderService.options.page = 1;
    this.fileService.options.pageLoading = true;
    this.folderService.options.pageLoading = true;
    this.isScrollFile = true;
    this.isScrollFolder = true;
    this.dmSV.listFiles = [];
    this.dmSV.listFolder = [];
    this.data = [];
  }

  //get lại data
  getDataByFuncID(funcID: any) {
    //GetFolder()
    this.refeshData();
    this.disableMark();
    this.getDataFolder(this.dmSV.folderID);
  }

  getDataByFuncID00(id:any,type:any) {
    this.loaded = false;
    this.refeshData();
    this.folderService.options.funcID = this.funcID;
    this.folderService.getBreadCumb(id,type).subscribe(item=>{
      if(item)
      {
        if(type == "folder") this.dmSV.folderID = id;
        var breadcumb = [this.dmSV.menuActive.getValue()];
        var breadcumbLink = [""];
        breadcumb = breadcumb.concat(item[0]);
        breadcumbLink = breadcumbLink.concat(item[1]);
        this.dmSV.breadcumbLink = breadcumbLink;
        this.dmSV.breadcumb.next(breadcumb);
        this.folderService.getFolder(breadcumbLink[breadcumbLink.length - 1]).subscribe(item=>{
          if(item)
          {
            this.view.dataService.dataSelected = item;
            this.dmSV.getRight(item);
            this.getDataFolder(item.recID);
          }
        })
      }
      else {
        this.isRead = false;
        var elems = document.querySelectorAll(".header-fixed");

        [].forEach.call(elems, function(el) {
            el.classList.remove("toolbar-fixed");
        });
      }
    });
  }

  getDataByFunCID002()
  {
    this.loaded = false;
    this.refeshData();
    this.folderService.options.funcID = this.funcID;
    if(this.funcID.includes("DMT00"))
    {
      this.disableMark();
      this.folderService.getFolders('').subscribe((res) => {
        if (res && res[0]) {
          if (res[0][0].read) {
            var treeView = this.codxview?.currentView?.currentComponent?.treeView;
            if(treeView)
            {
              treeView.data = res[0];
              treeView.dataTree = res[0];
              treeView.dicDatas = res[0];
            }
            this.getDataFolder(res[0][0].recID,true,true);
            var breadcumb = [];
            var breadcumbLink = [];
            breadcumb.push(this.dmSV.menuActive.getValue(), res[0][0].folderName);
            breadcumbLink.push('', res[0][0].recID);
            this.dmSV.breadcumbLink = breadcumbLink;
            this.dmSV.breadcumb.next(breadcumb);
            this.dmSV.getRight(res[0][0]);
            this.dmSV.folderName = res[0][0].folderName;
            this.dmSV.parentFolderId = res[0][0].parentId;
            this.dmSV.parentFolder.next(res[0][0]);
            this.dmSV.level = res[0][0]?.level;
            this.dmSV.folderID = res[0][0].recID;
            this.dmSV.folderId.next(res[0][0].recID);
          } else this.unableMark();
          // var treeView = this.codxview?.currentView?.currentComponent?.treeView;
          // if(treeView)
          // {
          //   var list = treeView.getBreadCumb(res.recID);
          //   if(list && list.length == 0) treeView.setNodeTree(res);
          // }
        }
      });
    }
  }
  onScroll(event) {
    const dcScroll = event.srcElement;
    if (
      dcScroll.scrollTop < dcScroll.scrollHeight - dcScroll.clientHeight ||
      dcScroll.scrollTop == 0
    )
      return;
    // Nếu còn dữ liệu folder thì scroll folder
    if (this.dmSV.isSearchView) {
      if (this.isScrollSearch) {
        this.modelSearch.page++;
        this.getDataSearch();
      }
      return;
    }
    if (this.isScrollFolder)
    {
      this.folderService.options.page++;
      this.getDataFolder(this.dmSV.folderID);
    }
    else if (this.isScrollFile)
    {
      this.fileService.options.page++;
      this.fileService.options.funcID = this.funcID;
      this.getDataFile(this.dmSV.folderID);
    }
  }

  onScrollSearch(event) {
    if (!this.isScrollSearch) return;

    const dcScroll = event.srcElement;
    if (
      dcScroll.scrollTop < dcScroll.scrollHeight - dcScroll.clientHeight ||
      dcScroll.scrollTop == 0
    )
      return;

    this.dmSV.isSearchView = true;
    this.currView = this.templateSearch;
    this.modelSearch.page++;
    this.search();
  }
  openItem(data: any) {
    //  alert(1);
  }


  public trackItem(index: number, item: any) {
    if (item.folderName) return item.folderName;
    return null;
  }

  classFile(item, className) {
    if (item.folderName) return className;
    else return `${className} noDrop`;
  }

  _beginDrapDrop() {
    var that = this;
    setTimeout(() => {
      var root = document.getElementsByClassName('menu-nav');
      if (root != null && root.length > 0) {
        for (
          let index = 0;
          index < root[0].getElementsByClassName('menu-item').length;
          index++
        ) {
          that.initDrapDropFileFolder(
            root[0].getElementsByClassName('menu-item')[index]
          );
        }
      }
    }, 1000);
  }

  initDrapDropFileFolder(element) {
    var that = this;
    if (element && !element.getAttribute('_drapdrop')) {
      element.setAttribute('_drapdrop', '1');
      var ondragstart = function (event) {
        var j = JSON.stringify({
          folderName: element.innerText,
          recID: element.querySelector('a').classList[0],
        });
        event.originalEvent.dataTransfer.setData('data', j);
        event.originalEvent.dataTransfer['simple'] = 'filefolder';
        event.originalEvent.dataTransfer.effectAllowed = 'move';
      };
      var ondragover = (event) => {
        event.preventDefault();
        event.stopPropagation();
        //  $(event.currentTarget).css("border-style", "dashed");
        //  $(event.currentTarget).css("border-color", "#7e8299");
        //  $(event.currentTarget).css("border-width", "1px");
      };
      var ondragleave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        //   $(event.currentTarget).css("border-style", "none");
      };
      var ondrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        //  $(event.currentTarget).css("border-style", "none");
        var s = event.originalEvent.dataTransfer.getData('data');
        if (s) {
          var obj = JSON.parse(s);
          if (obj.recID != element.querySelector('a').classList[0]) {
            if (obj.fileName) {
              that.dmSV.copyFileTo(
                obj.recID,
                obj.fileName,
                element.querySelector('a').classList[0]
              );
            } else {
              that.dmSV.copyFolderTo(
                obj.recID,
                obj.folderName,
                element.querySelector('a').classList[0]
              );
            }
          }
        }
      };

      element.removeEventListener('ondragstart', ondragstart);
      element.removeEventListener('ondragover', ondragover);
      element.removeEventListener('ondragleave', ondragleave);
      element.removeEventListener('ondrop', ondrop);
      element.addEventListener('ondragstart', ondragstart);
      element.addEventListener('ondragover', ondragover);
      element.addEventListener('ondragleave', ondragleave);
      element.addEventListener('ondrop', ondrop);
    }
  }

  fileFolderDropped($event) {
    if ($event.source.recID != $event.target.recID) {
      if ($event.source.fileName) {
        this.dmSV.copyFileTo(
          $event.source.recID,
          $event.source.fileName,
          $event.target.recID
        );
      } else {
        this.dmSV.copyFolderTo(
          $event.source.recID,
          $event.source.folderName,
          $event.target.recID
        );
      }
    }
  }

  fileUploadDropped($event) {
    if (
      this.dmSV.idMenuActive.includes('DMT02') ||
      this.dmSV.idMenuActive.includes('DMT03')
    ) {
      this.attachment.fileUploadList = [];
      this.attachment.handleFileInput($event, true).then((r) => {
        this.attachment.onMultiFileSave();
      });
    }
  }

  addFile(e:any) {
    if(e.id == "btnUpload")
    {
      var index = this.button.findIndex(x=>x.id == "btnUpload");
      if (this.button[index].disabled) return;
      var data = new DialogAttachmentType();
      data.type = 'popup';
      // data.objectType = 'WP_Notes';
      // data.objectId = '628c326c590addf224627f42';
      data.functionID = this.codxview?.formModel?.funcID;
      data.isDM = true;
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '550px';
      option.FormModel.entityName = 'DM_FileInfo';
      this.dialog = this.callfc.openSide(AttachmentComponent, data, option);
      this.dialog.closed.subscribe((e) => {
        console.log(e);
      });
    }
    else if(e.id == "btnCreatFolder") this.addFolder();
    else if(e.id == "btnSelectMulti" || e.id == "btnUnSelectMulti") this.selectMulti(e.id);
    else if(e.id == "btnCopyMove") this.checkPermissCopyTo();
  }

  addFolder() {
    let option = new SidebarModel();
    option.DataService = this.dmSV.dataService;
    option.FormModel = this.dmSV.formModel;
    option.Width = '550px';
    let data = {} as any;
    data.title = 'Tạo thư mục';
    data.id = null;
    data.type = 'add';
    this.callfc.openSide(CreateFolderComponent, data, option);
  }

  getfileCount($event) {
    console.log($event);
  }

  fileAdded($event) {
    console.log($event);
  }

  async saveFile1() {
    (await this.attachment1.saveFilesObservable()).subscribe((item) => {
      console.log(item);
    });
    this.attachment.saveFiles();
  }

  saveFile2() {
    // this.attachment2.saveFilesObservable().subscribe((item) => {
    //   console.log(item);
    // });
    //  this.attachment.saveFiles();
  }

  openFile1() {
    this.attachment1.uploadFile();
  }

  openFile2() {
    // this.attachment2.uploadFile();
  }

  getPath() {
    var url = window.location.origin;
    return url;
  }

  clickMF($event, data, type) {
    if (type == 'file') {
    } else {
    }
  }
  // test()
  // {
  //   var dataRequest = new DataRequest();
  //   dataRequest.funcID = "DMT00";
  //   dataRequest.pageSize = 20,
  //   dataRequest.page = 1;
  //   var type = "All";
  //   this.api
  //   .execSv('DM', 'DM', 'FileBussiness', 'GetFiles_MobileAsync', [dataRequest,type])
  //   .subscribe();
  // }
  onSelectionChanged($data, noTree = false) {
    if(this.view.dataService.dataSelected?.recID == $data.data.recID) return;

    if(this.funcID.includes('DMT00') && $data.data.folderId == 'DM')
    {
      var treeView = this.codxview?.currentView?.currentComponent?.treeView;
      if (treeView && treeView?.dataTree && treeView.dataTree.length>0) {
        if(treeView?.dataTree)
        {
          if(!treeView.dataTree[0]?.items || treeView.dataTree[0]?.items.length ==0)
          {
            this.folderService.options.page = 1;
            this.folderService.options.pageLoading = true;
            this.isScrollFolder = true;
            this.getDataFolder(treeView.dataTree[0].recID,true,true);
          }
        }

      }
      return;

    }
    ScrollComponent.reinitialization();
    this.scrollTop();
    if (!$data || !$data?.data) return;
    this.isSearch = false;
    this.clearWaitingThumbnail();
    let id = $data?.data?.recID;
    let item = $data.data;
    if (item?.read) {
      if (item.extension) {
        var dialogModel = new DialogModel();
        dialogModel.IsFull = true;
        this.fileService.getFile(id).subscribe((data) => {
          this.callfc.openForm(
            ViewFileDialogComponent,
            data.fileName,
            1000,
            800,
            '',
            [data, this.view?.currentView?.formModel],
            '',
            dialogModel
          );
        });
      } else {
        this.loaded = false;
        var breadcumb = [];
        var breadcumbLink = [];
        this.dmSV.page = 1;
        this.data = [];
        this.dmSV.listFolder = [];
        this.dmSV.listFiles = [];
        var treeView = this.codxview?.currentView?.currentComponent?.treeView;
        if (treeView) {
          treeView.textField = 'folderName';
          var list = treeView.getBreadCumb(id);
          breadcumb.push(this.dmSV.menuActive.getValue());
          breadcumbLink.push(this.dmSV.idMenuActive);
          for (var i = list.length - 1; i >= 0; i--) {
            breadcumb.push(list[i].text);
            breadcumbLink.push(list[i].id);
          }
          this.dmSV.breadcumbLink = breadcumbLink;
          this.dmSV.breakCumArr = breadcumb;
          this.dmSV.breadcumb.next(breadcumb);
          // if(this.funcID.includes('DMT00') && !this.idQueryParams) treeView.getNodeParent($data.data.recID);
        }
        if (breadcumb.length == 0 && !noTree) id = '';

        if (noTree) {
          breadcumb = this.dmSV.breadcumb.getValue();
          breadcumb.push(item.folderName);
          if (!this.dmSV.breadcumbLink) this.dmSV.breadcumbLink = [];
          this.dmSV.breadcumbLink.push(item.recID);
        }
        //Chuyển page về 1
        this.folderService.options.page = 1;
        this.fileService.options.page = 1;

        this.isScrollFile = true;
        this.isScrollFolder = true;
        this.isScrollSearch = false;
        this.dmSV.isSearchView = false;
        this.dmSV.folderName = item.folderName;
        this.dmSV.parentFolderId = item.parentId;
        this.dmSV.parentFolder.next(item);
        this.dmSV.level = item.level;
        this.dmSV.getRight(item);
        this.dmSV.folderID = id;
        this.dmSV.folderId.next(id);

        this.getDataFolder(id);
        this.changeDetectorRef.detectChanges();
      }
    } else {
      //this.data = [];
      if (item?.read) this.notificationsService.notify(this.titleAccessDenied);
    }
  }

  loading() {}

  setBreadCumb() {
    this.cache.functionList(this.funcID).subscribe((item) =>
    {
      if (item) {
        var breadcumb = [];
        breadcumb.push(item.customName);
        this.dmSV.breadcumbLink = [''];
        //Tài liệu yêu cầu chia sẻ
        if (
          this.funcID.includes('DMT06') ||
          this.funcID.includes('DMT05') ||
          this.funcID.includes('DMT07')
        ) {
          var x = this.breakCumbArr.filter((x) => x.id == this.funcID);
          breadcumb.push(x[0].sub[0].name);
          this.dmSV.breadcumbLink = ['', ''];
        }

        //this.dmSV.breadcumbLink.push(item.customName);
        this.dmSV.menuActive.next(item.customName);
        this.dmSV.breadcumb.next(breadcumb);
      }

      if (
        !this.funcID.includes('DMT00')&&
        !this.funcID.includes('DMT06') &&
        !this.funcID.includes('DMT07')
      )
        this.getDataByFuncID(this.funcID);
      else if (this.funcID.includes('DMT06') || this.funcID.includes('DMT07')) {
        var vll = this.dmSV.loadValuelist('DM003') as any;
        if (isObservable(vll)) {
          vll.subscribe((item: any) => {
            this.vllDM003 = item?.datas;
            this.getDataByFuncID(this.funcID);
          });
        } else {
          this.vllDM003 = vll?.datas;
          this.getDataByFuncID(this.funcID);
        }
      }
    });
  }

  ngOnDestroy() {
    //this.dmSV.isAddFolder
  }

  clearWaitingThumbnail() {
    if (this.interval?.length > 0) {
      this.interval.forEach((element) => {
        clearInterval(element.instant);
      });
    }
  }

  async displayThumbnail(id, thumnbail) {
    var that = this;
    if (this.interval == null) this.interval = [];
    var files = this.dmSV.listFiles;
    var index = setInterval(async () => {
      this.fileService.UpdateThumbnail(id).subscribe((item) => {
        if (item == true) {
          let index = files.findIndex((d) => d.recID.toString() === id);
          if (index != -1) {
            // files[index].thumbnail = thumnbail;//`${this.dmSV.urlUpload}/${thumnbail}`;
            files[index].hasThumbnail = true;
            that.dmSV.listFiles = files;
            that.dmSV.ChangeData.next(true);
            that.changeDetectorRef.detectChanges();
          }
          let indexInterval = this.interval.findIndex((d) => d.id === id);
          if (indexInterval > -1) {
            clearInterval(this.interval[indexInterval].instant);
            this.interval.splice(indexInterval, 1);
          }
        }
      });
      // let url = `${this.dmSV.urlThumbnail}/${thumnbail}`;
      // try {
      //   let blob = await fetch(url).then(r => r.blob());
      //   if (blob.type != '') {
      //     let index = files.findIndex((d) => d.recID.toString() === id);
      //     if (index != -1) {
      //       files[index].thumbnail = thumnbail;
      //       that.dmSV.listFiles = files;
      //       that.dmSV.ChangeData.next(true);
      //       that.changeDetectorRef.detectChanges();
      //     }
      //     let indexInterval = this.interval.findIndex((d) => d.id === id);
      //     if (indexInterval > -1) {
      //       clearInterval(this.interval[indexInterval].instant);
      //       this.interval.splice(indexInterval, 1);
      //     }
      //   }
      // }
      // catch {

      // }
    }, 3000);

    var interval = new ItemInterval();
    interval.id = id;
    interval.instant = index;
    this.interval.push(Object.assign({}, interval));
  }

  onScrollDown($event) {
    // alert(1);
  }

  onScrollUp($event) {
    //   alert(2);
  }

  sortChanged($event) {
    this.sortColumn = $event.field;
    this.sortDirection = $event.dir;
    this.dmSV.page = 1;
    if (this.sortColumn == 'FileSize') {
      this.folderService.options.srtColumns = '';
      this.folderService.options.srtDirections = '';
    } else {
      this.folderService.options.srtColumns = this.sortColumn;
      this.folderService.options.srtDirections = this.sortDirection;
    }

    this.fileService.options.srtColumns = this.sortColumn;
    this.fileService.options.srtDirections = this.sortDirection;
    if (this.folderService.options.srtColumns == 'FileName')
      this.folderService.options.srtColumns = 'FolderName';
    this.scrollTop();
    this.refeshData();
    this.getDataFolder(this.dmSV.folderID);
  }

  scrollTop() {
    if (
      document.getElementsByClassName('containerScroll') &&
      document.getElementsByClassName('containerScroll')[0]
    )
      document.getElementsByClassName('containerScroll')[0].scrollTo(0, 0);
  }

  search() {
    this.setHideModeView(true);
    this.modelSearch.funcID = this.view.formModel.funcID;
    this.modelSearch.entityName = this.view.formModel.entityPer;
    this.isScrollSearch = true;
    this.getDataSearch();
  }
  getDataSearch() {
    this.fileService
      .searchFile(this.textSearchAll, this.modelSearch)
      .subscribe((item) => {
        if (item && item.data) {
          if (item.data && item.data.length > 0) {
            this.isScrollSearch = true;
            this.data = this.data.concat(item.data);
          } else this.isScrollSearch = false;
        } else this.isScrollSearch = false;

        if (this.data && this.data.length == 0) this.loaded = true;
      });
  }
  filterChange(e: any) {
    if (!e) return;

    this.dmSV.page = 1;
    this.dmSV.listFiles = [];
    this.dmSV.listFolder = [];
    this.data = [];
    this.dmSV.isSearchView = true;
    this.currView = this.templateSearch;
    this.setHideModeView(true);
    this.modelSearch.funcID = this.view.formModel.funcID;
    this.modelSearch.page = 1;
    this.modelSearch.entityName = this.view.formModel.entityPer;
    this.isScrollSearch = true;
    if (this.codxview.currentView.viewModel.model != null)
      this.codxview.currentView.viewModel.model.panelLeftHide = true;
    this.fileService
      .filterFile(this.funcID, e?.filter, this.dmSV.page, this.dmSV.pageSize)
      .subscribe((item) => {
        if (item) {
          this.dmSV.listFiles = item[0];
          this.totalSearch = item[1];
          this.data = [...this.data, ...this.dmSV.listFiles];
          if (this.data && this.data.length == 0) this.loaded = true;
          else this.loaded = false;
        }
      });
  }

  searchChange($event) {
    try {
      this.textSearch = $event;
      this.refeshData();
      if (this.codxview.currentView.viewModel.model != null)
        this.codxview.currentView.viewModel.model.panelLeftHide = true;
      this.isSearch = true;
      this.textSearchAll = this.textSearch;
      this.predicates = 'FileName.Contains(@0)';
      this.values = this.textSearch;
      this.searchAdvance = false;

      if (this.textSearch == null || this.textSearch == '') {
        this.isScrollSearch = false;
        if (
          this.view.funcID.includes('DMT02') ||
          this.view.funcID.includes('DMT03') ||
          this.view.funcID.includes('DMT00')
        ) {
          this.dmSV.isSearchView = false;
          this.setHideModeView();
          this.view.viewChange(this.viewActive);
          this.codxview.currentView.viewModel.model.panelLeftHide = false;
        }
        this.getDataFolder(this.dmSV.folderID);
      } else {
        this.dmSV.isSearchView = true;
        this.currView = this.templateSearch;
        this.modelSearch.page = 1;
        this.search();
      }
    } catch (ex) {
      this.totalSearch = 0;
      this.changeDetectorRef.detectChanges();
    }
  }

  // requestEnded(e: any) {
  //   this.isSearch = false;
  //   if (e.type === 'read') {
  //     //this.data = [];
  //     this.clearWaitingThumbnail();
  //     // this.dmSV.listFolder = [];
  //     //this.dmSV.listFiles = [];
  //     this.fileService.getTotalHdd().subscribe((item) => {
  //       //  totalUsed: any;
  //       // totalHdd: any;
  //       this.dmSV.updateHDD.next(item);
  //     });
  //     this.changeDetectorRef.detectChanges();
  //     this.dmSV.page = 1;
  //     //this.isSearch = false;
  //     this.folderService.options.funcID = this.view.funcID;
  //     if (this.dmSV.idMenuActive != this.view.funcID) {
  //       if (e.data) {
  //         this.data = [...e.data, ...this.data];
  //         this.dmSV.listFolder = e.data;
  //         //this.data = this.dmSV.listFolder.concat(this.listFiles);
  //       } else this.dmSV.listFolder = [];
  //     }
  //     this.view.views.forEach((item) => {
  //       if (item.text != 'Search') item.hide = false;
  //       else item.hide = true;
  //     });

  //     if (this.view.funcID != 'DMT02' && this.view.funcID != 'DMT03') {
  //       if (this.codxview.currentView.viewModel.model != null)
  //         this.codxview.currentView.viewModel.model.panelLeftHide = true;

  //       this.dmSV.deniedRight();
  //       this.dmSV.disableInput.next(true);
  //       this.button.disabled = true;
  //     } else {
  //       if (
  //         this.codxview?.currentView?.viewModel &&
  //         this.codxview?.currentView?.viewModel?.model != null
  //       )
  //         this.codxview.currentView.viewModel.model.panelLeftHide = false;
  //       this.dmSV.parentApproval = false;
  //       this.dmSV.parentPhysical = false;
  //       this.dmSV.parentCopyrights = false;
  //       this.dmSV.parentApprovers = '';
  //       this.dmSV.parentRevisionNote = '';
  //       this.dmSV.parentLocation = '';
  //       this.dmSV.parentCopyrights = false;
  //       this.dmSV.parentCreate = true;
  //       this.dmSV.parentFull = true;
  //       this.dmSV.parentAssign = true;
  //       this.dmSV.parentDelete = true;
  //       this.dmSV.parentDownload = true;
  //       this.dmSV.parentRead = true;
  //       this.dmSV.parentShare = true;
  //       this.dmSV.parentUpload = true;
  //       this.dmSV.parentUpdate = true;
  //       this.dmSV.disableInput.next(false);
  //       this.button.disabled = false;
  //     }

  //     this.changeDetectorRef.detectChanges();
  //     this._beginDrapDrop();
  //     this.dmSV.folderId.next('');
  //     this.dmSV.folderID = '';

  //     this.dmSV.menuIdActive.next(this.view.funcID);
  //     this.dmSV.idMenuActive = this.view.funcID;
  //     var breadcumb = [];
  //     breadcumb.push(this.view.function.customName);
  //     this.dmSV.menuActive.next(this.view.function.customName);
  //     this.dmSV.breadcumb.next(breadcumb);

  //     switch (this.view.funcID) {
  //       case 'DMT05':
  //         breadcumb.push(this.dmSV.titleShareBy);
  //         this.folderService.options.funcID = "DMT05";
  //         break;
  //       case 'DMT06':
  //         breadcumb.push(this.dmSV.titleRequestShare);
  //         this.folderService.options.funcID = "DMT06";
  //         break;
  //       case 'DMT07':
  //         breadcumb.push(this.dmSV.titleRequestBy);
  //         break;
  //     }
  //     if(this.view.funcID == 'DMT05' || this.view.funcID == 'DMT06')
  //     {
  //       this.getDataFile("");
  //       this.getDataFolder("");
  //     }
  //     if (this.view.funcID != 'DMT02' && this.view.funcID != 'DMT03') {
  //       this.dmSV.disableInput.next(true);
  //       this.button.disabled = true;
  //     } else {
  //       this.button.disabled = false;
  //       this.dmSV.disableInput.next(false);
  //     }
  //   }

  // }

  getDataFile(id: any, isFirst = false) {
    if (!this.isScrollFile) return;
    this.fileService.options.funcID = this.funcID;
    this.loaded = false;
    //this.fileService.options.srtColumns = this.sortColumn;
    //this.fileService.options.srtDirections = this.sortDirection;
    this.fileService.GetFiles(id).subscribe((res) => {
      if (res && res[0]) {
        if (res[0].length <= 0) this.isScrollFile = false;
        else {
          if (isFirst) this.dmSV.listFiles = [];
          this.dmSV.listFiles = this.dmSV.listFiles.concat(res[0]);
          this.dmSV.totalPage = parseInt(res[1]);
          this.data = this.dmSV.listFolder.concat(this.dmSV.listFiles);
        }
        if (this.data && this.data.length == 0) this.loaded = true;
      }
      this.unableMark();
      this.detectorRef.detectChanges();
      //ScrollComponent.reinitialization();
    });
  }

 getDataFolder(id: any, isFirst = false , isAddNode=false) {
    if (!this.isScrollFolder) return;
    this.loaded = false;
    this.folderService.options.funcID = this.funcID;
    this.folderService.getFolders(id).subscribe((res) => {
      if (res && res[0]) {
        if (isFirst) {
          this.dmSV.listFolder = [];
          this.dmSV.listFiles = [];
          this.data = [];
        }
        if(isAddNode)
        {
          var treeView = this.codxview?.currentView?.currentComponent?.treeView;
          if(treeView && treeView.dataTree)
          {
            if(!treeView.dataTree[0].items || treeView.dataTree[0].items.length ==0)
            {
              treeView.getCurrentNode(id);
              treeView.addChildNodes2ParentId(id,res[0]);
              let index = treeView.dataTree.findIndex(x=>x.recID == id);
              if(index>=0) treeView.dataTree[index].items = res[0];


              var fields = document.getElementsByClassName('menu-sub');
              for (var i = 0; i < fields.length; i ++) {
                if(fields[i].getAttribute('data-id') == id)
                {
                  fields[i].classList.remove("hide");
                  fields[i].classList.add("show");
                }
              }
              this.detectorRef.detectChanges();
            }
          }
        }
        this.dmSV.listFolder = this.dmSV.listFolder.concat(res[0]);
        this.listFolders = res[0];

        this.data = this.dmSV.listFolder.concat(this.dmSV.listFiles);
        if (this.data && this.data.length == 0) this.loaded = true;
        if (
          res[0].length <= 0 ||
          res[0].length < this.folderService.options.pageSize
        ) {
          this.isScrollFolder = false;
          this.getDataFile(id, isFirst);
        } else this.unableMark();
        this._beginDrapDrop();
      }
      this.detectorRef.detectChanges();
    });
  }

  public dlgBtnClick = (): void => {
    this.Dialog.hide();
  };

  viewFile(e: any) {
    this.dataFile = e;
    this.visible = true;
  }

  dbView(data: any) {
    if (data.recID && data.fileName != null) {
      if (!data.read) {
        this.notificationsService.notifyCode('DM059');
        return null;
      }
      this.viewFile(data);
    }
    this.dmSV.openItem(data);
  }

  dialogClosed() {
    this.visible = false;
    this.changeDetectorRef.detectChanges();
  }

  getPUser(data) {
    var item = data.permissions.filter((x) => x.approvalStatus == '3')[0];
    if (item) return item?.objectName;
    return '';
  }

  getDUser(data) {
    var item = data.permissions.filter(
      (x) =>
        x.approvalStatus == '3' ||
        x.approvalStatus == '4' ||
        x.approvalStatus == '5'
    )[0];
    if (item) return item?.createdOn;
    return '';
  }

  changeView(e: any) {
    if (e) {
      //View card
      if (e?.view?.type == ViewType.tree_card)
        this.currView = this.templateCard;
      //View Small Card
      else if (e?.view?.type == ViewType.tree_smallcard)
        this.currView = this.templateSmallCard;
      //View
      else if (e?.view?.type == ViewType.tree_list)
        this.currView = this.templateList;
      this.setHeight();


    }
  }
  clickMoreFunction(e: any, data: any) {
    if (e?.functionID == 'DMT0210') {
      this.dataFile = data;
      this.visible = true;
    } else this.dmSV.clickMF(e, data, this.view);
    //if(e?.functionID == "DMT0211") this.downc += 1;
  }

  //View Permiss
  viewPermiss(per: any) {
    if (per && per.length > 0) {
      if (per[0].create) return 'Sửa, chia sẻ, upload, download';
      return 'Chỉ được xem';
    }
    return '';
  }

  //Get content form string html
  extractContent(s: any) {
    var span = document.createElement('span');
    span.innerHTML = s;
    return span.textContent || span.innerText;
  }

  convertStatus(status: any, clss = '') {
    if (clss) {
      var color = this.vllDM003.filter((x) => x.value == status)[0]?.textColor;
      if (color) return color;
      return '';
    } else {
      var text = this.vllDM003.filter((x) => x.value == status)[0]?.text;
      if (text) return text;
      return '';
    }
  }

  onClick(id, title, subtitle, subid) {
    var breadcumb = [];
    breadcumb.push(title);
    breadcumb.push(subtitle);
    this.dmSV.idMenuActive = id;
    this.dmSV.page = 0;
    this.dmSV.breadcumb.next(breadcumb);
    this.dmSV.menuIdActive.next(id);
    this.dmSV.menuActive.next(title);
    this.dmSV.currentNode = '';
    this.dmSV.folderId.next(id);
    this.dmSV.dmFavoriteID = '2';
    this.dmSV.folderID = '';
    this.folderService.options.favoriteID = subid;
    this.fileService.options.favoriteID = subid;
    this.dmSV.refeshData.next(true);
  }

  onJump() {
    //Tài liệu chia sẻ hoặc tài liệu yêu cầu chia sẻ
    if (
      this.dmSV.idMenuActive.includes('DMT06') ||
      this.dmSV.idMenuActive.includes('DMT05') ||
      this.dmSV.idMenuActive.includes('DMT07') ||
      this.dmSV.idMenuActive.includes('DMT00')
    )
      return;
    var data = {} as any;
    data.recID = '';
    this.dmSV.folderID = '';
    this.dmSV.isSearchView = false;
    this.dmSV.refreshTree.next(true);
    this.dmSV.breadcumb.next([this.dmSV.menuActive.getValue()]);
    if (this.dmSV.breadcumbLink)
      this.dmSV.breadcumbLink = this.dmSV.breadcumbLink.slice(0, 1);
    this.changeDetectorRef.detectChanges();
  }


  selectMulti(id:any)
  {

    var btn = {
      id: 'btnSelectMulti',
      text: 'Chọn',
      formName: 'System',
      hasSet: true,
    }

    this.isSelectMulti = false;
    this.button = this.button.filter(x=>x.id != id);
    let indexCreatFolder =  this.button.findIndex(x=>x.id == "btnCreatFolder");
    let indexUpload = this.button.findIndex(x=>x.id == "btnUpload");

    if(this.fDisCreate == null) this.button[indexCreatFolder].disabled;
    if(this.fDisUpload == null) this.button[indexUpload].disabled;
    if(id == "btnSelectMulti")
    {
      btn.id = "btnUnSelectMulti";
      btn.text = "Hủy";

      var btn2 = {
        id: 'btnCopyMove',
        text: 'Sao chép / di chuyển tới',
        formName: 'System',
        hasSet: true,
      }

      this.isSelectMulti = true;
      this.button[indexCreatFolder].disabled = true;
      this.button[indexUpload].disabled = true;
      this.button.unshift(btn2);

    }
    else {
      this.button[indexCreatFolder].disabled = this.fDisCreate;
      this.button[indexUpload].disabled = this.fDisUpload;
      this.button = this.button.filter(x=>x.id != "btnCopyMove");
    }
    this.button.push(btn);
  }

  selectedItem(e:any,data:any)
  {
    if(e.srcElement.classList.contains("selected")) {
      e.srcElement.classList.remove("selected");
      this.listSeletcMulti = this.listSeletcMulti.filter(x=>x.recID != data.recID);
    }
    else {
      e.srcElement.classList.add("selected");
      this.listSeletcMulti.push(data);
    }
  }

  //Sao chép di chuyển tới
  copyTo()
  {
    if(!this.checkPermiss()) return;

    this.callfc.openForm(
      MoveComponent,
      '',
      500,
      650,
      '',
      ['all', this.listSeletcMulti, 'Di chuyển / Sao chép tới', true],
      ''
    );
  }

  checkPermiss()
  {
    if(this.listSeletcMulti.length == 0) {
      this.notificationsService.notify("Vui lòng chọn Thư mục / tệp tin cần di chuyển");
      return false;
    }
    return true;
  }
  checkPermissCopyTo()
  {
    var listNo = this.listSeletcMulti.filter(x=>!x.read);
    if(listNo && listNo.length > 0)
    {
      var name = listNo.map((u) => u.folderName || u.fileName ).join(',');
      name += ' không có quyền, bạn có muốn bỏ qua và tiếp tục thao tác không?';
      var config = new AlertConfirmInputConfig();
      config.type = 'YesNo' /* "checkBox" */;

      this.notificationsService
        .alert("Thông báo", name, config)
        .closed.subscribe((x) => {
          if (x.event.status == 'Y') {
            this.listSeletcMulti = this.listSeletcMulti.filter(x=>x.read == true);
            listNo.forEach(elm => {
              var element = document.getElementById("dm-h-"+elm.recID);
              element.classList.remove("selected");
            });
            this.copyTo();
          }
        }
      )
    }
    else this.copyTo();
  }
}
