import { Component } from '@angular/core';
import { WSUIComponent } from '../default/wsui.component';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent extends WSUIComponent{
  listReport:any;
  listReports: any;
  listGroupReport = [];
  selectedToolBar = "All";
  imgDefault = "assets/themes/ws/default/img/Report_Empty.svg";
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
          this.listReport = item ;
          this.listReports = item; //this.formatData(item);
          this.formatData(this.listReport);
        }
      })
    }
    else {
      this.listReport = result; 
      this.listReports = result;
      this.formatData(this.listReport);
    } //this.formatData(result);
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
}
