import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  ViewChild,
} from '@angular/core';
import { WSUIComponent } from 'projects/codx-ws/src/lib/default/wsui.component';
import { CodxView2Component } from '../codx-view2/codx-view2.component';
import { CacheService, FormModel, Util } from 'codx-core';
import { isObservable } from 'rxjs';
import { BookmarkComponent } from 'projects/codx-ws/src/lib/bookmark/bookmark.component';
import { CodxShareService } from '../../codx-share.service';

@Component({
  selector: 'codx-share-report',
  templateUrl: './codx-share-report.component.html',
  styleUrls: ['./codx-share-report.component.scss'],
})
export class CodxShareReportComponent
  extends WSUIComponent
  implements AfterViewInit
{
  @ViewChild('codxView2') codxView2?: CodxView2Component;

  @Input() listModule: any;
  @Input() isToolBar: any = true;

  viewID = '1';
  listReport: any;
  listReports: any;
  listBookMarks = [];
  listGroupReport = [];
  countBookMarks = 0;
  selectedToolBar = 'All';
  imgDefault = 'assets/themes/ws/default/img/Report_Empty.svg';
  dataModel = new FormModel();
  shareService: CodxShareService;
  constructor(inject: Injector, private cache: CacheService) {
    super(inject);
    this.shareService = inject.get(CodxShareService);
  }

  override onInit(): void {
    this.formatListGroupReport();
    this.getModuleByUserID();
    this.getCountBookMark();
    if (this.listModule) this.getDashboardOrReport('R', this.listModule);
  }

  ngAfterViewInit(): void {
    // this.setCSS();
  }

  getCountBookMark() {
    let widthBody = document.body.offsetWidth - 40;
    this.countBookMarks = Math.ceil(widthBody / 260);
  }

  // setCSS() {
  //   var elems = document.querySelectorAll('.header-fixed');

  //   [].forEach.call(elems, function (el) {
  //     el.classList.remove('toolbar-fixed');
  //   });
  // }

  formatListGroupReport() {
    var obj = {
      functionID: 'All',
      customName: 'Tất cả',
    };
    this.listGroupReport.push(obj);
  }

  getModuleByUserID() {
    if (this.listModule) return;
    var module = this.codxWsService.loadModuleByUserID(
      this.userInfo?.userID
    ) as any;
    if (isObservable(module)) {
      module.subscribe((item: any) => {
        if (item) {
          this.listModule = item.join(';');
          this.getDashboardOrReport('R', this.listModule);
        }
      });
    } else {
      this.listModule = module.join(';');
      this.getDashboardOrReport('R', this.listModule);
    }
  }

  getDashboardOrReport(type: any, listModule: any) {
    var result = this.codxWsService.loadDashboardOrReport(
      type,
      listModule.toUpperCase()
    ) as any;
    if (isObservable(result)) {
      result.subscribe((item: any) => {
        if (item) {
          var results = this.formatBookMark(item);
          this.listReport = results;
          this.listReports = JSON.parse(JSON.stringify(results)); //this.formatData(item);
          this.formatData(this.listReport);
        }
      });
    } else {
      var results = this.formatBookMark(result);
      this.listReport = results;
      this.listReports = JSON.parse(JSON.stringify(results));
      this.formatData(this.listReport);
    } //this.formatData(result);
  }

  formatBookMark(data: any) {
    data.forEach((element) => {
      element.isBookMark = false;
      if (element.bookmarks && element.bookmarks.length > 0) {
        var dt = element.bookmarks.filter(
          (x) => x.objectID == this.userInfo?.userID
        );
        if (dt && dt.length > 0) {
          this.listBookMarks.push(element);
          element.isBookMark = true;
        }
      }
    });

    return data;
  }

  getFuncListByModules(data: any) {
    var result = this.codxWsService.loadListFucByListModule(data) as any;
    if (isObservable(result)) {
      result.subscribe((item: any) => {
        if (item) {
          this.formatData2(item);
        }
      });
    } else this.formatData2(result);
  }

  formatData(data: any) {
    if (this.funcID.includes('WS')) {
      var listModule = data.map(function (item) {
        return item.moduleID;
      });
      listModule = this.removeDuplicates(listModule);
      this.getFuncListByModules(JSON.stringify(listModule));
    } else {
      let vll = this.shareService.loadValueList('RP001') as any;

      if (isObservable(vll)) {
        vll.subscribe((item: any) => {
          this.formatVll(data, item.datas);
        });
      } else this.formatVll(data, vll.datas);
    }
  }

  formatVll(data: any, vll: any) {
    var listCategory = [];
    data.forEach((elm) => {
      var text = vll.filter((x) => x.value == elm.category);
      if (text.length > 0) {
        var name = text[0].text;
        if (!listCategory.some((x) => x.customName == name)) {
          listCategory.push({
            functionID: elm.category,
            customName: name,
          });
        }
      }
    });
    this.formatData2(listCategory);
  }

  formatData2(data: any) {
    this.listGroupReport = this.listGroupReport.concat(data);
  }

  removeDuplicates(arr: any) {
    return [...new Set(arr)];
  }

  selectedChange(data: any) {
    this.codxService.navigate(
      '',
      '/' + data.moduleID.toLowerCase() + '/report/detail/' + data.recID
    );
    this.codxWsService.functionID = data.reportID;
    data.functionID = data.reportID;
    this.codxWsService.listBreadCumb.push(data);
  }

  selectedChangeToolBar(data: any) {
    this.selectedToolBar = data?.functionID;
    if (this.selectedToolBar == 'All')
      this.listReport = JSON.parse(JSON.stringify(this.listReports));
    else if (this.funcID.includes('WS'))
      this.listReport = JSON.parse(
        JSON.stringify(
          this.listReports.filter((x) => x.moduleID == this.selectedToolBar)
        )
      );
    else
      this.listReport = JSON.parse(
        JSON.stringify(
          this.listReports.filter((x) => x.category == this.selectedToolBar)
        )
      );
  }

  setBookMark(recID: any) {
    this.api
      .execSv(
        'rptrp',
        'Codx.RptBusiness.RP',
        'ReportBusiness',
        'BookmarkAsync',
        recID
      )
      .subscribe((item) => {
        if (item) {
          var className = 'opacity-100';
          var messCode = 'OD002';
          var index = this.listReport.findIndex((x) => x.recID == recID);
          var index2 = this.listReports.findIndex((x) => x.recID == recID);
          if (index2 >= 0)
            this.listReports[index2].isBookMark =
              !this.listReports[index2].isBookMark;
          if (index >= 0) {
            this.listReport[index].isBookMark =
              !this.listReport[index].isBookMark;

            if (!this.listReport[index].isBookMark) {
              className = 'opacity-25';
              messCode = 'OD003';
              this.listBookMarks = this.listBookMarks.filter(
                (x) => x.recID != this.listReport[index].recID
              );
              if (
                this.listReports[index2].bookmarks &&
                this.listReports[index2].bookmarks.length > 0
              )
                this.listReports[index2].bookmarks = this.listReports[
                  index2
                ].bookmarks.filter((x) => x.objectID != this.userInfo.userID);
            } else {
              this.listBookMarks.unshift(this.listReport[index]);
              if (!this.listReports[index2].bookmarks)
                this.listReports[index2].bookmarks = [];
              this.listReports[index2].bookmarks.push({
                objectID: this.userInfo.userID,
              });
            }

            //Bookmark report
            document
              .getElementById(
                'ws-report-bookmark' + this.listReport[index].recID
              )
              .classList.add(className);

            //Noti
            this.notifySvr.notifyCode(messCode, 0, this.userInfo?.userName);

            //Update cache
            let paras = ['R', this.listModule];
            let keyRoot = 'WSDR' + 'R' + this.listModule;
            let key = JSON.stringify(paras).toLowerCase();
            this.codxWsService.updateCache(keyRoot, key, this.listReports);
          }
        }
      });
  }

  selectMoreBookmark() {
    this.callFunc.openForm(BookmarkComponent, '', 900, 700, '', {
      listGroup: this.listGroupReport,
      listBookMarks: this.listBookMarks,
      type: 'R',
    });
  }

  viewChange(e: any) {
    this.viewID = e;
  }
}
