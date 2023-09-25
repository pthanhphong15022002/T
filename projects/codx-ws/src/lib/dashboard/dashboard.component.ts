import { Component } from '@angular/core';
import { WSUIComponent } from '../default/wsui.component';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends WSUIComponent{
  listDashboard:any;
  listDashboards:any;
  listGroupDashboard = [];
  selectedToolBar = "All"
  imgDefault = "assets/themes/ws/default/img/Dashboard_Empty.svg";
  
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
    this.listGroupDashboard.push(obj);
  }
  getModuleByUserID()
  {
    var module = this.codxWsService.loadModuleByUserID(this.userInfo?.userID) as any;
    if(isObservable(module))
    {
      module.subscribe((item:any)=>{
        if(item) {
          var listModule = item.join(";");
          this.getDashboardOrReport("D",listModule);
        }
      })
    }
    else
    {
      var listModule = module.join(";");
      this.getDashboardOrReport("D",listModule);
    }
  }
  getDashboardOrReport(type:any,listModule:any)
  {
    var result = this.codxWsService.loadDashboardOrReport(type,listModule) as any;
    if(isObservable(result))
    {
      result.subscribe((item:any)=>{
        if(item) {
          this.listDashboard = item;
          this.listDashboards = item;
          this.getModule(this.listDashboard)
        }
      })
    }
    else  {
      this.listDashboards = result;
      this.listDashboard = result;
      this.getModule(this.listDashboard)
    }
  }
  selectedChange(data:any)
  {
    this.codxService.navigate("","/ws/"+data.moduleID.toLowerCase()+"/dashboard/"+data.reportID);
    this.codxWsService.functionID = data.reportID;
    data.functionID = data.reportID;
    this.codxWsService.listBreadCumb.push(data);
  }

  getModule(data:any)
  {
    var listModule = data.map(function(item){return item.moduleID});
    listModule = this.removeDuplicates(listModule);
    this.getFuncListByModules(JSON.stringify(listModule))
  }

  getFuncListByModules(data:any)
  {
    var result = this.codxWsService.loadListFucByListModule(data) as any;
    if(isObservable(result))
    {
      result.subscribe((item:any)=>{
        if(item){this.formatData(item)}
      })
    }
    else this.formatData(result)
  }

  removeDuplicates(arr:any) {
    return [...new Set(arr)];
  }

  formatData(data:any)
  {
    this.listGroupDashboard = this.listGroupDashboard.concat(data);
  }

  selectedChangeToolBar(data:any)
  {
    this.selectedToolBar = data?.functionID;
    if(this.selectedToolBar == "All") this.listDashboard = this.listDashboards;
    else this.listDashboard = this.listDashboards.filter(x=>x.moduleID == this.selectedToolBar);
  }
}
