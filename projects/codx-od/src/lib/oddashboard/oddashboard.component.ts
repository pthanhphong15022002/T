import {
  Component,
  AfterViewInit,
  Injector,
  Input,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CacheService,
  PageTitleService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { OD_DispatchDashBoard } from './models/OD_DispatchDashBoard';
import { AccumulationChartComponent } from '@syncfusion/ej2-angular-charts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'oddashboard',
  templateUrl: './oddashboard.component.html',
  styleUrls: ['./oddashboard.component.scss'],
})
export class ODDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChildren('od_dashboard') templates1: QueryList<any>;
  @ViewChild('pie1') pie1: AccumulationChartComponent;
  @Input() panels: any;
  @Input() datas: any;
  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  override funcID = 'ODD';
  reportID: string = 'ODD001';
  arrReport: any = [];
  isEditMode = false;
  isLoaded = false;
  dataset: OD_DispatchDashBoard[] = [];

  data3 = [
    { moduleName: 'Quản lý công việc', percentage: 50 },
    { moduleName: 'Công văn', percentage: 25 },
    { moduleName: 'Trình ký', percentage: 15 },
    { moduleName: 'Khác', percentage: 10 },
  ];
  primaryYAxis: Object = {
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    majorGridLines: { width: 1 },
    minorGridLines: { width: 1 },
    minorTickLines: { width: 0 },
};
primaryXAxis: Object = {
  majorGridLines: { width: 0 },
  minorGridLines: { width: 0 },
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 },
  interval: 1,
  lineStyle: { width: 0 },
  valueType: 'Category'
};
palettes:any=['#1BA3C6','#2CB5C0','#30BCAD','#21B087','#33A65C','#57A337','#57A337','#D5BB21','#F8B620','#F89217','#F06719','#E03426','#EB364A','#F64971','#FC719E','#EB73B3','#CE69BE','#A26DC2','#7873C0','#4F7CBA']
  constructor(
    inject: Injector,
    private pageTitle: PageTitleService,
    private routerActive: ActivatedRoute,
    private cacheService: CacheService,
  ) {
    super(inject);
    this.reportID = this.router.snapshot.params['funcID'];
  }

  onInit() {
    this.panels = JSON.parse(
      '[{"id":"0.6040886186158714_layout","row":0,"col":0,"sizeX":12,"sizeY":6,"minSizeX":12,"minSizeY":6,"maxSizeX":null,"maxSizeY":null},{"id":"0.9388300157966656_layout","row":0,"col":12,"sizeX":12,"sizeY":12,"minSizeX":12,"minSizeY":12,"maxSizeX":null,"maxSizeY":null, "header":"Tình hình thực hiện công văn đến"},{"id":"0.6750473923075015_layout","row":0,"col":24,"sizeX":12,"sizeY":12,"minSizeX":12,"minSizeY":12,"maxSizeX":null,"maxSizeY":null, "header":"Công văn theo phân loại"},{"id":"0.6740612302375084_layout","row":0,"col":36,"sizeX":12,"sizeY":12,"minSizeX":12,"minSizeY":12,"maxSizeX":null,"maxSizeY":null, "header": "Công văn gửi/nhận theo nguồn"},{"id":"0.9809454927792045_layout","row":6,"col":0,"sizeX":12,"sizeY":6,"minSizeX":12,"minSizeY":6,"maxSizeX":null,"maxSizeY":null},{"id":"0.5374926060585523_layout","row":12,"col":0,"sizeX":12,"sizeY":12,"minSizeX":12,"minSizeY":12,"maxSizeX":null,"maxSizeY":null, "header":"Top đơn vị bên ngoài gửi/nhận công văn"},{"id":"0.29608212645829535_layout","row":12,"col":12,"sizeX":36,"sizeY":12,"minSizeX":36,"minSizeY":12,"maxSizeX":null,"maxSizeY":null, "header":"Thống kê công văn theo bộ phận"}]'
    );
    this.datas = JSON.parse(
      '[{"panelId":"0.6040886186158714_layout","data":"1"},{"panelId":"0.9388300157966656_layout","data":"2"},{"panelId":"0.6750473923075015_layout","data":"3"},{"panelId":"0.6740612302375084_layout","data":"4"},{"panelId":"0.9809454927792045_layout","data":"5"},{"panelId":"0.5374926060585523_layout","data":"6"},{"panelId":"0.29608212645829535_layout","data":"7"}]'
    );
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

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        reportType: 'D',
        reportView: true,
        showFilter: true,

        model: {
          panelRightRef: this.template,
        },
      },
    ];
    this.pageTitle.setBreadcrumbs([]);
    this.routerActive.params.subscribe((res) => {
      if (res.funcID) {
        this.reportID = res.funcID;
        this.isLoaded = false;
        let reportItem: any = this.arrReport.find(
          (x: any) => x.recID == res.funcID
        );
        if (reportItem) {
          let pinnedParams = reportItem.parameters?.filter((x: any) => x.isPin);
          if (pinnedParams) this.view.pinedReportParams = pinnedParams;
          this.funcID = reportItem.reportID
          if(!reportItem.parameters){
            this.getDashboardData();
          }
        }

      }
    });
    this.detectorRef.detectChanges();
  }

  filterChange(e) {
    this.isLoaded = false;
    const param = e[1];

    this.getDashboardData(param)

    this.detectorRef.detectChanges();
  }

  subscription:Subscription;
  onActions(e) {
    if (e.type == 'reportLoaded') {
      let pattern =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

        if(this.arrReport.length > 1 && !this.reportID.match(pattern)){
          this.codxService.navigate('',`${this.view.function?.module ? this.view.function?.module.toLocaleLowerCase() : 'ep'}/dashboard-view/${this.reportID}`);
          return;
        }
      this.arrReport = e.data;
      if (this.arrReport.length) {
        let arrChildren: any = [];
        for (let i = 0; i < this.arrReport.length; i++) {
          arrChildren.push({
            title: this.arrReport[i].customName,
            path: 'od/dashboard/' + this.arrReport[i].recID,
          });
        }
        if(this.reportID){
          let idx = this.arrReport.findIndex((x:any)=>x.recID==this.reportID);
          if(idx>-1){
            this.pageTitle.setSubTitle(arrChildren[idx].title);
            this.pageTitle.setChildren(arrChildren);
            //this.codxService.navigate('', arrChildren[idx].path);
            this.funcID = this.arrReport[idx].reportID;
          }
          else{
            this.pageTitle.setSubTitle(arrChildren[0].title);
            this.pageTitle.setChildren(arrChildren);
            this.codxService.navigate('', arrChildren[0].path);
            this.funcID = this.arrReport[0].reportID;
          }
        }
        else{
          this.pageTitle.setSubTitle(arrChildren[0].title);
          this.pageTitle.setChildren(arrChildren);
          this.codxService.navigate('', arrChildren[0].path);
          this.funcID = this.arrReport[0].reportID;
        }
        if (this.funcID === 'ODD001') {
          this.subscription && this.subscription.unsubscribe();
         this.subscription = this.api
            .execSv(
              'rptod',
              'Codx.RptBusiness.OD',
              'DispatchDataSetBusiness',
              'GetReportSourceAsync',
              []
            )
            .subscribe((res: OD_DispatchDashBoard[]) => {
              this.dataset = res;

              setTimeout(() => {
                this.isLoaded = true;
              }, 500);
            });
        }
      }
    }
    this.isLoaded = false;
  }

  newGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  toFixed(value: number) {
    return value % 1 === 0 ? value : value.toFixed(2);
  }

  groupByStatus(field: string) {
    const lstField = [...new Set(this.dataset.map((item) => item[field]))];

    let result = [];

    for (let i = 0; i < lstField.length; i++) {
      let quantity = this.dataset.filter((data: OD_DispatchDashBoard) => {
        return data[field] === lstField[i];
      }).length;

      result.push({
        statusName: lstField[i],
        quantity: quantity,
      });
    }

    console.log(result);

    return result;
  }

  groupByOrgUnit(field: string = 'orgUnitName', type: string) {
    const lstField = [...new Set(this.dataset.map((item) => item[field]))];

    let result = [];

    for (let i = 0; i < lstField.length; i++) {
      let quantity = this.dataset.filter((data: OD_DispatchDashBoard) => {
        return data[field] === lstField[i] && data['dispatchType'] === type;
      }).length;

      result.push({
        orgUnitName: lstField[i],
        quantity: quantity,
      });
    }

    console.log(result);

    return result;
  }

  getDispatchsByType(type: string) {
    return this.dataset.filter((data: OD_DispatchDashBoard) => {
      return data.dispatchType === type;
    }).length;
  }

  getUrgencyDispatch(status: string = '') {
    return this.dataset.filter((data: OD_DispatchDashBoard) => {
      if (status === '3') {
        return (
          (data.urgency === '5' || data.urgency === '7') && data.status === '3'
        );
      } else {
        return (
          (data.urgency === '5' || data.urgency === '7') && data.status !== '3'
        );
      }
    }).length;
  }

  statBySource:any=[];
  statByCategory:any=[];
  statByAgency:any=[];
  statByDept:any=[];
  getDashboardData(parameters?:any){
    this.isLoaded=false;
    this.statBySource = [];
    this.statByCategory = [];
    this.statByAgency = [];
    this.subscription && this.subscription.unsubscribe();
    this.subscription =this.api
       .execSv(
         'rptod',
         'Codx.RptBusiness.OD',
         'DispatchDataSetBusiness',
         'GetReportSourceAsync',
         [parameters ? parameters : {}]
       )
       .subscribe((res: OD_DispatchDashBoard[]) => {
         this.dataset = res;
         if(this.dataset.length){
          let objSource = this.groupBy(this.dataset,'source');
            for(let key in objSource){
              let obj:any={};
              obj.source=key == 'null' ? 'Khác' : key;
              obj.sourceName = objSource[key][0].sourceName ? objSource[key][0].sourceName : 'Khác';
              obj.quantity = objSource[key].length;
              obj.outgoing = objSource[key].filter((x:any)=>x.dispatchType=='2').length;
              obj.incoming = objSource[key].filter((x:any)=>x.dispatchType=='1').length;
              obj.internal = objSource[key].filter((x:any)=>x.dispatchType=='3').length;
              this.statBySource.push(obj);
            }
            let objCategory = this.groupBy(this.dataset,'categoryID');
            for(let key in objCategory){
              let obj:any={};
              obj.category=key;
              obj.categoryName = objCategory[key][0].categoryName;
              obj.quantity = objCategory[key].length;
              obj.percentage = this.toFixed((obj.quantity/this.dataset.length)*100)
              this.statByCategory.push(obj);
            }
            let objAgency = this.groupBy(this.dataset.filter((x:any)=>x.agencyID),'agencyID')
            for(let key in objAgency){
              let obj:any={};
              obj.agencyID = key;
              obj.agencyName = objAgency[key][0].agencyName;
              obj.quantity = objAgency[key].length;
              obj.incoming = objAgency[key].filter((x:any)=>x.dispatchType == '1').length;
              obj.outgoing = objAgency[key].filter((x:any)=>x.dispatchType == '2').length;
              obj.incomingPercentage = this.toFixed((obj.incoming/this.dataset.filter((x:any)=> x.agencyID && x.dispatchType=='1').length)*200)
              obj.outgoingPercentage = this.toFixed((obj.outgoing/this.dataset.filter((x:any)=> x.agencyID && x.dispatchType=='2').length)*200)
              this.statByAgency.push(obj);
            }
            let objDept= this.groupBy(this.dataset.filter((x:any)=>x.departmentID),'departmentID');
            for(let key in objDept){
              let obj:any={};
              obj.departmentID = key;
              obj.departmentName = objDept[key][0].departmentName;
              obj.quantity = objDept[key].length;
              obj.incoming = objDept[key].filter((x:any)=>x.dispatchType == '1').length;
              obj.outgoing = objDept[key].filter((x:any)=>x.dispatchType == '2').length;

              this.statByDept.push(obj);
            }

          }
         setTimeout(() => {
           this.isLoaded = true;
         }, 500);
       });
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

  activeTab:string='Incoming'
  onAgencyDispathChange(ele:any,obj:any){
    if(ele.id == this.activeTab) return;
    this.activeTab = ele.id;
    if(ele.id == 'Incoming'){
      obj.objIn.eleIn.classList.contains('d-none') && obj.objIn.eleIn.classList.remove('d-none') ;
      !obj.objOut.eleOut.classList.contains('d-none') && obj.objOut.eleOut.classList.add('d-none') ;
    }
    if(ele.id == 'Outgoing'){
      !obj.objIn.eleIn.classList.contains('d-none') && obj.objIn.eleIn.classList.add('d-none');
      obj.objOut.eleOut.classList.contains('d-none') && obj.objOut.eleOut.classList.remove('d-none');
    }
  }

}
