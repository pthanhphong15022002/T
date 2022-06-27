import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AuthService, CacheService, CodxService, ImageViewerComponent, LayoutInitService, LayoutService, PageTitleService, UserModel } from 'codx-core';
import { Observable, of } from 'rxjs';

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
  asideDisplay: boolean=false;
  asideCSSClasses?: string;
  @ViewChild('codxHeader', { static: true }) codxHeader!: ElementRef;
  @ViewChild("imageViewer", { static: false }) imageViewer?: ImageViewerComponent;
  user: UserModel | null = null;

  public funcs$: Observable<any> ;

  constructor(
    private layout: LayoutService,
    private auth: AuthService,
    public codxService: CodxService,
  ) {
    this.codxService.init('OD');
    this.funcs$= this.codxService.getFuncs('OD');
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

  public reloadAvatar(data: any): void {
    this.imageViewer?.reloadImageWhenUpload();
  }

  public contentResized(size: any){
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
