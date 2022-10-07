import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, ViewEncapsulation, Injector, Renderer2 } from '@angular/core';
import { FileService } from '@shared/services/file.service';
import { FolderService } from '@shared/services/folder.service';
import { AuthService, DialogRef, ImageViewerComponent, LayoutService, SidebarModel, UserModel, LayoutBaseComponent, CallFuncService, CacheService, Util } from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { Observable } from 'rxjs';
import { CodxDMService } from '../codx-dm.service';
import { CreateFolderComponent } from '../createFolder/createFolder.component';

import { Browser } from '@syncfusion/ej2-base';
import { IAccPointRenderEventArgs } from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class LayoutComponent extends LayoutBaseComponent implements AfterViewInit {
  // Public variables
  override contentContainerClasses = '';
  override headerCSSClasses?: string;
  override headerHTMLAttributes: any = {};
  override headerLeft: string = 'menu';
  override asideDisplay: boolean = false;
  override asideCSSClasses?: string;
  disableInput = false;
  module = 'DM';
  dialog: DialogRef;
  percentUsed: any;
  itemHdd: any;
  submenu: string;
  msDM062:any;
  msDM063:any;
 // totalUsed: string;
  public titleAddFolder = 'Tạo thư mục';
  public titleStorage = 'Dung lượng lưu trữ';
  public titleHddUsed = 'Đã sử dụng 0MB trong tổng số 50.00 GB';
  public titleHddUsed_small = 0;
  public titleHddHdd_small = '100';
  public totalUsed_small = 95;
  public totalHdd_small = 95;
  showtitle = true;
  public mssgTotalUsed;
  public mssgTotalHdd;

  // @ViewChild('codxHeader', { static: true }) codxHeader!: ElementRef;
  // @ViewChild("imageViewer", { static: false }) imageViewer?: ImageViewerComponent;
  public funcs$: Observable<any>;


/*
db.DM_FolderInfo.updateMany(
   { FolderType: "4" },
   { $set: { FolderType: "DMT03" } },
   { collation: { locale: "fr", strength: 1 } }
);
 */
  //   constructor(
//     inject: Injector,
//     public cache: CacheService,
//     private callfc: CallFuncService,
//     private dmSV: CodxDMService) {
//     super(inject);
//     this.codxService.init(this.module);
//   }

public layoutColor: string;
  public cellSpacing: number[] = [15, 15];
  public cellAspectRatio: number = 0.8;
  

 

  constructor(
    private injector: Injector,
    public dmSV: CodxDMService,
    private folderService: FolderService,
    private fileService: FileService,
    private callfc:CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,    
    private renderer: Renderer2,
    private cache: CacheService
  ) {
    super(injector);
    this.codxService.init('DM');
    this.fileService.getTotalHdd().subscribe(item => {
      //  totalUsed: any;
      // totalHdd: any;
      this.getHDDInformaton(item);
      document.body.getElementsByClassName('btn-minimize')[0].addEventListener('click',(item));       
    })

    //  this.funcs$= this.codxService.getFuncs('OD');
  }
  



  onInit(): void {
    // build view by layout config settings
    this.asideDisplay = this.layout.getProp('aside.display') as boolean;
    this.asideCSSClasses = this.layout.getStringCSSClasses('aside');
    this.contentContainerClasses = this.layout.getStringCSSClasses('contentContainer');
    this.headerCSSClasses = this.layout.getStringCSSClasses('header');
    this.headerLeft = this.layout.getProp('header.left') as string;
    this.user = this.auth.userValue;
    this.dmSV.isMenuIdActive.subscribe(res => {
      this.submenu = res;
      this.changeDetectorRef.detectChanges();
    });

    
    // this.dmSV.isSetRight.subscribe(res => {      
    //   if (this.dmSV.parentCreate) {
    //     this.disableInput = false;
    //   }
    //   else
    //     this.disableInput = true;

    //   this.changeDetectorRef.detectChanges();
    // });

    this.dmSV.isDisableInput.subscribe(res => {    
      if (res != null) {
        this.disableInput = res;
        this.changeDetectorRef.detectChanges();
      }      
    });

    this.dmSV.isUpdateHDD.subscribe(item => {     
      this.getHDDInformaton(item);
      document.body.getElementsByClassName('btn-minimize')[0].addEventListener('click',(item));        
    });
   

  }

  setClassActive() {    
    //alert(this.submenu);
    var css = "btn btn-light-default btn-icon btn-md";    
    if (this.submenu != "") {
      //var no = parseInt(this.submenu);
      if (this.submenu == 'DMT01' || this.submenu == 'DMT08' || this.submenu == 'DMT02' || this.submenu == 'DMT03' || this.submenu == 'DMT04') 
        css = css + " disabled";        
    }      
   // console.log(css);
    return css;
  }

  onClick(id, title, subtitle, subid) {
    var breadcumb = [];
    breadcumb.push(title);
    breadcumb.push(subtitle);
    this.dmSV.idMenuActive = id;
    this.dmSV.breadcumb.next(breadcumb);
    this.dmSV.menuIdActive.next(id);
    this.dmSV.menuActive.next(title);
    this.dmSV.currentNode = '';
    this.dmSV.folderId.next(id); 

    this.folderService.options.funcID = id;
    this.folderService.options.favoriteID = subid;
    this.folderService.getFolders('').subscribe(async list => {
      if (list != null) {
        this.dmSV.listFolder = list[0];
        this.dmSV.ChangeData.next(true);
        this.changeDetectorRef.detectChanges();
      }     
    });

    this.fileService.options.funcID = id;
    this.fileService.options.favoriteID = subid;
    this.fileService.GetFiles("").subscribe(async list => {
      this.dmSV.listFiles = list[0];
      this.dmSV.ChangeData.next(true);
      this.changeDetectorRef.detectChanges();
    });
  }
  
  getHDDInformaton(item: any) {
    
    if (item != null) {
      
      

      this.itemHdd = item;
      this.percentUsed = 100 * (item.totalUsed / item.totalHdd);
      this.titleHddUsed_small  = this.percentUsed.toFixed(1);
       this.titleHddHdd_small = (100 * ((item.totalHdd - item.totalUsed) / item.totalHdd)).toFixed(1);
       /* this.totalUsed_small = item.totalUsed;
       this.totalHdd_small = item.totalHdd; */
      //this.percentUsed = this.percentUsed.toFixed(0);
      //console.log(this.percentUsed);
      this.titleHddUsed = item.messageHddUsed;
      this.changeDetectorRef.detectChanges();
      
      
      this.cache.message('DM062').subscribe((item1) => {
        if(item1 != null){
          this.msDM062 = item1;
          this.mssgTotalUsed = Util.stringFormat(item1.defaultName,this.titleHddUsed_small);
        }
        
      });
      this.cache.message('DM063').subscribe((item2) => {
        if(item2 != null){
          this.msDM063 = item2;
          this.mssgTotalHdd = Util.stringFormat(item2.defaultName,this.titleHddHdd_small);
        }
        
      });
      if(this.msDM062 != null && this.msDM063 != null){
var msUsed =  Util.stringFormat(this.msDM062.defaultName, this.titleHddUsed_small, "%");
      var msHdd =  Util.stringFormat(this.msDM063.defaultName, this.titleHddHdd_small, "%");

      this.data = [
        /* {  Product : msUsed, Percentage : this.titleHddUsed_small, TextMapping :msUsed},
        {  Product : msHdd, Percentage : this.titleHddUsed_small, TextMapping :msUsed} */
        { Product : msUsed, Percentage : this.titleHddUsed_small, TextMapping : msUsed},
        { Product : msHdd, Percentage : this.titleHddHdd_small, TextMapping : msHdd}
      ];
      }
      

      
    }
   
  }

  

   //Pie Chart
   
   public data: Object[] = [];
   /* dataManager: DataManager = new DataManager({
    url: 'https://ej2services.syncfusion.com/production/web-services/api/Orders',
  }); */

  public animation: Object = {
    enable: true
  };
  public border: Object = { width:3 };
  public pieTooltipSetting: Object = { enable: true, format: '${point.x}' };
  public palettes: string[] = ["#00bcd4", "#f5f9fa", "#FEC200"];
    
  public pielegendSettings: Object = {
    visible: false,
  };
  public dataLabel: Object = {
    visible: true,
    position: 'Inside',
    connectorStyle: { length: '5px', type:'Curve'}
  };
  


  

  getPercentClass() {
    if (this.itemHdd != null) {
      if (this.percentUsed >= 90)
        return "progress-bar bg-danger";
      else
        return "progress-bar";
    }
    else
      return "progress-bar";
  }

  onAfterViewInit(): void {
    if (this.codxHeader) {
      for (const key in this.headerHTMLAttributes) {
        if (this.headerHTMLAttributes.hasOwnProperty(key)) {
          this.codxHeader.nativeElement.attributes[key] =
            this.headerHTMLAttributes[key];
        }
      }
    }
document.body.getElementsByClassName('btn-minimize')[0].addEventListener('click',()=>{

  if(this.showtitle==false)
    {
      
    /* this.titleHddUsed_small = this.percentUsed ;
    this.changeDetectorRef.detectChanges(); */
    this.showtitle = true;
    }else{
      //debugger;
    /* this.titleHddUsed_small = this.percentUsed ;
    this.changeDetectorRef.detectChanges(); */
      this.showtitle = false;
      /* if (item != null) { */
        //this.itemHdd = item;
        
        //this.percentUsed = 100 * (item.totalUsed / item.totalHdd);
        //console.log(this.percentUsed);
        //this.titleHddUsed_small = 100 * (item.totalUsed / item.totalHdd);
        //this.titleHddUsed = item.messageHddUsed;
        
      //} 
    }
//console.log('abc123')
});
// bắt sự kiện class
    // this.renderer.listen('button.btn-minimize', 'click', (event) => {
    //   console.log(event);
    // });
  }

  disable() {
    return this.disableInput;
  }

  //   onAfterViewInit(): void {
//     this.cache.message("DM060").subscribe(item => {
//       if (item != null) {
//         this.titleAddFolder = item.description;
//       }
//     });

//     this.cache.message("DM061").subscribe(item => {
//       if (item != null) {
//         this.titleStorage = item.description;
//       }
//     });
//   }

  AddFolder() {
    //this.dmSV.openCreateFolder.next(true);
    let option = new SidebarModel();
    option.DataService = this.dmSV.dataService;
    option.FormModel = this.dmSV.formModel;
    option.Width = '550px';
    let data = {} as any;
    data.title = this.titleAddFolder;
    data.id =  null;
    data.type = "add";
    this.callfc.openSide(CreateFolderComponent, data, option);
  }

  // public reloadAvatar(data: any): void {
  //   this.imageViewer?.reloadImageWhenUpload();
  // }

  public contentResized(size: any) {
    // if(size){
    //   console.log(JSON.stringify(size));
    // }
  }

  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    this.dialog.closed.subscribe()
  }
  onJump() {
    var data = {} as any;
    data.recID = "";
    this.dmSV.refreshTree.next(true)
    this.dmSV.breadcumb.next([]);
    //isFolderId
    this.changeDetectorRef.detectChanges();
  }
  /* public funcs$: Observable<any> = of([
    {
      functionID: 'OD',
      customName: 'Quản lý công văn',
      separator: true
    },
    {
      functionID: 'ODT1',
      customName: 'Dashboard',
      smallIcon: 'assets/Icons_Final/P006_Hosonhanvien.svg',
      comingSoon: false,
      separator: false,
      childs: [],
      url:"/od/home"
    },
    {
      functionID: 'OTD2',
      customName: 'Báo cáo',
      smallIcon: 'assets/Icons_Final/C001_Mangxahoinoibo.svg',
      comingSoon: false,
      separator: false,
      childs: [],
      url:"/od/incomming/funcID=OD"
    },
    {
      functionID: '',
      customName: '',
      smallIcon: 'assets/Icons_Final/C001_Mangxahoinoibo.svg',
      comingSoon: false,
      separator: true,
    },
    {
      functionID: 'ODT3',
      customName: 'Công văn đến',
      smallIcon: 'assets/Icons_Final/C001_Mangxahoinoibo.svg',
      comingSoon: false,
      separator: false,
      childs: [],
      url:"/od/incomming"
    },
    {
      functionID: 'ODT4',
      customName: 'Công văn đi',
      smallIcon: 'assets/Icons_Final/C007_Tailieuso.svg',
      comingSoon: false,
      separator: false,
      url:"/od/subhome",
      childs: []
    },
    {
      functionID: 'ODT5',
      customName: 'Công văn nội bộ',
      smallIcon: 'assets/Icons_Final/C001_Mangxahoinoibo.svg',
      comingSoon: false,
      separator: false,
      childs: [],
      url:"/od/incomming"
    },
    {
      functionID: 'ODT6',
      customName: 'Tìm kiếm văn bản',
      smallIcon: 'assets/Icons_Final/C007_Tailieuso.svg',
      comingSoon: false,
      separator: false,
      url:"/od/subhome",
      childs: []
    }
  ]); */


  





}


// import { Component, OnInit, Injector } from '@angular/core';
// import {
//   CacheService,
//   CallFuncService,
//   DialogRef,
//   LayoutBaseComponent,
//   SidebarModel,
//   UIComponent,
//   ViewModel
// } from 'codx-core';
// import { Observable } from 'rxjs';
// import { CodxDMService } from '../codx-dm.service';
// import { CreateFolderComponent } from '../createFolder/createFolder.component';
// @Component({
//   selector: 'lib-layout',
//   templateUrl: './layout.component.html',
//   styleUrls: ['./layout.component.css']
// })
// export class LayoutComponent extends LayoutBaseComponent {
//   module = 'DM';
//   public titleAddFolder = 'Tạo thư mục';
//   public titleStorage = 'Dung lượng lưu trữ';
//   public titleHddUsed = 'Đã sử dụng 203.63MB trong tổng số 50.00 GB';
//   constructor(
//     inject: Injector,
//     public cache: CacheService,
//     private callfc: CallFuncService,
//     private dmSV: CodxDMService) {
//     super(inject);
//     this.codxService.init(this.module);
//   }

//   onInit(): void {
//     this.codxService.modulesOb$.subscribe(res => {
//       console.log(res);
//     })
    
//   }

//   onAfterViewInit(): void {
//     this.cache.message("DM060").subscribe(item => {
//       if (item != null) {
//         this.titleAddFolder = item.description;
//       }
//     });

//     this.cache.message("DM061").subscribe(item => {
//       if (item != null) {
//         this.titleStorage = item.description;
//       }
//     });
//   }

//   AddFolder() {
//     //this.dmSV.openCreateFolder.next(true);
//     let option = new SidebarModel();
//     option.DataService = this.dmSV.dataService;
//     option.FormModel = this.dmSV.formModel;
//     option.Width = '550px';
//     let data = {} as any;
//     data.title = this.titleAddFolder;
//     this.callfc.openSide(CreateFolderComponent, data, option);
//   }

// }
