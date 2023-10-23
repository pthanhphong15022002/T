import { Component, AfterViewInit, Injector, ViewChildren, QueryList, ViewChild, TemplateRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CacheService, PageTitleService, UIComponent, ViewModel, ViewType } from "codx-core";
import { Browser } from '@syncfusion/ej2-base';
import { Subscription } from "rxjs";

@Component({
  selector: 'ep-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class EPDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChildren('template') templates: QueryList<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;


  panels:any = JSON.parse(
    '[{"header":"Thời gian sử dụng & số lượt đặt phòng","id":"0.4199281088325755_layout","row":0,"col":12,"sizeX":18,"sizeY":12,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"header":"Top nhân viên đặt phòng","id":"0.4592017601751599_layout","row":0,"col":30,"sizeX":18,"sizeY":12,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"header":"Tỉ lệ thời gian sử dụng phòng","id":"0.06496875406606994_layout","row":12,"col":12,"sizeX":36,"sizeY":15,"minSizeX":16,"minSizeY":12,"maxSizeX":null,"maxSizeY":null},{"header":"Thống kê số lượt đặt phòng","id":"0.21519762020962552_layout","row":0,"col":0,"sizeX":12,"sizeY":27,"minSizeX":8,"minSizeY":8,"maxSizeX":null,"maxSizeY":null}]'
  );
  datas:any = JSON.parse(
    '[{"panelId":"0.4199281088325755_layout","data":"5"},{"panelId":"0.4592017601751599_layout","data":"6"},{"panelId":"0.06496875406606994_layout","data":"8"},{"panelId":"0.21519762020962552_layout","data":"7"}]'
  );
  dataLabel: Object = {
    visible: true,
    position: 'Outside', name: 'resourceName',
    font: {
        fontWeight: '500'
    },
    connectorStyle: { length: '20px', type: 'Curve'},

  };
  circleMarker: Object = { visible: true, height: 7, width: 7 , shape: 'Circle' , isFilled: true };
  palettes:any=['#1BA3C6','#2CB5C0','#30BCAD','#21B087','#33A65C','#57A337','#57A337','#D5BB21','#F8B620','#F89217','#F06719','#E03426','#EB364A','#F64971','#FC719E','#EB73B3','#CE69BE','#A26DC2','#7873C0','#4F7CBA']
  tooltip: Object = { enable: true, shared: true };
  width: string = Browser.isDevice ? '100%' : '100%';
  height: string = Browser.isDevice ? '100%' : '60%';
  views: Array<ViewModel> = [];
  showHeader: boolean = true;
  isLoaded:boolean=false;
  userPermission:any;
  reportID:any;
  reportItem:any;
  arrReport:any=[];
  dataset:any=[];
  constructor(
    private injector: Injector,
    private cacheService: CacheService,
    private pageTitle: PageTitleService,
    private routerActive: ActivatedRoute,
  ){
    super(injector);
    this.router.params.subscribe((param) => {
      if (param) this.funcID = param['funcID'];
    });

    this.pageTitle.setBreadcrumbs([]);
  }

  override onInit(): void {
    this.cacheService.valueList('SYS062').subscribe((res) => {
      if (res.datas) {
        this.palettes=[];
        res.datas.map((x:any)=>{
          this.palettes.push(x.value);
          return x;
        })
      }
    });
  }
  ngAfterViewInit(): void {
    this.views = [

      {
        type: ViewType.content,
        active: true,
        sameData: false,
        reportType: 'D',
        reportView: true,
        showFilter: true,
        model: {
          panelLeftRef: this.panelLeftRef,
        },
      },
    ];
    this.userPermission = this.view.userPermission;
    //this.reloadAllChart();
    this.pageTitle.setBreadcrumbs([]);
    this.routerActive.params.subscribe((res) => {
      if (res.funcID) {
        this.funcID = res.funcID;
        this.isLoaded = false;
        this.reportID=res.funcID;
        if(this.arrReport && this.arrReport.length){
          let idx =this.arrReport.findIndex((x:any)=>x.recID==this.reportID);
          if(idx >-1){
            this.reportItem = this.arrReport[idx];
            this.getDataset();
          }

        }

      }
    });
    this.detectorRef.detectChanges();
  }

  objParams:any;
  filterChange(e:any){
    this.objParams = e[1];
    this.reportItem && this.getDataset();
  }


  statByRes:any=[];
  statByEmp:any=[];
  subscription:Subscription;
getDataset(params?:any){
    this.isLoaded = false;
    this.statByRes = [];
    if(params) this.objParams = params;
    else params = this.objParams
    this.subscription  && this.subscription.unsubscribe();
    this.subscription = this.api.execSv('rptep','Codx.RptBusiness.EP','BookingRoomsBusiness','GetDatasetAsync', params ? [params] : [{}])
                        .subscribe((res:any)=>{
                          if(res && res.length){
                            this.dataset = res;
                            let objRes = this.groupBy(this.dataset.filter((x:any)=>x.resourceID),"resourceID");
                            for(let key in objRes){
                              let obj:any={};
                              obj.resourceID = key;
                              obj.resourceName = objRes[key][0].resourceName;
                              obj.quantity = objRes[key].length;
                              obj.percentage = this.toFixed((obj.quantity/this.dataset.length)*100);
                              obj.usedHours = this.sumByProp(objRes[key],'hours');
                              obj.totalHours = objRes[key].length*8;
                              this.statByRes.push(obj);
                            }
                            let objEmp = this.groupBy(this.dataset,"createdBy");
                            for(let key in objEmp){
                              let obj:any={};
                              obj.userID = key,
                              obj.userName = objEmp[key][0].userName,
                              obj.positionName = objEmp[key][0].positionName,
                              obj.departmentName = objEmp[key][0].departmentName,
                              obj.quantity = objEmp[key].length;
                              obj.percentage = this.toFixed((obj.quantity/this.dataset.length)*100)
                              this.statByEmp.push(obj);
                            }
                            console.log(objEmp);

                            this.isLoaded = true;

                          }
                        })

   }

  onActions(e:any){
    if (e.type == 'reportLoaded') {
      this.arrReport = e.data;
      if (this.arrReport.length) {
        this.cache
              .functionList(e.data[0].moduleID+e.data[0].reportType)
              .subscribe((res: any) => {
                if (res) {
                  this.pageTitle.setRootNode(res.customName);
                  this.pageTitle.setParent({
                    title: res.customName,
                    path: res.url,
                  });
                  let arrChildren: any = [];
                  for (let i = 0; i < this.arrReport.length; i++) {
                    arrChildren.push({
                      title: this.arrReport[i].customName,
                      path: 'ep/dashboard/' + this.arrReport[i].recID,
                    });
                  }
                  if(!this.reportItem){
                    if(this.reportID){
                      let idx = this.arrReport.findIndex((x:any)=>x.recID==this.reportID);
                      if(idx>-1){
                        this.reportItem = this.arrReport[idx];
                        this.pageTitle.setSubTitle(arrChildren[idx].title);
                        this.pageTitle.setChildren(arrChildren);
                        //this.codxService.navigate('', arrChildren[idx].path);
                        this.funcID= this.reportItem.reportID;
                      }
                      else{
                        this.reportItem = this.arrReport[0];
                        this.pageTitle.setSubTitle(arrChildren[0].title);
                        this.pageTitle.setChildren(arrChildren);
                        this.codxService.navigate('', arrChildren[0].path);
                        this.funcID= this.arrReport[0].reportID;
                      }
                    }
                    else{
                      this.reportItem = this.arrReport[0];
                      this.pageTitle.setSubTitle(arrChildren[0].title);
                      this.pageTitle.setChildren(arrChildren);
                      this.codxService.navigate('', arrChildren[0].path);
                      this.funcID= this.arrReport[0].reportID;
                    }
                  }
                  else{
                    let idx = this.arrReport.findIndex((x:any)=>x.recID==this.reportItem.recID);
                    if(idx>-1){
                      this.pageTitle.setSubTitle(arrChildren[idx].title);
                      this.pageTitle.setChildren(arrChildren);
                      //this.codxService.navigate('', arrChildren[idx].path);
                      this.funcID= this.reportItem.reportID;
                    }
                  }

                  this.getDataset()
                  //this.isLoaded = true
                }
              });

      }
    }

  }


  toFixed(value: number) {
    if (!value || isNaN(value)) {
      return 0;
    }
    return value % 1 === 0 ? value : value.toFixed(2);
  }

  sortByProp(arr:any[],property:string,dir:string='asc',take:number=0){
    if(arr.length && property){
      if(dir == 'asc'){
        if(take){
          return JSON.parse(JSON.stringify(arr)).sort((a:any,b:any)=> a[property]-b[property]).slice(0,take)
        }
        return JSON.parse(JSON.stringify(arr)).sort((a:any,b:any)=> a[property]-b[property]);
      }
      else{
        if(take){
          return JSON.parse(JSON.stringify(arr)).sort((a:any,b:any)=> b[property]-a[property]).slice(0,take)
        }
        return JSON.parse(JSON.stringify(arr)).sort((a:any,b:any)=> b[property]-a[property]);
      }

    }
    return [];
  }

  private groupBy(arr: any, key: any) {
    return arr.reduce(function (r: any, a: any) {
      r[a[key]] = r[a[key]] || [];
      r[a[key]].push(a);
      return r;
    }, Object.create(null));
  }

  sumByProp(arr:any[],property:string){
    if(arr && arr.length){
      return arr.reduce((accumulator:any, object:any) => {
        return accumulator + object[property];
      }, 0);
    }
    return 0;
  }
}
