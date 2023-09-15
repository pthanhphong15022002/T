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

  override onInit(): void {
    this.getModuleByUserID();
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
        if(item) this.formatData(item);
      })
    }
    else this.formatData(result);
  }

  getFuncListByModules(data:any)
  {
    var result = this.codxWsService.loadListFucByListModule(data) as any;
    if(isObservable(result))
    {
      result.subscribe((item:any)=>{
        if(item) this.groupData(item);
      })
    }
    else this.groupData(result);
  }

  groupData(data)
  {
    data.forEach(element => {
      element.childs = this.listReport.filter(x=>x.moduleID == element?.functionID);
    });
    this.listReport = data;
  }

  formatData(data:any)
  {
    this.listReport = data;
    var listModule = data.map(function(item){return item.moduleID});
    listModule = this.removeDuplicates(listModule);
    this.getFuncListByModules(JSON.stringify(listModule))
  }

  removeDuplicates(arr:any) {
    return [...new Set(arr)];
  }

  selectedChange(data:any)
  {
    debugger
    this.codxService.navigate("","/ws/report/detail/"+data.recID);
    this.codxWsService.functionID = data.reportID;
    data.functionID = data.reportID;
    this.codxWsService.listBreadCumb.push(data);
  }
}
