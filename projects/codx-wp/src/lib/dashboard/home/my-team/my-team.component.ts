import { ViewEncapsulation } from '@angular/core';

import { catchError, finalize } from 'rxjs/operators';
import { Observable, map, of } from 'rxjs';
import { LayoutService, AuthService, ApiHttpService, CacheService, AuthStore } from 'codx-core';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';

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
  eventPanelType:string;
  @ViewChild("ktAside", { static: true }) ktAside: ElementRef;
  @ViewChild("ktHeaderMobile", { static: true }) ktHeaderMobile: ElementRef;
  @ViewChild("ktHeader", { static: true }) ktHeader: ElementRef;
  lstEmp=[];

  constructor(router: Router,
    private layout: LayoutService,
    private auth: AuthService,
    private authStore: AuthStore,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    protected cache: CacheService,
    protected codxShareService: CodxShareService,
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
    this.codxShareService
      .getSettingValueWithOption('FTC', 'WPParameters',null,'1')
      .subscribe((res) => {
        if(res?.length>0){
          this.eventPanelType = JSON.parse(res[0]?.dataValue)?.EventPanelType ?? '0';          
        }
        if(this.eventPanelType =='1'){
          this.getBirthDayEmps();
        }
        else{
          this.getMyTeam();
        }
      });
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
  total:number = 0;
  lstMyTeam = [];
  scrolling:boolean = false;
  //get my team 
  getBirthDayEmps(){
    this.api
    .execSv("HR",
    "ERM.Business.HR",
    "EmployeesBusiness_Old",
    "LoadBirthDayEmpsAsync",
    [])
    .subscribe((res:any) => {
      if(res){
        this.lstEmp=res;
        this.dt.detectChanges();     
        if(this.lstEmp?.length>0)   {
          this.showSlides();
        }
      }
    });
  }
  getMyTeam(){
    this.api
    .execSv("HR",
    "ERM.Business.HR",
    "EmployeesBusiness_Old",
    "GetMyTeamAsync",
    [this.user.userID,this.pageIndex])
    .subscribe((res:any[]) => {
      if(res && res[0].length > 0)
      {
        if(this.pageIndex == 1)
        {
          this.total = res[1];
        }
        this.lstMyTeam.push(...res[0]);
        if(this.lstMyTeam.length < this.total){
          this.scrolling = true;
          this.pageIndex = this.pageIndex + 1;
        }
        else
          this.scrolling = false;
      }
      else
          this.scrolling = false;
      this.dt.detectChanges();
    });
  }
  // load data when scroll
  scroll(ele : HTMLDivElement){
    if(this.scrolling && ele.offsetHeight - ele.scrollHeight <= 50)
    {
      this.scrolling = false;
      this.getMyTeam();
    }
  }
  employeeSeletecd:any = null;
  PopoverEmp(p: any, item:any) {
    debugger
    this.employeeSeletecd = item;
    p.isOpen() ? p.open() : p.close();
  }

  loadEmployInfo(employeeID): Observable<any> {
    return this.api.call('ERM.Business.HR', 'EmployeesBusiness_Old', 'GetByUserAsync', [employeeID, "", "0"]).pipe(
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

  slideIndex = 0;
  slides:any;
  showSlides() {
    if(this.slides==null || this.slides?.length==0){
      this.slides = document.getElementsByClassName("mySlides") as HTMLCollectionOf<HTMLElement>;
    }
    let i;    
    if(this.slides?.length>0){
      for (i = 0; i < this.slides?.length; i++) {
        this.slides[i].style.display = "none";  
      }      
      if (this.slideIndex >= this.slides?.length) {this.slideIndex = 0}  
      if(this.slideIndex >=0 && this.slideIndex<this.slides?.length){
        this.slides[this.slideIndex].style.display = "block";  
      }      
      this.slideIndex++;
    }
    setTimeout(() => this.showSlides(), 5000);
  }
}
