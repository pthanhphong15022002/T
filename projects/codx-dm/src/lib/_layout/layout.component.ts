import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, ViewEncapsulation, HostListener, Renderer2 } from '@angular/core';
import { FileUpload } from '@shared/models/file.model';
import { FileService } from '@shared/services/file.service';
import { FolderService } from '@shared/services/folder.service';
import { AccumulationChartComponent, AccumulationTheme, IAccLoadedEventArgs, IAccPointRenderEventArgs, IAccTextRenderEventArgs } from '@syncfusion/ej2-angular-charts';
import { AuthService, CacheService, CallFuncService, CodxService, DialogRef, ImageViewerComponent, LayoutInitService, LayoutService, PageTitleService, SidebarModel, UserModel } from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { Observable, of } from 'rxjs';
import { CodxDMService } from '../codx-dm.service';
import { CreateFolderComponent } from '../createFolder/createFolder.component';

import { Browser } from '@syncfusion/ej2-base';

@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation:ViewEncapsulation.None
})

export class LayoutComponent implements OnInit, AfterViewInit {
  // Public variables
  contentContainerClasses = '';
  headerCSSClasses?: string;
  headerHTMLAttributes: any = {};
  headerLeft: string = 'menu';
  asideDisplay: boolean = false;
  asideCSSClasses?: string;
  disableInput = false;
  module = 'DM';
  dialog: DialogRef;
  percentUsed: any;
  itemHdd: any;
  submenu: string;
 // totalUsed: string;

  public titleAddFolder = 'Tạo thư mục';
  public titleStorage = 'Dung lượng lưu trữ';
  public titleHddUsed = 'Đã sử dụng 0MB trong tổng số 50.00 GB';
  public titleHddUsed_small = 0;
  public titleHddHdd_small = '100';
  public totalUsed_small = 95;
  public totalHdd_small = 95;
  showtitle = true;

  @ViewChild('codxHeader', { static: true }) codxHeader!: ElementRef;
  @ViewChild("imageViewer", { static: false }) imageViewer?: ImageViewerComponent;
  user: UserModel | null = null;

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
    private layout: LayoutService,
    private auth: AuthService,
    public codxService: CodxService,
    public cache: CacheService,
    private callfc: CallFuncService,
    public dmSV: CodxDMService,
    private folderService: FolderService,
    private fileService: FileService,
    private changeDetectorRef: ChangeDetectorRef,    
    private renderer: Renderer2
  ) {
    this.codxService.init('DM');
    this.fileService.getTotalHdd().subscribe(item => {
      //  totalUsed: any;
      // totalHdd: any;
      this.getHDDInformaton(item);
      document.body.getElementsByClassName('btn-minimize')[0].addEventListener('click',(item));       
    })

    //  this.funcs$= this.codxService.getFuncs('OD');
  }
  



  ngOnInit(): void {
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
      debugger;
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

      this.data = [
        { Product : "Đã dùng : "+this.titleHddUsed_small+"%", Percentage : this.titleHddUsed_small, TextMapping : "Đã dùng : "+this.titleHddUsed_small+"%"},
        { Product : "Trống : "+this.titleHddHdd_small+"%", Percentage : this.titleHddHdd_small, TextMapping : "Trống : "+this.titleHddHdd_small+"%"}
      ];
    }
   
  }

   //Pie Chart
   
   public data: Object[] = [
    { Product : "Đã dùng : "+this.titleHddUsed_small+"%", Percentage : this.titleHddUsed_small, TextMapping : "Đã dùng : "+this.titleHddUsed_small+"%"},
    { Product : "Trống : "+this.titleHddHdd_small+"%", Percentage : this.titleHddHdd_small, TextMapping : "Trống : "+this.titleHddHdd_small+"%"}
  ];

  public animation: Object = {
    enable: true
  };
  public border: Object = { width:3 };
  public pieTooltipSetting: Object = { enable: true, format: '${point.x}' };
  public palettes: string[] = ["#00bcd4", "#f5f9fa", "#FEC200", "#CA765A", "#2485FA", "#F57D7D", "#C152D2",
    "#8854D9", "#3D4EB8", "#00BCD7", "#4472c4", "#ed7d31", "#ffc000", "#70ad47", "#5b9bd5", "#c1c1c1", "#6f6fe2", "#e269ae", "#9e480e", "#997300"];
    
  public pielegendSettings: Object = {
    visible: false,
  };
  public dataLabel: Object = {
    visible: true,
    position: 'Inside',
    connectorStyle: { length: '5px', type:'Curve'}
  };
  
public pointRender(args: IAccPointRenderEventArgs): void {
  let selectedTheme: string = location.hash.split('/')[1];
  selectedTheme = selectedTheme ? selectedTheme : 'Material';
  if (selectedTheme.indexOf('dark') > -1 )
  {
    if(selectedTheme.indexOf('material') > -1 )
    {
      args.border.color = '#303030' ;
      this.layoutColor= '#303030' ;
    }
    else if(selectedTheme.indexOf('bootstrap5') > -1 )
    {
      args.border.color = '#343a40' ;
      this.layoutColor= '#343a40' ;
    }
    else if(selectedTheme.indexOf('bootstrap') > -1 )
    {
      args.border.color = '#1A1A1A' ;
      this.layoutColor= '#1A1A1A' ;
    }
    else if(selectedTheme.indexOf('tailwind') > -1 )
    {
      args.border.color = '#1F2937' ;
      this.layoutColor= '#1F2937' ;
    }
    else if(selectedTheme.indexOf('fluent') > -1 )
    {
      args.border.color = '#252423' ;
      this.layoutColor= '#252423' ;
    }
    else if(selectedTheme.indexOf('fabric') > -1 )
    {
      args.border.color = '#201f1f' ;
      this.layoutColor= '#201f1f' ;
    }
    else
    {
      args.border.color = '#222222' ;
      this.layoutColor= '#222222' ;
    }
  }
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

  ngAfterViewInit(): void {
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
    this.callfc.openSide(CreateFolderComponent, data, option);
  }

  public reloadAvatar(data: any): void {
    this.imageViewer?.reloadImageWhenUpload();
  }

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
