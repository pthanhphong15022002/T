import { Component, AfterViewInit, Injector, ViewChildren, QueryList, ViewChild, TemplateRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CacheService, PageTitleService, UIComponent, ViewModel, ViewType } from "codx-core";
import { Browser } from '@syncfusion/ej2-base';

@Component({
  selector: 'ep-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class EPDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChildren('template') templates: QueryList<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;


  panels:any = JSON.parse(
    '[{"id":"0.4199281088325755_layout","row":0,"col":12,"sizeX":18,"sizeY":12,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"id":"0.4592017601751599_layout","row":0,"col":30,"sizeX":18,"sizeY":12,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"id":"0.06496875406606994_layout","row":12,"col":12,"sizeX":36,"sizeY":15,"minSizeX":16,"minSizeY":12,"maxSizeX":null,"maxSizeY":null},{"id":"0.21519762020962552_layout","row":0,"col":0,"sizeX":12,"sizeY":27,"minSizeX":8,"minSizeY":8,"maxSizeX":null,"maxSizeY":null}]'
  );
  datas:any = JSON.parse(
    '[{"panelId":"0.4199281088325755_layout","data":"5"},{"panelId":"0.4592017601751599_layout","data":"6"},{"panelId":"0.06496875406606994_layout","data":"8"},{"panelId":"0.21519762020962552_layout","data":"7"}]'
  );
  dataLabel: Object = {
    visible: true,
    position: 'Outside', name: 'behaviorName',
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
  isLoaded:boolean=true;
  userPermission:any;
  reportID:any;
  reportItem:any;
  arrReport:any=[];

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
        //this.isLoaded = false;
        this.reportID=res.funcID;
        if(this.arrReport && this.arrReport.length){
          let idx =this.arrReport.findIndex((x:any)=>x.recID==this.reportID);
          if(idx >-1){
            this.reportItem = this.arrReport[idx];

          }

        }

      }
    });
    this.detectorRef.detectChanges();
  }

  filterChange(e:any){

  }

  onActions(e:any){
    if (e.type == 'reportLoaded') {
      debugger
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

                  //this.reloadAllChart();
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
}
