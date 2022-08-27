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
import { DialogAttachmentType, FileInfo, ItemInterval } from '@shared/models/file.model';
import { FolderService } from '@shared/services/folder.service';
import { FileService } from '@shared/services/file.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CreateFolderComponent } from '../createFolder/createFolder.component';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import { CommandColumnService } from '@syncfusion/ej2-angular-grids';
import { threadId } from 'worker_threads';

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
  sortColumn: string;
  sortDirection: string;
  //loadedFile: boolean;
  //loadedFolder: boolean;
  //page = 1;
  //totalPage = 1;
  user: any;
  dialog!: DialogRef;
  interval: ItemInterval[];
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
      this.folderService.options.srtColumns = this.sortColumn;
      this.folderService.options.srtDirections = this.sortDirection;
      this.fileService.options.funcID = this.view.funcID;
      this.fileService.options.page = this.dmSV.page;
      this.fileService
        .GetFiles(this.dmSV.folderID)
        .subscribe(async (res) => {
          if (res != null) {
            this.dmSV.listFiles =  [...this.dmSV.listFiles, ...res[0]];   
            
            this.data = [...this.dmSV.listFolder, ...this.dmSV.listFiles]; 
            this.dmSV.totalPage = parseInt(res[1]);    
          }
          this.dmSV.loadedFile = true;           
          this.changeDetectorRef.detectChanges();
        });    
    }    
    //console.log(event);
    // this.dataService.currentComponent = this.listView;
    // this.dataService.scrolling();
  }

  openItem(data: any) {
  //  alert(1);
  }

  onLoading($event): void {  
    this.views.forEach(item => {
      if (this.view.funcID === 'DMT02' || this.view.funcID === 'DMT03') {
        if (item.id === "1") {
          item.hide = false;
          if (item.text === "Card")
            item.active = true;
          else 
            item.active = false;
        }          
        else 
          item.hide = true;          
      }      
      else {
        //"DMT06"  "DMT07"
        if (item.id === "2") {
          if (this.view.funcID === 'DMT06' || this.view.funcID === 'DMT06')
          {
            if (item.text === "List") {
              item.active = true;
              item.hide = false;
            }              
            else  {
              item.active = false;
              item.hide = true;
            }              
          }
          else {
            item.hide = false;
            if (item.text === "Card")
              item.active = true;
            else 
              item.active = false;
          }            
        }          
        else 
          item.hide = true;  
      }
    });
    this.changeDetectorRef.detectChanges();
  }

  onInit(): void {
    this.user = this.auth.get();
    this.path = this.getPath();
    this.button = {
      id: 'btnUpload',
    };   

    this.dmSV.isDisableUpload.subscribe((res) => {
      if (res != null) {
        this.button.disabled = res;
        this.changeDetectorRef.detectChanges();
      }      
    });

    this.dmSV.isNodeSelect.subscribe(res => {
      if (res != null) {      
        var tree = this.codxview.currentView.currentComponent.treeView;        
        if (tree != null) 
        {
          if (res.recID != null)
            tree.getCurrentNode(res.recID);         
          else
            tree.getCurrentNode(res);        
        }          
      }
    });

    this.dmSV.isNodeDeleted.subscribe(res => {
      if (res != null) {
        var tree = this.codxview.currentView.currentComponent.treeView;
        if (tree != null)  
          tree.removeNodeTree(res)
        this._beginDrapDrop();
      }
    });

    this.dmSV.isNodeChange.subscribe(res => {
      if (res) {
        var tree = this.codxview.currentView.currentComponent.treeView;
        if (tree != null) 
          tree.setNodeTree(res);
        //  that.dmSV.folderId.next(res.recID);
      }
    });

    this.dmSV.isAddFolder.subscribe(res => {
      if (res != null) {
        var tree = this.codxview.currentView.currentComponent.treeView;
        if (tree != null)  
          tree.setNodeTree(res);
        this.changeDetectorRef.detectChanges();
      };
      this._beginDrapDrop();
    });

    this.dmSV.isSetThumbnailWait.subscribe(item => {
      if (item != null) {
        this.displayThumbnail(item.recID, item.pathDisk);
      }
    });

    // this.dmSV.isFolderId.subscribe(res => {
    //   if (res != null) {      
    //     var tree = this.codxview.currentView.currentComponent.treeView;        
    //     if (tree != null) 
    //       tree.getCurrentNode(res);        
    //   }
    // });

    this.dmSV.isChangeData.subscribe((item) => {
      if (item) {
        this.data = [];
        this.changeDetectorRef.detectChanges();  
        if (this.dmSV.listFiles != null)    
          this.data = [...this.dmSV.listFolder, ...this.dmSV.listFiles];
        else 
          this.data = this.dmSV.listFolder;
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

  classFile(item, className) {
    if (item.folderName != null)
      return className;
    else  
      return `${className} noDrop`;  
  }

  _beginDrapDrop() {
    var that = this;
    setTimeout(() => {   
      var root =  document.getElementsByClassName("menu-nav");
      if (root != null && root.length > 0) {
        for (let index = 0; index < root[0].getElementsByClassName("menu-item").length; index++) {
          that.initDrapDropFileFolder(root[0].getElementsByClassName("menu-item")[index]);          
        }
      }
    }, 1000);
  }

  initDrapDropFileFolder(element) {
    var that = this;
    if (element && !element.getAttribute("_drapdrop")) {     
      element.setAttribute("_drapdrop", "1");
      var ondragstart = function (event) {
        var j = JSON.stringify(
          {
            "folderName": element.innerText,
            "recID": element.querySelector("a").classList[0] 
          });      
        event.originalEvent.dataTransfer.setData('data', j);
        event.originalEvent.dataTransfer["simple"] = "filefolder";
        event.originalEvent.dataTransfer.effectAllowed = "move";
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
        var s = event.originalEvent.dataTransfer.getData("data");
        if (s) {
          var obj = JSON.parse(s);
          if (obj.recID != element.querySelector("a").classList[0]) {
            if (obj.fileName) {
              that.dmSV.copyFileTo(obj.recID, obj.fileName, element.querySelector("a").classList[0]);
            }
            else {
              that.dmSV.copyFolderTo(obj.recID, obj.folderName, element.querySelector("a").classList[0]);
            }
          }
        }
      };
      
      element.removeEventListener("ondragstart", ondragstart);
      element.removeEventListener("ondragover", ondragover);
      element.removeEventListener("ondragleave", ondragleave);
      element.removeEventListener("ondrop", ondrop);
      element.addEventListener("ondragstart", ondragstart);
      element.addEventListener("ondragover", ondragover);
      element.addEventListener("ondragleave", ondragleave);
      element.addEventListener("ondrop", ondrop);
    }
  }

  fileFolderDropped($event) {
    if ($event.source.recID != $event.target.recID) {
      if ($event.source.fileName) {
        this.dmSV.copyFileTo($event.source.recID, $event.source.fileName, $event.target.recID);
      }
      else {
        this.dmSV.copyFolderTo($event.source.recID, $event.source.folderName, $event.target.recID);
      }
    }
  }

  fileUploadDropped($event) { 
    if (this.dmSV.idMenuActive == "DMT02" || this.dmSV.idMenuActive == "DMT03") {   
      this.attachment.fileUploadList = [];   
      this.attachment.handleFileInput($event, true).then(r => {
        this.attachment.onMultiFileSave();
      });      
    }
  }

  addFile($event) {  
    var data = new DialogAttachmentType();
    data.type = 'popup';
    // data.objectType = 'WP_Notes';
    // data.objectId = '628c326c590addf224627f42';
    // data.functionID = 'ODT3';

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

  saveFile1() {
    this.attachment1.saveFilesObservable().subscribe((item) => {
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
    if ($data == null || $data.data == null) {
      return;
    }

    let id = $data.data.recID;
    let item = $data.data;
    if (item.read) {
      var breadcumb = [];
      var breadcumbLink = [];
      if (this.codxview.currentView.currentComponent?.treeView != null) {
        this.codxview.currentView.currentComponent.treeView.textField = "folderName";
        var list = this.codxview.currentView.currentComponent.treeView.getBreadCumb(id);
        breadcumb.push(this.dmSV.menuActive.getValue());
        breadcumbLink.push(this.dmSV.idMenuActive);
        for (var i = list.length - 1; i >= 0; i--) {
          breadcumb.push(list[i].text);
          breadcumbLink.push(list[i].id);
        }
        this.dmSV.breadcumbLink = breadcumbLink;
        this.dmSV.breadcumb.next(breadcumb);   
      }
        
      this.dmSV.folderName = item.folderName;
      this.dmSV.parentFolderId = item.parentId;
      this.dmSV.level = item.level;    
      this.dmSV.getRight(item);      
      this.dmSV.loadedFile = false;  
      this.dmSV.loadedFolder = false;           
      this.data = [];
      this.dmSV.folderId.next(id);      
      this.dmSV.folderID = id;
      var items = item.items;      
      this.dmSV.listFolder = [];
      this.dmSV.listFiles = [];
      if (items == undefined || items.length <= 0) {        
        this.folderService.options.srtColumns = this.sortColumn;
        this.folderService.options.srtDirections = this.sortDirection;
        this.folderService.options.funcID = this.view.funcID;
        this.folderService.getFolders(id).subscribe(async (res) => {          
          if (res != null) {            
            var data = res[0];            
            this.listFolders = data;
            this.data = [...this.data, ...data];
            this.dmSV.listFolder = data;
            var tree = this.codxview.currentView.currentComponent.treeView;
            item.items = [];
            if (tree != undefined) 
             tree.addChildNodes(item, data);
            this.changeDetectorRef.detectChanges();   
            this._beginDrapDrop();         
          }
          this.dmSV.loadedFolder = true;  
        });
      } else {        
        this.data = [...this.data, ...item.items];
        this.dmSV.listFolder = item.items;
        this.dmSV.loadedFolder = true;          
        this.changeDetectorRef.detectChanges();        
      }
      this.folderService.options.srtColumns = this.sortColumn;
      this.folderService.options.srtDirections = this.sortDirection;
      this.fileService.options.funcID = this.view.funcID;
      this.fileService.GetFiles(id).subscribe(async res => {   
        this.dmSV.listFiles = res[0]; 
        if (this.sortDirection == null || this.sortDirection == "asc") 
        {
          this.data = [...this.dmSV.listFolder, ...res[0]];
        }        
        else 
          this.data = [...this.dmSV.listFiles,  ...this.dmSV.listFolder];
        this.dmSV.totalPage = parseInt(res[1]);    
        this.dmSV.loadedFile = true;   
        this.changeDetectorRef.detectChanges();    
      });
    } else {
      if (item.read != null) 
        this.notificationsService.notify(this.titleAccessDenied);
      if (this.view.funcID != 'DMT02' && this.view.funcID != 'DMT03')  {
        this.dmSV.disableInput.next(true);      
        this.dmSV.disableUpload.next(true);        
      }        
      else  {
        this.dmSV.disableInput.next(false);    
        this.dmSV.disableUpload.next(false);          
      }        
    }    
  }

  loading() {

  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        icon: 'icon-appstore',
        text: 'Card',
        type:  ViewType.treedetail,
        active: true,
        sameData: true,
      /*  toolbarTemplate: this.templateSearch,*/
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
        type:  ViewType.treedetail,
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
        type:  ViewType.treedetail,
        sameData: true,
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          template2: this.templateList,
          resizable: true,
        },
      },{
        id: '2',
        icon: 'icon-appstore',
        text: 'Card',
        hide:true,
        type: ViewType.content,
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
        id: '2',
        icon: 'icon-apps',
        text: 'Small Card',
        type: ViewType.content,
        sameData: true,
        hide:true,
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          template2: this.templateSmallCard,
          resizable: true,
        },
      },
      {
        id: '2',
        icon: 'icon-format_list_bulleted',
        text: 'List',
        type: ViewType.content,
        sameData: true,
        hide:true,
        model: {
          template: this.templateMain,
          panelRightRef: this.templateRight,
          template2: this.templateList,
          resizable: true,
        },
      },
    ];
    this.codxview.dataService.parentIdField = 'parentId';
    this.dmSV.formModel = this.view.formModel;
    this.dmSV.dataService = this.view?.currentView?.dataService;
    this.changeDetectorRef.detectChanges();
 //   console.log(this.button);
  }

  changeView(event) {
    this.currView = null;
    this.currView = event.view.model.template2; 
  //  this.data = [];    
  //  this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    //   this.atSV.openForm.unsubscribe();
    if (this.interval?.length > 0) {
      this.interval.forEach((element) => {
        clearInterval(element.instant);
      });
    }
  }

  displayThumbnail(id, pathDisk) {
    var that = this;
    if (this.interval == null) this.interval = [];
    var files = this.dmSV.listFiles;
    var index = setInterval(() => {
      that.fileService.getThumbnail(id, pathDisk).subscribe((item) => {
        if (item != null && item != '') {
          let index = files.findIndex((d) => d.recID.toString() === id);
          if (index != -1) {
            files[index].thumbnail = item;
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
   this.dmSV.loadedFile = false;  
   this.dmSV.loadedFolder = false;  
   this.folderService.options.srtColumns = this.sortColumn;
   this.folderService.options.srtDirections = this.sortDirection;
   this.fileService.options.funcID = this.view.funcID;
   this.data = [];
   if (this.dmSV.folderID != "") {
    this.folderService.getFolders(this.dmSV.folderID).subscribe(async (res) => {          
      if (res != null) {            
        var data = res[0];                   
        this.dmSV.listFolder = data;
        this.dmSV.loadedFolder = true;         
      }
    });
   }

   this.fileService.options.page = this.dmSV.page;
   this.fileService
     .GetFiles(this.dmSV.folderID)
     .subscribe(async (res) => {
       if (res != null) {
        this.dmSV.listFiles = res[0];           
        if (this.sortDirection == null || this.sortDirection == "asc") 
        {
        //  this.data = [...this.dmSV.listFolder, ...res[0]];
          if (res[0] != null)
            this.data = [...this.dmSV.listFolder, ...res[0]];
          else 
            this.data = this.dmSV.listFolder;
        }        
        else 
          this.data = [...this.dmSV.listFiles,  ...this.dmSV.listFolder];
        this.dmSV.totalPage = parseInt(res[1]);
       }
       this.dmSV.loadedFile = true;           
       this.changeDetectorRef.detectChanges();
     });      
 //  console.log($event);
  }

  searchChange($event) { 
    var text = '';
    this.data = [];
    this.dmSV.loadedFolder = true;
    this.dmSV.loadedFile = false;
    if (this.codxview.currentView.currentComponent.treeView != null)
      this.codxview.currentView.viewModel.model.panelLeftHide = true;
   // this.codxview.codxview.
    this.dmSV.page = 1;
    this.fileService.options.page = this.dmSV.page;
    this.fileService.searchFile(text, 1, 100).subscribe(item => {
      if (item != null) {
        this.dmSV.loadedFile = true;
        this.dmSV.listFiles = item.data;
        this.data = [...this.data, ...this.dmSV.listFiles];
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  requestEnded(e: any) {
    if(e.type === "read"){     
      this.data = [];    
      this.dmSV.listFolder = []; 
      this.dmSV.listFiles = [];      
      // npm i ngx-infinite-scroll@10.0.0
      this.changeDetectorRef.detectChanges();
      this.folderService.options.funcID = this.view.funcID;
      if (this.dmSV.idMenuActive != this.view.funcID) {
        if (e.data != null) {
          this.data = [...this.data, ...e.data];
          this.dmSV.listFolder = e.data;
        }
        else 
          this.dmSV.listFolder = [];  
        
        this.dmSV.loadedFolder = true;       
      }

      if (this.view.funcID != 'DMT02' && this.view.funcID != 'DMT03') {
        this.dmSV.deniedRight();
        this.dmSV.disableInput.next(true);
        this.dmSV.disableUpload.next(true);        
      }
      else {
        this.codxview.currentView.viewModel.model.panelLeftHide = false;
        this.dmSV.parentApproval = false;
        this.dmSV.parentPhysical = false;
        this.dmSV.parentCopyrights = false;
        this.dmSV.parentApprovers = "";
        this.dmSV.parentRevisionNote = "";
        this.dmSV.parentLocation = "";
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
        this.dmSV.disableUpload.next(false);        
      }

      this.changeDetectorRef.detectChanges();     
      this._beginDrapDrop();        
      this.dmSV.idMenuActive = this.view.funcID;     
      this.dmSV.folderId.next('');
      this.dmSV.folderID = "";
      this.dmSV.loadedFolder = true;      
      this.dmSV.menuIdActive.next(this.view.funcID);
      this.dmSV.idMenuActive = this.view.funcID;;
      var breadcumb = [];      
      breadcumb.push(this.view.function.customName);
      this.dmSV.menuActive.next(this.view.function.customName);
      this.dmSV.breadcumb.next(breadcumb);    
      this.fileService.options.funcID = this.view.funcID;
      this.dmSV.listFiles = [];
      this.dmSV.loadedFile = false;  
     // this.data = [];
      this.changeDetectorRef.detectChanges();
      this.folderService.options.srtColumns = this.sortColumn;
      this.folderService.options.srtDirections = this.sortDirection;
      this.fileService.options.funcID = this.view.funcID;
      this.fileService.options.page = this.dmSV.page;
      this.fileService
        .GetFiles('')
        .subscribe(async (res) => {
          // if (res != null) {
          //   this.data = [...this.data, ...res[0]];
          //   this.dmSV.listFiles = res[0];       
          //   this.dmSV.totalPage = parseInt(res[1]);    
          // }
          this.dmSV.listFiles = res[0]; 
          if (this.sortDirection == null || this.sortDirection == "asc") 
          {
            if (res[0] != null)
              this.data = [...this.dmSV.listFolder, ...res[0]];
            else 
              this.data = this.dmSV.listFolder;
          }        
          else 
            this.data = [...this.dmSV.listFiles,  ...this.dmSV.listFolder];
          this.dmSV.totalPage = parseInt(res[1]);

          this.dmSV.loadedFile = true;           
          this.changeDetectorRef.detectChanges();
        });          
    }    
  }
}
