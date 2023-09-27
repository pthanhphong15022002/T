import { Component } from '@angular/core';
import { WSUIComponent } from '../default/wsui.component';
import { isObservable } from 'rxjs';
import { FormModel } from 'codx-core';

@Component({
  selector: 'lib-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent extends WSUIComponent{
  listReport:any;
  listReports: any;
  listGroupReport = [];
  selectedToolBar = "All";
  imgDefault = "assets/themes/ws/default/img/Report_Empty.svg";
  dataModel = new FormModel();

  override onInit(): void {
    this.formatListGroupReport();
    this.getModuleByUserID();
  }
  
  formatListGroupReport()
  {
    var obj = 
    {
      functionID : "All",
      customName : "Tất cả"
    }
    this.listGroupReport.push(obj);
  }

  getModuleByUserID()
  {
    var module = this.codxWsService.loadModuleByUserID(this.userInfo?.userID) as any;
    if(isObservable(module))
    {
      module.subscribe((item:any)=>{
        if(item) {
          var listModule = item.join(";");
          this.getDashboardOrReport("R",listModule);
        }
      })
    }
    else
    {
      var listModule = module.join(";");
      this.getDashboardOrReport("R",listModule);
    }
  }

  getDashboardOrReport(type:any,listModule:any)
  {
    var result = this.codxWsService.loadDashboardOrReport(type,listModule) as any;
    if(isObservable(result))
    {
      result.subscribe((item:any)=>{
        if(item) {
          this.listReport = this.formatBookMark(item);
          this.listReports = this.listReport ; //this.formatData(item);
          this.formatData(this.listReport);
        }
      })
    }
    else {
      this.listReport = this.formatBookMark(result); 
      this.listReports = this.listReport;
      this.formatData(this.listReport);
    } //this.formatData(result);
  }

  formatBookMark(data:any)
  {
    data.forEach(element => {
      element.isBookMark = false;
      if(element.bookmarks && element.bookmarks.length > 0)
      {
        var dt = element.bookmarks.filter(x=>x.objectID == this.userInfo?.userID);
        if(dt && dt.length > 0) element.isBookMark = true;
      }
    });
    
    return data
  }

  getFuncListByModules(data:any)
  {
    var result = this.codxWsService.loadListFucByListModule(data) as any;
    if(isObservable(result))
    {
      result.subscribe((item:any)=>{
        if(item) {
          this.formatData2(item);
        }
      })
    }
    else this.formatData2(result);
  }

  formatData(data:any)
  {
    var listModule = data.map(function(item){return item.moduleID});
    listModule = this.removeDuplicates(listModule);
    this.getFuncListByModules(JSON.stringify(listModule))
  }

  formatData2(data:any)
  {
    this.listGroupReport = this.listGroupReport.concat(data);
  }

  removeDuplicates(arr:any) {
    return [...new Set(arr)];
  }

  selectedChange(data:any)
  {
    this.codxService.navigate("","/ws/report/detail/"+data.recID);
    this.codxWsService.functionID = data.reportID;
    data.functionID = data.reportID;
    this.codxWsService.listBreadCumb.push(data);
  }

  selectedChangeToolBar(data:any)
  {
    this.selectedToolBar = data?.functionID;
    if(this.selectedToolBar == "All") this.listReport = this.listReports;
    else this.listReport = this.listReports.filter(x=>x.moduleID == this.selectedToolBar);
  }

  setBookMark(recID:any)
  {
    this.api.execSv("rptrp","Codx.RptBusiness.RP","ReportBusiness","BookmarkAsync",recID).subscribe(item=>{
      if(item)
      {
        debugger
        var index = this.listReport.findIndex(x=>x.recID == recID);
        if(index >= 0) {
          this.listReport[index].isBookMark = !this.listReport[index].isBookMark;
          this.listReports[index].isBookMark = !this.listReports[index].isBookMark;
          document.getElementById("ws-report-bookmark" + this.listReport[index].recID).style.visibility = this.listReports[index].isBookMark ? "visible" : "hidden";
        }
      }
    });
  }
}
