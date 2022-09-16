import { ViewEncapsulation } from '@angular/core';

import { catchError, finalize } from 'rxjs/operators';
import { Observable, map, of } from 'rxjs';
import { LayoutService, AuthService, ApiHttpService, CacheService } from 'codx-core';
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
  searchField = "";
  online: any;
  offline: any;

  @ViewChild("ktAside", { static: true }) ktAside: ElementRef;
  @ViewChild("ktHeaderMobile", { static: true }) ktHeaderMobile: ElementRef;
  @ViewChild("ktHeader", { static: true }) ktHeader: ElementRef;

  constructor(router: Router,
    private layout: LayoutService,
    private auth: AuthService,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    protected cache: CacheService,
    //private cbxsv: ComboboxpopupService,
    private codx_mwp_service: CodxMwpService,
  ) {
    this.cache.valueList('L1490').subscribe(res => {
      if (res) {
        this.online = res.datas[1];
        this.offline = res.datas[0];
      }
    });
  }

  dataSelcected: any = [];
  ngOnInit(): void {
    //var body = $("#kt_body");
    // if (body.length == 0) return;
    // if (body.hasClass("aside-minimize")) body.removeClass("aside-minimize");
    // console.log(this.auth.userValue);
    // this.cbxsv.loadSelected.subscribe((data: any) => {
    //   if (data) {
    //     this.dataSelcected = data;
    //     this.dt.detectChanges();
    //   }
    // });
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
    this.api
      .call("ERM.Business.HR", "EmployeesBusiness", "GetEmpUsers", [
        this.auth.userValue.userID,
      ])
      .subscribe((res) => {
        if (
          res &&
          res.msgBodyData.length > 0 &&
          res.msgBodyData[0] &&
          res.msgBodyData[0].employeeID
        ) {
          let id = res.msgBodyData[0].employeeID;
          this.employeeMyTeam = null;
          this.codx_mwp_service
            .LoadData(id, "3")
            .subscribe((response: any) => {
              if (response) {
                this.employeeMyTeam = [];
                this.listEmpInfo = []
                if (response.MyTeam) {
                  this.employeeMyTeam = response.MyTeam;
                  this.lstEmpID = this.employeeMyTeam[0].employeeID;
                  this.employeeMyTeam.forEach(element => {
                    this.lstEmpID += ";" + element.employeeID;
                    this.loadEmployInfo(element.employeeID)
                      .pipe()
                      .subscribe((response) => {
                        if (response != null) {
                          this.listEmpInfo.push(response.InfoPersonal)
                        }
                      });
                  });
                  console.log("check employeeMyTeam", this.employeeMyTeam)
                }
              }
            });
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

  // ItemClick(id, isList) {
  //   var chk = $('input[data-id="' + id + '"]');
  //   var datas = this.cbxsv.data;
  //   var item = datas.filter((x) => x.buid == id);
  //   if (chk.length > 0) {
  //     if (!chk[0].checked && item && item.length > 0 && isList) {
  //       chk.attr("checked", "checked");
  //       this.cbxsv.dataSelcected.push(item[0]);
  //     } else {
  //       chk.removeAttr("checked");
  //       const removeIndex = this.cbxsv.dataSelcected.findIndex(
  //         (x) => x.buid === id
  //       );
  //       // remove object
  //       this.cbxsv.dataSelcected.splice(removeIndex, 1);
  //       // this.cbxsv.dataSelcected.de(item[0]);
  //     }
  //   }
  //   this.cbxsv.appendData();
  //   this.dt.detectChanges();
  // }

  PopoverEmp(p: any, emp) {
    if (this.popoverList) {
      if (this.popoverList.isOpen())
        this.popoverList.close();
    }
    if (emp) {
      this.imployeeInfo = this.listEmpInfo.find(e => e.employeeID === emp.employeeID);
      p.open();
    }
    else {
      p.close();
      this.imployeeInfo = {}
    }
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

  PopoverEmpList(p: any, emp) {
    this.popoverList = p;
    if (emp) {
      p.open();
    }
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

}
