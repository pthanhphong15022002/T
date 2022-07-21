import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FileUpload } from '@shared/models/file.model';
import { AuthService, CacheService, CallFuncService, CodxService, ImageViewerComponent, LayoutInitService, LayoutService, PageTitleService, SidebarModel, UserModel } from 'codx-core';
import { Observable, of } from 'rxjs';
import { CodxDMService } from '../codx-dm.service';
import { CreateFolderComponent } from '../createFolder/createFolder.component';

@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, AfterViewInit {
  // Public variables
  contentContainerClasses = '';
  headerCSSClasses?: string;
  headerHTMLAttributes: any = {};
  headerLeft: string = 'menu';
  asideDisplay: boolean = false;
  asideCSSClasses?: string;
  module = 'DM';
  public titleAddFolder = 'Tạo thư mục';
  public titleStorage = 'Dung lượng lưu trữ';
  public titleHddUsed = 'Đã sử dụng 203.63MB trong tổng số 50.00 GB';

  @ViewChild('codxHeader', { static: true }) codxHeader!: ElementRef;
  @ViewChild("imageViewer", { static: false }) imageViewer?: ImageViewerComponent;
  user: UserModel | null = null;

  public funcs$: Observable<any>;

  //   constructor(
//     inject: Injector,
//     public cache: CacheService,
//     private callfc: CallFuncService,
//     private dmSV: CodxDMService) {
//     super(inject);
//     this.codxService.init(this.module);
//   }

  constructor(
    private layout: LayoutService,
    private auth: AuthService,
    public codxService: CodxService,
    public cache: CacheService,
    private callfc: CallFuncService,
    private dmSV: CodxDMService
  ) {
    this.codxService.init('DM');
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
