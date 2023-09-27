import { Component, ViewChild } from '@angular/core';
import { WSUIComponent } from '../default/wsui.component';
import { isObservable } from 'rxjs';
import { FormModel } from 'codx-core';
import { CodxView2Component } from 'projects/codx-share/src/lib/components/codx-view2/codx-view2.component';

@Component({
  selector: 'lib-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent extends WSUIComponent{
  @ViewChild('codxView2') codxView2: CodxView2Component;

  listReport:any;
  listReports: any;
  listBookMarks = [];
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
          var results = this.formatBookMark(item);
          this.listReport = results;
          this.listReports = JSON.parse(JSON.stringify(results)) ; //this.formatData(item);
          this.formatData(this.listReport);
        }
      })
    }
    else {
      var results = this.formatBookMark(result);
      this.listReport = results; 
      this.listReports = JSON.parse(JSON.stringify(results));
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
        if(dt && dt.length > 0) {
          this.listBookMarks.push(element);
          element.isBookMark = true;
        }
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
        var className = "opacity-100";
        var messCode = "OD002";
        var index = this.listReport.findIndex(x=>x.recID == recID);
        if(index >= 0) {

          this.listReport[index].isBookMark = !this.listReport[index].isBookMark;
          this.listReports[index].isBookMark = !this.listReports[index].isBookMark;
          
          if(!this.listReport[index].isBookMark)
          {
            className = "opacity-25";
            messCode = "OD003";
            this.listBookMarks = this.listBookMarks.filter(x=>x.recID != this.listReport[index].recID);
            if(this.listBookMarks.length == 0) this.setHeight();
          }
          else  {
            this.listBookMarks.push(this.listReport[index]);
            if(this.listBookMarks.length == 1) this.setHeight();
          }

          //Bookmark report
          document.getElementById("ws-report-bookmark" + this.listReport[index].recID).classList.add(className);
          
          //Noti
          this.notifySvr.notifyCode(messCode,0,this.userInfo?.userName)
        }
      }
    });
  }
  setHeight()
  {
    var h = document.getElementById("view2-header").offsetHeight;
    if(h)
    {
      h += 90;
      let height = window.innerHeight - h;
      document.getElementById("codx-view2-body").style.cssText = "height:" +height+"px !important";
    }
    else
    {
      document.getElementById("codx-view2-body").removeAttribute("height");
    }
  }
}
