import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  TemplateRef,
  Injector,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  DataRequest,
  UserModel,
  ViewType,
  ViewModel,
  UIComponent,
  ButtonModel,
  NotificationsService,
  SidebarModel,
  DialogRef,
  CRUDService,
  ScrollComponent,
} from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import {
  AccPoints,
  IAccAnimationCompleteEventArgs,
  ILoadedEventArgs,
  AccumulationChartComponent,
  AccumulationChart,
  AnimationModel,
  Theme,
  Thickness,
} from '@syncfusion/ej2-angular-charts';
import { SelectweekComponent } from 'projects/codx-share/src/lib/components/selectweek/selectweek.component';
import { CodxDMService } from '../codx-dm.service';
import { FolderInfo } from '@shared/models/folder.model';
import { DialogAttachmentType, FileInfo } from '@shared/models/file.model';
import { FolderService } from '@shared/services/folder.service';
import { FileService } from '@shared/services/file.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CreateFolderComponent } from '../createFolder/createFolder.component';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import { CommandColumnService } from '@syncfusion/ej2-angular-grids';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends UIComponent {
  @ViewChild('templateMain') templateMain: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('templateCard') templateCard: TemplateRef<any>;
  @ViewChild('templateSmallCard') templateSmallCard: TemplateRef<any>;
  @ViewChild('templateList') templateList: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('attachment1') attachment1: AttachmentComponent;
  @ViewChild('view') codxview!: any;
  currView?: TemplateRef<any>;
  path: string;
  button?: ButtonModel;
  typeView: ViewType;
  viewIcon: string;
  views: Array<ViewModel> = [];
  listFolders: FolderInfo[];
  listFiles: FileInfo[];
  data = [];
  titleAccessDenied = 'Bạn không có quyền truy cập thư mục này';
  titleFileName = 'Tên tài liệu';
  titleCreatedBy = 'Người tạo';
  titleCreatedOn = 'Ngày tạo';
  titleLength = 'Dung lượng';
  //loadedFile: boolean;
  //loadedFolder: boolean;
  user: any;
  dialog!: DialogRef;
  // @ViewChild('attachment') attachment: AttachmentComponent
  constructor(
    inject: Injector,
    public dmSV: CodxDMService,
    private auth: AuthStore,
    private folderService: FolderService,
    private fileService: FileService,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService
  ) {
    super(inject);
  }

  onInit(): void {
    this.user = this.auth.get();
    this.path = this.getPath();
    this.button = {
      id: 'btnUpload',
    };

    this.dmSV.isChangeData.subscribe((item) => {
      if (item) {
        this.data = [];
        this.changeDetectorRef.detectChanges();
      //  this.data = [...this.data, ...this.dmSV.listFolder];
        this.data = [...this.dmSV.listFolder, ...this.dmSV.listFiles];
        this.changeDetectorRef.detectChanges();
      }
    });

    this.dmSV.isEmptyTrashData.subscribe((item) => {
      if (item) {
        this.data = [];
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  identifyData(index, data) {
    return data;
  }

  addFile($event) {  
    var data = new DialogAttachmentType();
    data.objectType = 'WP_Notes';
    data.objectId = '628c326c590addf224627f42';
    data.functionID = 'ODT3';
    data.type = 'popup';

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
    // this.data = event.stopImmediatePropagation;
  }

  saveFile() {
    this.attachment.saveFilesObservable().subscribe((item) => {
      console.log(item);
    });
    //  this.attachment.saveFiles();
  }

  openFile() {
    this.attachment.uploadFile();
  }

  openFile1() {
    this.attachment1.uploadFile();
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

  setFullHtmlNode(folder, text) {
    var item1 = '';
    var item2 = '';

    if (folder.icon == '' || folder.icon == null || folder.icon == undefined)
      item1 = '<img class="h-15px" src="../../../assets/codx/dms/folder.svg">';
    else {
      if (folder.icon.indexOf('.') == -1)
        item1 = `<i class="${folder.icon}" role="presentation"></i>`;
      else {
        var path = `${this.path}/${folder.icon}`;
        item1 = `<img class="h-15px " src="${path}">`;
      }
    }

    if (!folder.read)
      item2 = `<i class="icon-per no-permission me-2" role="presentation"></i>`;
    var fullText = `${item1}
                    ${item2}
                    <span class="mytree_node  me-2"></span>
                    ${text}`;

    return fullText;
  }

  onSelectionChanged($data) {
    //  console.log($data.data);
    // alert(1);
    //let data = $event.data;
    ScrollComponent.reinitialization();
    if ($data == null || $data.data == null) return;

    let id = $data.data.recID;
    let item = $data.data;
    if (item.read) {
      // var breadcumb = [];
      // var breadcumbLink = [];
      // var list = this.tree.getBreadCumb(id);
      // this.dmSV.folderName = item.folderName;
      // this.dmSV.parentFolderId = item.parentId;
      // this.dmSV.level = item.level;
      // this.dmSV.disableInput.next(false);
      // if (this.dmSV.currentDMIndex.getValue() == "3")
      //   this.dmSV.changeTemplate("0");
      // // this.dmSV.level = data.node.data;
      // //this.dmSV.parentFolderId = data.node.parent;
      // this.dmSV.parentFolder.next(item);
      // this.dmSV.getRight(item);
      // console.log(list);

      // breadcumb.push(this.dmSV.menuActive.getValue());
      // breadcumbLink.push(this.dmSV.idMenuActive);
      // for (var i = list.length - 1; i >= 0; i--) {
      //   breadcumb.push(list[i].text);
      //   breadcumbLink.push(list[i].id);
      // }
      // this.dmSV.breadcumbLink = breadcumbLink;
      // this.dmSV.breadcumb.next(breadcumb);
      // this.dmSV.currentNode = id;
      // this.dmSV.currentNode = id;
      this.data = [];
      this.dmSV.folderId.next(id);
      //this.view.dataService.addDatas(id, )
      var items = item.items;
      //  this.dmSV.listFolder = [];
      if (items == undefined || items.length <= 0) {
        //     this.folderService.options.funcID =
        this.folderService.options.funcID = this.view.funcID;
        this.folderService.getFolders(id).subscribe(async (res) => {
          //  this.dmSV.isTree = true;
          if (res != null) {
            //var datas = new Map<string, any>();
            //  datas.set(id, res[0]);
            //cdxView
            var data = res[0];
            // this.view.dataService.addNew(data);
            this.listFolders = data;
            this.data = [...this.data, ...data];
            this.dmSV.listFolder = data;
            var tree = this.codxview.currentView.currentComponent.treeView;
            item.items = [];
            tree.addChildNodes(item, data);
            this.changeDetectorRef.detectChanges();
            // this.dmSV.isTree = false;
          }
        });
      } else {
        //this.dmSV.isTree = true;
        //  alert(1);
        this.data = [...this.data, ...item.items];
        this.dmSV.listFolder = item.items;
        // this.dmSV.listFolder.next(item.items);
        //  this.listFolders = item.items;
        this.changeDetectorRef.detectChanges();
        //this.dmSV.isTree = false;
      }

      this.fileService.getListActiveFiles(id, this.dmSV.idMenuActive).subscribe(async res => {
        ///this.dmSV.listFiles.next(res);
        this.data = [...this.data, ...res];
        this.dmSV.listFiles = res;  
        this.changeDetectorRef.detectChanges();
      });
    } else {
      this.dmSV.disableInput.next(true);
     // this.notificationsService.notify(this.titleAccessDenied);
    }
    
  }

  // checkUserForder(data) {
  //   return false;
  // }

  ngAfterViewInit(): void {
    // this.button.nativeElement.disabled = true;
    // this.view.button.disabled = true;

    this.views = [
      {
        id: '1',
        icon: 'icon-appstore',
        text: 'Card',
        type: ViewType.treedetail,
        active: true,
        sameData: true,
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          template2: this.templateCard,
          resizable: true,
        },
      },
      {
        id: '1',
        icon: 'icon-apps',
        text: 'Small Card',
        type: ViewType.treedetail,
        sameData: true,
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          template2: this.templateSmallCard,
          resizable: true,
        },
      },
      {
        id: '1',
        icon: 'icon-format_list_bulleted',
        text: 'List',
        type: ViewType.treedetail,
        sameData: true,
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          template2: this.templateList,
          resizable: true,
        },
      },
    ];
    this.codxview.dataService.parentIdField = 'ParentID';
    this.dmSV.formModel = this.view.formModel;
    this.dmSV.dataService = this.view?.currentView?.dataService;
    this.changeDetectorRef.detectChanges();
    console.log(this.button);
  }

  changeView(event) {
    this.currView = null;
    this.currView = event.view.model.template2;
  //  ScrollComponent.reinitialization("[data-kt-scroll='true']");
   // ScrollComponent.resize();
    // if (this.dmSV.folderType != this.view.funcID) {
    //   this.data = [];
    //   this.dmSV.folderType = this.view.funcID;
    //   this.dmSV.idMenuActive = this.view.funcID;
    //   this.changeDetectorRef.detectChanges();
    // }
    // this.folderService.options.funcID = this.view.funcID;
    // if (this.dmSV.folderType != this.view.funcID) {
    //   this.data = [...this.data, ...this.view.dataService.dataSelected];
    //   this.dmSV.listFolder = this.view.dataService.dataSelected;
    //   this.dmSV.loadedFolder = true;
    //   this.changeDetectorRef.detectChanges();      
    // }
      
    // this.dmSV.folderType = this.view.funcID;
    // this.dmSV.idMenuActive = this.view.funcID;
    // this.dmSV.loadedFile = false;
    // this.dmSV.folderId.next("");  
    // this.dmSV.loadedFolder = true;
    // this.changeDetectorRef.detectChanges();
    // this.fileService.options.funcID = this.view.funcID;
    // this.fileService
    //   .getListActiveFiles('', this.view.funcID)
    //   .subscribe(async (res) => {
    //     if (res != null) {            
    //       this.data = [...this.data, ...res];
    //       this.dmSV.listFiles = res;
    //       this.dmSV.loadedFile = true;
    //       this.changeDetectorRef.detectChanges();
    //     }
    //   });
  }

  requestEnded(e: any){
      if(e.type === "read"){ 
        this.data = [];    
      this.folderService.options.funcID = this.view.funcID;
      if (this.dmSV.folderType != this.view.funcID) {
        this.data = [...this.data, ...e.data];
        this.dmSV.listFolder = e.data;
        this.dmSV.loadedFolder = true;       
      }

      this.dmSV.folderType = this.view.funcID;
      this.dmSV.idMenuActive = this.view.funcID;
      this.dmSV.loadedFile = false;
      this.dmSV.folderId.next('');
      this.dmSV.loadedFolder = true;
     // this.changeDetectorRef.detectChanges();
      this.fileService.options.funcID = this.view.funcID;
      this.fileService
        .getListActiveFiles('', this.view.funcID)
        .subscribe(async (res) => {
          if (res != null) {
            this.data = [...this.data, ...res];
            this.dmSV.listFiles = res;
            this.dmSV.loadedFile = true;
            this.changeDetectorRef.detectChanges();
          }
        });        
    }
  //  this.changeDetectorRef.detectChanges();     
  }
}
