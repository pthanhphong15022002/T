import { Component } from '@angular/core';
import { WSUIComponent } from '../default/wsui.component';
import { isObservable } from 'rxjs';
import { BookmarkComponent } from '../bookmark/bookmark.component';

@Component({
  selector: 'lib-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends WSUIComponent{
  listModule:any;
  listDashboard = [];
  listDashboards = [];
  listBookMarks=[];
  listGroupDashboard = [];
  countBookMarks = 0;
  selectedToolBar = "All"
  imgDefault = "assets/themes/ws/default/img/Dashboard_Empty.svg";

  override onInit(): void {
    this.formatListGroupReport();
    this.getModuleByUserID();
    this.getCountBookMark();
  }

  getCountBookMark()
  {
    let widthBody = document.body.offsetWidth - 40;
    this.countBookMarks = Math.ceil(widthBody / 260);
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
          this.listModule = item.join(";");
          this.getDashboardOrReport("D",this.listModule);
        }
      })
    }
    else
    {
      this.listModule = module.join(";");
      this.getDashboardOrReport("D",this.listModule);
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
          this.listDashboard = results;
          this.listDashboards = JSON.parse(JSON.stringify(results));
          this.getModule(this.listDashboard)

        }
      })
    }
    else  {
      var results = this.formatBookMark(result);
      this.listDashboards = results;
      this.listDashboard = JSON.parse(JSON.stringify(results));;
      this.getModule(this.listDashboard)
    }
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

  selectedChange(data:any)
  {
    debugger
    this.codxService.navigate("","/ws/"+data.moduleID.toLowerCase()+"/dashboard/"+data.recID);
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
    if(this.selectedToolBar == "All") this.listDashboard = JSON.parse(JSON.stringify(this.listDashboards));
    else this.listDashboard = JSON.parse(JSON.stringify(this.listDashboards.filter(x=>x.moduleID == this.selectedToolBar)));
  }

  setBookMark(recID:any)
  {
    this.api.execSv("rptrp","Codx.RptBusiness.RP","ReportBusiness","BookmarkAsync",recID).subscribe(item=>{
      if(item)
      {
        var className = "opacity-100";
        var messCode = "OD002";
        var index = this.listDashboard.findIndex(x=>x.recID == recID);
        var index2 = this.listDashboards.findIndex(x=>x.recID == recID);
        if(index2 >= 0)  this.listDashboards[index2].isBookMark = !this.listDashboards[index2].isBookMark;
        if(index >= 0) {

          this.listDashboard[index].isBookMark = !this.listDashboard[index].isBookMark;

          if(!this.listDashboard[index].isBookMark)
          {
            className = "opacity-25";
            messCode = "OD003";
            this.listBookMarks = this.listBookMarks.filter(x=>x.recID != this.listDashboards[index].recID);
            if(this.listDashboards[index2].bookmarks &&  this.listDashboards[index2].bookmarks.length > 0)
            this.listDashboards[index2].bookmarks = this.listDashboards[index2].bookmarks.filter(x=>x.objectID != this.userInfo.userID);
          }
          else  {
            this.listBookMarks.unshift(this.listDashboard[index]);
            if(!this.listDashboards[index2].bookmarks) this.listDashboards[index2].bookmarks = [];
              this.listDashboards[index2].bookmarks.push({objectID:this.userInfo.userID});
          }

          //Bookmark report
          document.getElementById("ws-report-bookmark" + this.listDashboard[index].recID).classList.add(className);

          //Noti
          this.notifySvr.notifyCode(messCode,0,this.userInfo?.userName);

          //Update cache
          let paras = ["D",this.listModule];
          let keyRoot = "WSDR" + "D" + this.listModule;
          let key = JSON.stringify(paras).toLowerCase();
          this.codxWsService.updateCache(keyRoot,key,this.listDashboards);
        }
      }
    });
  }

  selectMoreBookmark()
  {
    this.callFunc.openForm(BookmarkComponent,"",900,700,"",{listGroup:this.listGroupDashboard,listBookMarks:this.listBookMarks,type:'D'});
  }
}
