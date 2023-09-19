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
        if(item) this.listDashboard = item;
      })
    }
    else  {
      this.listDashboard = result;
    }
  }
  selectedChange(data:any)
  {
    this.codxService.navigate("","/ws/"+data.moduleID.toLowerCase()+"/dashboard/"+data.reportID);
    this.codxWsService.functionID = data.reportID;
    data.functionID = data.reportID;
    this.codxWsService.listBreadCumb.push(data);
  }
}
