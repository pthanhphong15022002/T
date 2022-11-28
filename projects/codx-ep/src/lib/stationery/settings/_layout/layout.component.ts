import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AuthService, CodxService, ImageViewerComponent, LayoutInitService, LayoutService, UserModel } from 'codx-core';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, AfterViewInit {
  // Public variables
  contentContainerClasses = '';
  headerCSSClasses: string;
  headerHTMLAttributes: any = {};
  toolbarButtonMarginClass = 'ms-1 ms-lg-3';
  toolbarButtonHeightClass = 'w-30px h-30px w-md-40px h-md-40px';
  toolbarUserAvatarHeightClass = 'symbol-30px symbol-md-40px';
  toolbarButtonIconSizeClass = 'svg-icon-1';
  headerLeft: string = 'menu';
  asideDisplay: boolean;
  asideCSSClasses: string;
  @ViewChild('codxHeader', { static: true }) codxHeader: ElementRef;
  @ViewChild("imageViewer", { static: false }) imageViewer?: ImageViewerComponent;
  user: UserModel | null = null;

  constructor(
    private initService: LayoutInitService,
    private layout: LayoutService,
    private auth: AuthService,
    public codxService: CodxService
  ) {
    this.layout.initConfig();
    var cfg = this.layout.getConfig();
    cfg.aside.display = true;
    cfg.aside.fixed = false;
    cfg.aside.theme = 'light';
    cfg.toolbar.display = true;
    cfg.pageTitle.breadCrumbs = false;

    this.initService.init();
  }

  ngOnInit(): void {
    // build view by layout config settings
    this.asideDisplay = this.layout.getProp('aside.display') as boolean;
    this.asideCSSClasses = this.layout.getStringCSSClasses('aside');
    this.contentContainerClasses = this.layout.getStringCSSClasses('contentContainer');
    this.headerCSSClasses = this.layout.getStringCSSClasses('header');
    this.layout.getProp;
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

  public contentResized(size: any) {
    // if(size){
    //   console.log(JSON.stringify(size));
    // }
  }

  public funcs$: Observable<any> = of([
    {
      functionID: 'HR001',
      customName: 'Sơ đồ tổ chức',
      smallIcon: 'assets/Icons_Final/HR001_Orgchart.svg',
      comingSoon: false,
      separator: false,
      childs: []
    }, {
      functionID: 'HR003',
      customName: 'Danh bạ nhân viên',
      smallIcon: 'assets/Icons_Final/P006_Hosonhanvien.svg',
      comingSoon: false,
      separator: false,
      childs: []
    }, {
      functionID: 'WPT02',
      customName: 'Tin tức - Sự kiện',
      smallIcon: 'assets/Icons_Final/C001_Mangxahoinoibo.svg',
      comingSoon: true,
      separator: false,
      childs: []
    }, {
      functionID: 'DM',
      customName: 'Quản lý tài liệu',
      smallIcon: 'assets/Icons_Final/C007_Tailieuso.svg',
      comingSoon: false,
      separator: false,
      childs: []
    }, {
      functionID: '-',
      customName: 'Dịch vụ nhân viên',
      separator: true
    }, {
      functionID: 'POR004',
      customName: 'Hồ sơ nhân viên',
      smallIcon: 'assets/Icons_Final/P_People.svg',
      comingSoon: false,
      separator: false,
      childs: []
    }, {
      functionID: 'HR1',
      customName: 'Dịch vụ nhân sự',
      smallIcon: 'assets/Icons_Final/P015_Phanhoi360o.svg',
      comingSoon: true,
      separator: false,
      childs: [{
        functionID: 'HR11',
        customName: 'Dịch vụ nhân sự 1',
        smallIcon: 'assets/Icons_Final/P015_Phanhoi360o.svg',
        comingSoon: true,
        separator: false,
        childs: []
      }, {
        functionID: 'HR12',
        customName: 'Dịch vụ nhân sự 2',
        smallIcon: 'assets/Icons_Final/P015_Phanhoi360o.svg',
        comingSoon: true,
        separator: false,
        childs: []
      }]
    }, {
      functionID: 'FED201',
      customName: 'Ví nhân viên',
      smallIcon: 'assets/Icons_Final/P014_Vithuongnhanvien.svg',
      comingSoon: false,
      separator: false,
      childs: []
    }, {
      functionID: 'POR007',
      customName: 'Lịch nhân viên',
      smallIcon: 'assets/Icons_Final/CM005_Quanlysukien.svg',
      comingSoon: false,
      separator: false,
      childs: []
    }, {
      functionID: '-',
      customName: 'Ứng dụng',
      separator: true
    },
  ]);
}
