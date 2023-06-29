import { ViewEncapsulation } from '@angular/core';

import { catchError, finalize } from 'rxjs/operators';
import { Observable, map, of } from 'rxjs';
import { LayoutService, AuthService, ApiHttpService, CacheService, AuthStore } from 'codx-core';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.component.html',
  styleUrls: ['./my-team.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MyTeamComponent implements OnInit {

  selfLayout: any;
  asideSelfDisplay: any;
  asideMenuStatic: any;
  contentClasses = "";
  contentContainerClasses = "";
  subheaderDisplay: any;
  contentExtended: any;
  asideCSSClasses: string;
  asideHTMLAttributes: any = {};
  headerMobileClasses = "";
  headerMobileAttributes = {};
  footerDisplay: any;
  footerCSSClasses: string;
  headerCSSClasses: string;
  headerHTMLAttributes: any = {};
  employeeMyTeam: any = null;
  lstEmpID: string = "";
  imployeeInfo: any = {};
  popoverList: any;
  popoverEmp: any;
  listEmpInfo = [];
  searchText = "";
  online: any;
  offline: any;
  user:any = null;
  @ViewChild("ktAside", { static: true }) ktAside: ElementRef;
  @ViewChild("ktHeaderMobile", { static: true }) ktHeaderMobile: ElementRef;
  @ViewChild("ktHeader", { static: true }) ktHeader: ElementRef;

  constructor(router: Router,
    private layout: LayoutService,
    private auth: AuthService,
    private authStore: AuthStore,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    protected cache: CacheService,
    //private cbxsv: ComboboxpopupService,
    private codx_mwp_service: CodxMwpService,
  ) 
  {
    this.user = authStore.get();
  }

  dataSelcected: any = [];
  ngOnInit(): void {
    this.cache.valueList('L1490').subscribe(res => {
      if (res) {
        this.online = res.datas[1];
        this.offline = res.datas[0];
      }
    });
    this.selfLayout = this.layout.getProp("self.layout");
    this.asideSelfDisplay = this.layout.getProp("aside.self.display");
    this.asideMenuStatic = this.layout.getProp("aside.menu.static");
    this.subheaderDisplay = this.layout.getProp("subheader.display");
    this.contentClasses = this.layout.getStringCSSClasses("content");
    this.contentContainerClasses =
      this.layout.getStringCSSClasses("content_container");
    this.contentExtended = this.layout.getProp("content.extended");
    this.asideHTMLAttributes = this.layout.getHTMLAttributes("aside");
    this.asideCSSClasses = this.layout.getStringCSSClasses("aside");
    this.headerMobileClasses = this.layout.getStringCSSClasses("header_mobile");
    this.headerMobileAttributes =
      this.layout.getHTMLAttributes("header_mobile");
    this.footerDisplay = this.layout.getProp("footer.display");
    this.footerCSSClasses = this.layout.getStringCSSClasses("footer");
    this.headerCSSClasses = this.layout.getStringCSSClasses("header");
    this.headerHTMLAttributes = this.layout.getHTMLAttributes("header");
    this.getMyTeam();
  }

  ngAfterViewInit(): void {
    if (this.ktAside) {
      for (const key in this.asideHTMLAttributes) {
        if (this.asideHTMLAttributes.hasOwnProperty(key)) {
          this.ktAside.nativeElement.attributes[key] =
            this.asideHTMLAttributes[key];
        }
      }
    }

    if (this.ktHeaderMobile) {
      for (const key in this.headerMobileAttributes) {
        if (this.headerMobileAttributes.hasOwnProperty(key)) {
          this.ktHeaderMobile.nativeElement.attributes[key] =
            this.headerMobileAttributes[key];
        }
      }
    }

    if (this.ktHeader) {
      for (const key in this.headerHTMLAttributes) {
        if (this.headerHTMLAttributes.hasOwnProperty(key)) {
          this.ktHeader.nativeElement.attributes[key] =
            this.headerHTMLAttributes[key];
        }
      }
    }
    // Init Content
    //KTLayoutContent.init("kt_content");
  }


  pageIndex:number = 1;
  lstMyTeam:any[] = [];
  myTeams:any = [];
  //get my team 
  getMyTeam(){
    debugger
    if(this.user)
    {
      this.api
      .execSv("HR",
      "ERM.Business.HR",
      "EmployeesBusiness",
      "GetMyTeamAsync",
      [this.user.userID,this.pageIndex])
      .subscribe((res:any[]) => {
        if(res)
        {
          if(this.pageIndex == 1)
          {
            this.myTeams = res[0];
          }
          this.lstMyTeam.push(res[0]);
          if(this.lstMyTeam.length < res[1])
              this.pageIndex = this.pageIndex + 1;
        }
        this.dt.detectChanges();
      });
    }
    
  }
  // load data when scroll
  scrolling($event){
    debugger
  }
  employeeSeletecd:any = null;
  PopoverEmp(p: any, item:any) {
    debugger
    this.employeeSeletecd = item;
    p.isOpen() ? p.open() : p.close();
  }

  loadEmployInfo(employeeID): Observable<any> {
    return this.api.call('ERM.Business.HR', 'EmployeesBusiness', 'GetByUserAsync', [employeeID, "", "0"]).pipe(
      map((data) => {
        if (data.error) return;
        return data.msgBodyData[0];
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => null)
    );
  }


  //hover open list myteam
  PopoverEmpList(p: any) {
    p.open();
  }

  PopoverEmpOfList(p: any, emp) {
    if (emp) {
      this.imployeeInfo = this.listEmpInfo.find(e => e.employeeID === emp.employeeID);
      p.open();
    }
    else {
      p.close();
      this.imployeeInfo = {}
    }
  }


  valueChange(value:any){
    debugger
    this.searchText = value.data;
  }
}
