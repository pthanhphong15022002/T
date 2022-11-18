import {
  Component,
  ViewChild,
  ChangeDetectorRef,
  TemplateRef,
  Injector,
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
} from 'codx-core';
import { CodxDMService } from '../codx-dm.service';
import { FolderInfo } from '@shared/models/folder.model';
import {
  DialogAttachmentType,
  FileInfo,
  ItemInterval,
} from '@shared/models/file.model';
import { FolderService } from '@shared/services/folder.service';
import { FileService } from '@shared/services/file.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { ActivatedRoute } from '@angular/router';
import { ViewFileDialogComponent } from 'projects/codx-share/src/lib/components/viewFileDialog/viewFileDialog.component';
import {
  AnimationSettingsModel,
  DialogComponent,
} from '@syncfusion/ej2-angular-popups';
import { mode } from 'crypto-js';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends UIComponent {
  @ViewChild('templateMain') templateMain: TemplateRef<any>;
  @ViewChild('templateSearch') templateSearch: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('templateCard') templateCard: TemplateRef<any>;
  @ViewChild('templateSmallCard') templateSmallCard: TemplateRef<any>;
  @ViewChild('templateList') templateList: TemplateRef<any>;
  @ViewChild('attachment1') attachment1: AttachmentComponent;
  //  @ViewChild('attachment2') attachment2: AttachmentComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('view') codxview!: any;
  @ViewChild('Dialog') public Dialog: DialogComponent;
  animationSettings: AnimationSettingsModel = { effect: 'None' };
  viewActive: any;
  currView?: TemplateRef<any>;
  path: string;
  button?: ButtonModel;
  typeView: ViewType;
  viewIcon: string;
  views: Array<ViewModel> = [];
  orgViews: Array<ViewModel> = [];
  listFolders: FolderInfo[];
  listFiles: FileInfo[];
  data = [];
  titleAccessDeniedFile = 'Bạn không có quyền truy cập file này';
  titleAccessDenied = 'Bạn không có quyền truy cập thư mục này';
  titleFileName = 'Tên tài liệu';
  titleCreatedBy = 'Người tạo';
  titleCreatedOn = 'Ngày tạo';
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

  //loadedFile: boolean;
  //loadedFolder: boolean;
  //page = 1;
  //totalPage = 1;
  isSearch = false;
  user: any;
  dialog!: DialogRef;
  interval: ItemInterval[];
  item: any;

  // @ViewChild('attachment') attachment: AttachmentComponent
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

  onScroll(event) {
    const dcScroll = event.srcElement;
    if (
      dcScroll.scrollTop + dcScroll.clientHeight <
      dcScroll.scrollHeight - 150
    ) {
      return;
    }
    if (this.dmSV.page < this.dmSV.totalPage) {
      this.dmSV.page++;
      if (!this.isSearch) {
        this.folderService.options.srtColumns = this.sortColumn;
        this.folderService.options.srtDirections = this.sortDirection;
        this.fileService.options.funcID = this.view.funcID;
        this.fileService.options.page = this.dmSV.page;
        this.fileService.GetFiles(this.dmSV.folderID).subscribe(async (res) => {
          if (res != null) {
            this.dmSV.listFiles = this.dmSV.listFiles.concat(res[0]);
            this.data = this.dmSV.listFolder.concat(this.dmSV.listFiles);
            this.dmSV.totalPage = parseInt(res[1]);
          }

          this.changeDetectorRef.detectChanges();
        });
      } else this.search(true);
    }
  }

  openItem(data: any) {
    //  alert(1);
  }

  onLoading($event): void {
    // this.views.forEach(item => {
    //   if (this.view.funcID === 'DMT02' || this.view.funcID === 'DMT03') {
    //     if (item.id === "1") {
    //       item.hide = false;
    //       if (item.text === "Card")
    //         item.active = true;
    //       else
    //         item.active = false;
    //     }
    //     else
    //       item.hide = true;
    //   }
    //   else {
    //     //"DMT06"  "DMT07"
    //     if (item.id === "2") {
    //       if (this.view.funcID === 'DMT06' || this.view.funcID === 'DMT06')
    //       {
    //         if (item.text === "List") {
    //           item.active = true;
    //           item.hide = false;
    //         }
    //         else  {
    //           item.active = false;
    //           item.hide = true;
    //         }
    //       }
    //       else {
    //         item.hide = false;
    //         if (item.text === "Card")
    //           item.active = true;
    //         else
    //           item.active = false;
    //       }
    //     }
    //     else
    //       item.hide = true;
    //   }
    // });
    // this.changeDetectorRef.detectChanges();
  }

  onInit(): void {
    this.user = this.auth.get();
    this.path = this.getPath();
    this.button = {
      id: 'btnUpload',
      text: 'Tải lên',
    };

    this.route.queryParams.subscribe((params) => {
      if (params?.id) {
        var dialogModel = new DialogModel();
        dialogModel.IsFull = true;
        this.fileService.getFile(params?.id).subscribe((data) => {
          if (data.read) {
            this.callfc.openForm(
              ViewFileDialogComponent,
              data.fileName,
              1000,
              800,
              '',
              [data, this.codxview],
              '',
              dialogModel
            );
            var files = this.listFiles;
            if (files != null) {
              let index = files.findIndex(
                (d) => d.recID.toString() === data.recID
              );
              if (index != -1) {
                files[index] = data;
              }
              this.listFiles = files;
              this.dmSV.ChangeData.next(true);
            }
          } else {
            this.notificationsService.notify(this.titleAccessDeniedFile);
          }
        });
      }
    });
   
    this.dmSV.isDisableUpload.subscribe((res) => {
      if (res) {
        this.button.disabled = res;
        this.changeDetectorRef.detectChanges();
      }
    });

    this.dmSV.isNodeSelect.subscribe((res) => {
      if (res) {
        var tree = this.codxview?.currentView?.currentComponent?.treeView;
        if (tree) {
          if (res.recID) tree.getCurrentNode(res.recID);
          else tree.getCurrentNode(res);
        }
      }
    });

    this.dmSV.isNodeDeleted.subscribe((res) => {
      if (res) {
        var tree = this.codxview?.currentView?.currentComponent?.treeView;
        if (tree) {
          tree.removeNodeTree(res);
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
            this.dmSV.page = 1;
            this.getDataFolder(this.dmSV.folderID);
            this.getDataFile(this.dmSV.folderID);
          }
        }
        this.data = this.data.filter((x) => x.recID != res);
        this.view.dataService.data = this.view.dataService.data.filter(
          (x) => x.recID != res
        );
        this.changeDetectorRef.detectChanges();
        this._beginDrapDrop();
      }
    });

    this.dmSV.isNodeChange.subscribe((res) => {
      if (res) {
        var tree = this.codxview?.currentView?.currentComponent?.treeView;
        if (tree != null) tree.setNodeTree(res);
        //  that.dmSV.folderId.next(res.recID);
      }
    });

    this.dmSV.isSetThumbnailWait.subscribe((item) => {
      if (item != null) {
        this.displayThumbnail(item.recID, item.thumbnail);
      }
    });
    this.dmSV.isRefreshTree.subscribe((res) => {
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
        this.dmSV.page = 1;
        this.dmSV.listFolder = this.view.dataService.data;
        this.fileService.options.page = 1;
        this.fileService.options.funcID = this.view.funcID;

        this.fileService.GetFiles('').subscribe(async (res) => {
          if (res) {
            this.dmSV.listFiles = res[0];
            this.dmSV.totalPage = parseInt(res[1]);
          } else {
            this.dmSV.listFiles = [];
          }

          this.data = [...this.dmSV.listFolder, ...res[0]];

          this.changeDetectorRef.detectChanges();
        });

        //this.data = this.view.dataService.data
      }
    });
    this.dmSV.isChangeData.subscribe((item) => {
      if (item) {
        this.getDataFolder(this.dmSV.folderID);
        var result = this.dmSV.listFolder;
        if (this.dmSV.listFiles && this.dmSV.listFiles.length > 0)
          result = result.concat(this.dmSV.listFiles);
        this.data = result;
        this.data = [...this.data];
        this.changeDetectorRef.detectChanges();
      }
    });
    this.dmSV.isAddFolder.subscribe((item) => {
      if (item) {
        var tree = this.codxview?.currentView?.currentComponent?.treeView;
        if (tree) tree.setNodeTree(item);
        this.changeDetectorRef.detectChanges();
        this.data = [];
        var a = { data: item };
        if(this.view.dataService.data.length == 0)
          this.view.dataService.data.push(item);
        var ele = document.getElementsByClassName('item-selected');
        if (ele.length > 0) ele[0].classList.remove('item-selected');
        var ele2 = document.getElementsByClassName(item?.recID);
        if (ele2.length > 0) ele2[0].classList.add('item-selected');
        this.onSelectionChanged(a);
      }
      this._beginDrapDrop();
    });
    this.dmSV.isEmptyTrashData.subscribe((item) => {
      if (item) {
        this.data = [];
        this.dmSV.listFiles = [];
        this.dmSV.listFolder = [];
        this.changeDetectorRef.detectChanges();
      }
    });
  }
  public trackItem(index: number, item: any) {
    if (item.folderName) return item.folderName;
    return null;
  }
  classFile(item, className) {
    if (item.folderName != null) return className;
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
      this.dmSV.idMenuActive == 'DMT02' ||
      this.dmSV.idMenuActive == 'DMT03'
    ) {
      this.attachment.fileUploadList = [];
      this.attachment.handleFileInput($event, true).then((r) => {
        this.attachment.onMultiFileSave();
      });
    }
  }

  addFile($event) {
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

    this.dialog = this.callfc.openSide(AttachmentComponent, data, option);
    this.dialog.closed.subscribe((e) => {
      console.log(e);
    });
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

  onSelectionChanged($data) {
    ScrollComponent.reinitialization();
    if (!$data && ($data == null || $data?.data == null)) {
      return;
    }
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
        }
        if (breadcumb.length == 0) {
          id = '';
        }
        this.dmSV.folderName = item.folderName;
        this.dmSV.parentFolderId = item.parentId;
        this.dmSV.parentFolder.next(item);
        this.dmSV.level = item.level;
        this.dmSV.getRight(item);

        this.dmSV.folderID = id;
        this.dmSV.folderId.next(id);
        this.folderService.options.srtColumns = this.sortColumn;
        this.folderService.options.srtDirections = this.sortDirection;
        this.folderService.options.funcID = this.view.funcID;
        this.folderService.getFolders(id).subscribe(async (res) => {
          if (res != null) {
            this.dmSV.listFolder = res[0];
            this.listFolders = res[0];
            this.data = this.dmSV.listFolder.concat(this.dmSV.listFiles);
            var tree = this.codxview?.currentView?.currentComponent?.treeView;
            item.items = [];
            if (tree) tree.addChildNodes(item, res[0]);
            this.changeDetectorRef.detectChanges();
            this._beginDrapDrop();
          }
        });
        this.fileService.options.page = 1;
        this.fileService.options.funcID = this.view.funcID;
        this.fileService.GetFiles(id).subscribe(async (res) => {
          if (res != null) {
            this.dmSV.listFiles = res[0];
            this.dmSV.totalPage = parseInt(res[1]);
            this.data = this.dmSV.listFolder.concat(this.dmSV.listFiles);
          } else {
            this.dmSV.listFiles = [];
          }

          // if (this.sortDirection == null || this.sortDirection == "asc") {
          //   this.data = [...this.dmSV.listFolder, ...res[0]];
          // }
          // else
          //   this.data = [...this.dmSV.listFolder, ...this.dmSV.listFiles,];

          this.changeDetectorRef.detectChanges();
        });
      }
    } else {
      //this.data = [];
      if (item?.read) this.notificationsService.notify(this.titleAccessDenied);
    }
  }

  loading() {}

  ngAfterViewInit(): void {
    this.cache.valueList('SYS025').subscribe((item) => {
      if (item) {
        this.sys025 = item;
        this.views[0].text = item.datas[3].text;
        this.views[0].icon = item.datas[3].icon;
        this.views[2].text = item.datas[4].text;
        this.views[2].icon = item.datas[4].icon;
        this.views[3].text = item.datas[0].text;
        this.views[3].icon = item.datas[0].icon;
        this.orgViews[1].text = item.datas[3].text;
        this.orgViews[1].icon = item.datas[3].icon;
        this.orgViews[2].text = item.datas[4].text;
        this.orgViews[2].icon = item.datas[4].icon;
        this.orgViews[3].text = item.datas[0].text;
        this.orgViews[3].icon = item.datas[0].icon;
        this.view.views = this.views;
        this.changeDetectorRef.detectChanges();
      }
    });
    this.views = [
      {
        id: '1',
        icon: this.sys025?.datas[3].icon,
        text: 'card',
        type: ViewType.tree_card,
        active: true,
        sameData: true,
        /*  toolbarTemplate: this.templateSearch,*/
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          template2: this.templateCard,
          resizable: false,
        },
      },
      {
        id: '1',
        icon: 'icon-search',
        text: 'Search',
        hide: true,
        type: ViewType.tree_list,
        sameData: true,
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          template2: this.templateSearch,
          resizable: false,
        },
      },
      {
        id: '1',
        icon: this.sys025?.datas[4].icon,
        text: 'smallcard',
        type: ViewType.tree_smallcard,
        active: false,
        sameData: true,
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          template2: this.templateSmallCard,
          resizable: false,
        },
      },
      {
        id: '1',
        icon: this.sys025?.datas[0].icon,
        text: 'list',
        type: ViewType.tree_list,
        sameData: true,
        active: false,
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          template2: this.templateList,
          resizable: false,
        },
      },
    ];
    this.orgViews = [
      {
        id: '1',
        icon: 'icon-search',
        text: 'Search',
        hide: true,
        type: ViewType.tree_list,
        sameData: true,
        /*  toolbarTemplate: this.templateSearch,*/
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          template2: this.templateSearch,
          resizable: false,
        },
      },
      {
        id: '1',
        icon: this.sys025?.datas[3].icon,
        text: 'card',
        type: ViewType.tree_card,
        active: true,
        sameData: true,
        /*  toolbarTemplate: this.templateSearch,*/
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          template2: this.templateCard,
          resizable: false,
        },
      },
      {
        id: '1',
        icon: this.sys025?.datas[4].icon,
        text: 'smallcard',
        type: ViewType.tree_smallcard,
        active: false,
        sameData: true,
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          template2: this.templateSmallCard,
          resizable: false,
        },
      },
      {
        id: '1',
        icon: this.sys025?.datas[0].icon,
        text: 'list',
        type: ViewType.tree_list,
        active: false,
        sameData: true,
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          template2: this.templateList,
          resizable: false,
        },
      },
    ];
    this.viewActive = this.views.filter((x) => x.active == true)[0];
    this.codxview.dataService.parentIdField = 'parentId';
    this.dmSV.formModel = this.view.formModel;
    this.dmSV.dataService = this.view?.currentView?.dataService;
   
    if(this.view.funcID == 'DMT05' || this.view.funcID == 'DMT06')
    {
      this.dmSV.dmFavoriteID = "2";
      this.folderService.options.favoriteID = "2";
      this.fileService.options.favoriteID = "2";
    }
    this.getDataFile('');
    //   console.log(this.button);
  }

  changeView(event) {
    this.currView = null;
    this.currView = event.view.model.template2;
    //  this.data = [];
  }
  viewChanging(event) {
 
    if (event.text != 'Search' && this.view.formModel.funcID != 'DMT02') {
      this.data = [];
      if(this.view.funcID == 'DMT05' || this.view.funcID == 'DMT06')
      {
        this.dmSV.dmFavoriteID = "2";
        this.folderService.options.favoriteID = "2";
        this.fileService.options.favoriteID = "2";
      }
      this.dmSV.page = 1;
      var id = !this.dmSV.folderID ? '' : this.dmSV.folderID;
      this.getDataFile(id);
    }
  }
  ngOnDestroy() {
    console.log('detroy');
    //   this.atSV.openForm.unsubscribe();
    //this.clearWaitingThumbnail();
    // if (this.interval?.length > 0) {
    //   this.interval.forEach((element) => {
    //     clearInterval(element.instant);
    //   });
    // }
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
    this.dmSV.listFiles = [];
    this.dmSV.page = 1;
    this.folderService.options.srtColumns = this.sortColumn;
    this.folderService.options.srtDirections = this.sortDirection;
    this.fileService.options.srtColumns = this.sortColumn;
    this.fileService.options.srtDirections = this.sortDirection;
    this.fileService.options.funcID = this.view.funcID;
    this.data = [];
    this.folderService.getFolders(this.dmSV.folderID).subscribe(async (res) => {
      if (res) {
        this.dmSV.listFolder = res[0];
        this.data = this.dmSV.listFolder.concat(this.dmSV.listFiles);
        this.changeDetectorRef.detectChanges();
      }
    });
    this.fileService.options.page = this.dmSV.page;
    this.fileService.GetFiles(this.dmSV.folderID).subscribe((res) => {
      if (res) {
        this.dmSV.listFiles = res[0];
        this.data = this.dmSV.listFolder.concat(res[0]);
        this.dmSV.totalPage = parseInt(res[1]);
      }

      this.changeDetectorRef.detectChanges();
    });
  }

  getTotalPage(total) {
    let pages = total / this.dmSV.pageSize;
    if (pages * this.dmSV.pageSize < total) pages++;
    this.dmSV.totalPage = pages;
  }

  search(isScroll = false) {
    this.views.forEach((item) => {
      item.hide = true;
      if (item.text == 'Search') item.hide = false;
    });

    var model = new DataRequest();
    model.funcID = this.view.formModel.funcID;
    model.page = this.dmSV.page;
    model.pageSize = this.dmSV.pageSize;
    model.entityName = this.view.formModel.entityPer;
    this.fileService.searchFile(this.textSearchAll, model).subscribe((item) => {
      if (item != null) {
        if (!isScroll) {
          var view = this.views.filter((x) => x.text == 'Search')[0];
          view.active = true;
          this.view.viewChange(view);
        }

        // this.dmSV.listFiles = item.data;
        this.totalSearch = item.total;
        this.dmSV.listFiles = [...this.dmSV.listFiles, ...item.data];
        this.data = [...this.data, ...this.dmSV.listFiles];
        this.getTotalPage(item.total);
        this.changeDetectorRef.detectChanges();
      } else {
        //this.dmSV.loadedFile = true;
        this.totalSearch = 0;
        this.dmSV.totalPage = 0;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  filterChange($event) {
    if (!$event) {
      this.dmSV.page = 1;
      this.getDataFolder(this.dmSV.folderID);
      this.getDataFile(this.dmSV.folderID);
    } else {
      try {
        this.data = [];
        this.isSearch = true;
        this.view.orgView = this.orgViews;
        this.dmSV.page = 1;
        this.dmSV.listFiles = [];
        this.dmSV.listFolder = [];
        if ($event != undefined) {
          var predicates = $event.predicates;
          var values = $event.values;
          //$event.paras;
          var list = [];
          var item = new Filters();
          $event?.filter.forEach((ele) => {
            item = ele as Filters;
            list.push(Object.assign({}, item));
          });
          var text = JSON.stringify(list);
          this.textSearchAll = text;
          this.predicates = predicates;
          this.values = values;
          this.searchAdvance = true;
          //this.search();
          this.fileService
            .searchFileAdv(
              text,
              predicates,
              values,
              this.dmSV.page,
              this.dmSV.pageSize,
              this.searchAdvance,
              this.view.formModel.funcID
            )
            .subscribe((item) => {
              if (item != null) {
                this.dmSV.listFiles = item.data;
                this.totalSearch = item.total;
                this.data = [...this.data, ...this.dmSV.listFiles];
                this.getTotalPage(item.total);
                this.changeDetectorRef.detectChanges();
              } else {
                this.totalSearch = 0;
                this.dmSV.totalPage = 0;
                this.changeDetectorRef.detectChanges();
              }
            });
        }
      } catch (ex) {
        this.totalSearch = 0;
        this.changeDetectorRef.detectChanges();
        console.log(ex);
      }
    }
  }

  searchChange($event) {
    try {
      this.textSearch = $event;
      this.data = [];
      this.dmSV.listFiles = [];
      this.dmSV.listFolder = [];

      if (this.codxview.currentView.viewModel.model != null)
        this.codxview.currentView.viewModel.model.panelLeftHide = true;
      this.isSearch = true;
      this.view.orgView = this.orgViews;
      this.dmSV.page = 1;
      this.fileService.options.page = this.dmSV.page;
      this.textSearchAll = this.textSearch;
      this.predicates = 'FileName.Contains(@0)';
      this.values = this.textSearch;
      this.searchAdvance = false;

      if (this.textSearch == null || this.textSearch == '') {
        this.views.forEach((item) => {
          item.active = false;
          item.hide = false;
          if (item.text == 'Search') item.hide = true;
          if (item.text == this.viewActive.text) item.active = true;
        });
        if (this.view.funcID == 'DMT02' || this.view.funcID == 'DMT03') {
          this.view.viewChange(this.viewActive);
          this.codxview.currentView.viewModel.model.panelLeftHide = false;
        }
        this.getDataFolder(this.dmSV.folderID);
        this.getDataFile(this.dmSV.folderID);
        this.changeDetectorRef.detectChanges();
      } else this.search();
    } catch (ex) {
      this.totalSearch = 0;
      this.changeDetectorRef.detectChanges();
      console.log(ex);
    }
  }

  requestEnded(e: any) {
    this.isSearch = false;
    if (e.type === 'read') {
      //this.data = [];
      this.clearWaitingThumbnail();
      // this.dmSV.listFolder = [];
      this.dmSV.listFiles = [];
      this.fileService.getTotalHdd().subscribe((item) => {
        //  totalUsed: any;
        // totalHdd: any;
        this.dmSV.updateHDD.next(item);
      });
      this.changeDetectorRef.detectChanges();
      this.dmSV.page = 1;
      //this.isSearch = false;
      this.folderService.options.funcID = this.view.funcID;
      if (this.dmSV.idMenuActive != this.view.funcID) {
        if (e.data) {
          this.data = [...e.data, ...this.data];
          this.dmSV.listFolder = e.data;
          //this.data = this.dmSV.listFolder.concat(this.listFiles);
        } else this.dmSV.listFolder = [];
      }
      this.view.views.forEach((item) => {
        if (item.text != 'Search') item.hide = false;
        else item.hide = true;
      });

      if (this.view.funcID != 'DMT02' && this.view.funcID != 'DMT03') {
        if (this.codxview.currentView.viewModel.model != null)
          this.codxview.currentView.viewModel.model.panelLeftHide = true;

        this.dmSV.deniedRight();
        this.dmSV.disableInput.next(true);
        this.button.disabled = true;
      } else {
        if (
          this.codxview?.currentView?.viewModel &&
          this.codxview?.currentView?.viewModel?.model != null
        )
          this.codxview.currentView.viewModel.model.panelLeftHide = false;
        this.dmSV.parentApproval = false;
        this.dmSV.parentPhysical = false;
        this.dmSV.parentCopyrights = false;
        this.dmSV.parentApprovers = '';
        this.dmSV.parentRevisionNote = '';
        this.dmSV.parentLocation = '';
        this.dmSV.parentCopyrights = false;
        this.dmSV.parentCreate = true;
        this.dmSV.parentFull = true;
        this.dmSV.parentAssign = true;
        this.dmSV.parentDelete = true;
        this.dmSV.parentDownload = true;
        this.dmSV.parentRead = true;
        this.dmSV.parentShare = true;
        this.dmSV.parentUpload = true;
        this.dmSV.parentUpdate = true;
        this.dmSV.disableInput.next(false);
        this.button.disabled = false;
      }

      this.changeDetectorRef.detectChanges();
      this._beginDrapDrop();
      this.dmSV.folderId.next('');
      this.dmSV.folderID = '';

      this.dmSV.menuIdActive.next(this.view.funcID);
      this.dmSV.idMenuActive = this.view.funcID;
      var breadcumb = [];
      breadcumb.push(this.view.function.customName);
      this.dmSV.menuActive.next(this.view.function.customName);
      this.dmSV.breadcumb.next(breadcumb);

      switch (this.view.funcID) {
        case 'DMT05':
          breadcumb.push(this.dmSV.titleShareBy);
          this.folderService.options.funcID = "DMT05";
          break;
        case 'DMT06':
          breadcumb.push(this.dmSV.titleRequestShare);
          this.folderService.options.funcID = "DMT06";
          break;
        case 'DMT07':
          breadcumb.push(this.dmSV.titleRequestBy);
          break;
      }
      if(this.view.funcID == 'DMT05' || this.view.funcID == 'DMT06')
      {
        this.getDataFolder("");
      }
      if (this.view.funcID != 'DMT02' && this.view.funcID != 'DMT03') {
        this.dmSV.disableInput.next(true);
        this.button.disabled = true;
      } else {
        this.button.disabled = false;
        this.dmSV.disableInput.next(false);
      }
    }
  }
  getDataFile(id: any) {
    this.fileService.options.funcID = this.view.funcID;
    this.dmSV.listFiles = [];
    this.folderService.options.srtColumns = this.sortColumn;
    this.folderService.options.srtDirections = this.sortDirection;
    this.fileService.options.funcID = this.view.funcID;
    this.fileService.options.page = this.dmSV.page;
    this.fileService.GetFiles(id).subscribe((res) => {
      if (res) {
        this.dmSV.listFiles = res[0];
        this.dmSV.totalPage = parseInt(res[1]);
        this.data = this.dmSV.listFolder.concat(this.dmSV.listFiles);
        this.changeDetectorRef.detectChanges();
      }
      ScrollComponent.reinitialization();
    });
  }
  getDataFolder(id: any) {
    this.dmSV.listFolder = [];
    this.folderService.options.srtColumns = this.sortColumn;
    this.folderService.options.srtDirections = this.sortDirection;
    this.folderService.options.funcID = this.view.funcID;
    this.folderService.getFolders(id).subscribe((res) => {
      if (res) {
        this.dmSV.listFolder = res[0];
        this.listFolders = res[0];
        this.data = this.dmSV.listFolder.concat(this.dmSV.listFiles);
        this.changeDetectorRef.detectChanges();
        this._beginDrapDrop();
      }
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
      this.fileService.getFile(data.recID).subscribe((data) => {
        this.viewFile(data);
      });
    }
    this.dmSV.openItem(data);
  }
  dialogClosed() {
    this.visible = false;
    this.changeDetectorRef.detectChanges();
  }
}
