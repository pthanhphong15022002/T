import {
  AfterViewInit,
  Injector,
  Input,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CacheService,
  PageTitleService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { Subscription } from 'rxjs';

export class GridModels {
  pageSize: number;
  entityName: string;
  entityPermission: string;
  formName: string;
  gridViewName: string;
  funcID: string;
  dataValues: string;
  predicates: string;
}

@Component({
  selector: 'dmdashboard',
  templateUrl: './dmdashboard.component.html',
  styleUrls: ['./dmdashboard.component.scss'],
})
export class DMDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChildren('my_dashboard') templates1: QueryList<any>;
  @Input() panels1: any;
  @Input() datas1: any;
  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  reportID: string = 'DMD001';
  arrReport: any = [];
  dbData;
  isLoaded = false;
  isEditMode = false;
  palettes:any=['#1BA3C6','#2CB5C0','#30BCAD','#21B087','#33A65C','#57A337','#57A337','#D5BB21','#F8B620','#F89217','#F06719','#E03426','#EB364A','#F64971','#FC719E','#EB73B3','#CE69BE','#A26DC2','#7873C0','#4F7CBA']
  public chartData: Object[] = [
    { orgUnitID: 'ORG-0000', pdf: 35, docx: 10, xlsx: 15 },
    { orgUnitID: 'ORG-0001', pdf: 28, docx: 20 },
    { orgUnitID: 'ORG-0002', pdf: 34, docx: 30 },
    { orgUnitID: 'ORG-0003', pdf: 32, docx: 40 },
    { orgUnitID: 'ORG-0001', exe: 16 },
  ];

  public primaryXAxis: Object = {
    valueType: 'Category',
    majorGridLines: {width:0}
  };

  public levels: object = [
    // { groupPath: 'Country', border: { color: 'black', width: 0.5 } },
    // { groupPath: 'JobDescription', border: { color: 'black', width: 0.5 } },
    // { groupPath: 'JobGroup', border: { color: 'black', width: 0.5 } },
  ];

  constructor(
    inject: Injector,
    private pageTitle: PageTitleService,
    private routerActive: ActivatedRoute,
    private cacheService: CacheService,
  ) {
    super(inject);
    this.funcID = 'DMD';
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.panels1 = JSON.parse(
      '[{"id":"0.9605255352952085_layout","row":0,"col":0,"sizeX":12,"sizeY":22,"minSizeX":12,"minSizeY":22,"maxSizeX":null,"maxSizeY":null, "header": "Thống kê dung lượng tài liệu tải lên"},{"id":"0.47112877938374287_layout","row":0,"col":12,"sizeX":12,"sizeY":12,"minSizeX":12,"minSizeY":12,"maxSizeX":null,"maxSizeY":null, "header":"Tài liệu theo phân hệ"},{"id":"0.7647024471772221_layout","row":0,"col":24,"sizeX":12,"sizeY":12,"minSizeX":12,"minSizeY":12,"maxSizeX":null,"maxSizeY":null, "header": "Thống kê tài liệu theo bộ phận"},{"id":"0.6213687501730532_layout","row":12,"col":12,"sizeX":24,"sizeY":10,"minSizeX":24,"minSizeY":10,"maxSizeX":null,"maxSizeY":null, "header":"Thống kê mức độ sử dụng tài liệu theo bộ phận"},{"id":"0.7292886175486251_layout","row":0,"col":36,"sizeX":12,"sizeY":22,"minSizeX":12,"minSizeY":22,"maxSizeX":null,"maxSizeY":null, "header":"Top tài liệu"}]'
    );
    this.datas1 = JSON.parse(
      '[{"panelId":"0.9605255352952085_layout","data":"1"},{"panelId":"0.47112877938374287_layout","data":"2"},{"panelId":"0.7647024471772221_layout","data":"3"},{"panelId":"0.6213687501730532_layout","data":"4"},{"panelId":"0.7292886175486251_layout","data":"5"}]'
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
          (x: any) => x.recID == this.reportID
        );
        if (reportItem) {
          let pinnedParams = reportItem.parameters?.filter((x: any) => x.isPin);
          if (pinnedParams) this.view.pinedReportParams = pinnedParams;
          this.getDashboardData();
        }

      }
    });
    this.detectorRef.detectChanges();
  }

  getBackground($event) {
    console.log('Img in DM', $event);
  }

  statByType:any=[];
  statByModule:any=[];
  statByOrg:any=[];
  subscription:Subscription;
  getDashboardData(predicates?: string, dataValues?: string, params?: any) {
    let model = new GridModels();
    model.funcID = this.funcID;
    model.entityName = 'TM_Tasks';
    model.predicates = predicates;
    model.dataValues = dataValues;
    this.statByType=[];
    this.statByModule=[];
    this.statByOrg=[];
    this.subscription && this.subscription.unsubscribe();
    if(params) this.objParams = params;
    else{
      params =this.objParams;
    }
    this.subscription = this.api
      .exec('DM', 'FileBussiness', 'GetDataDashboardAsync', params? [params]: [{}])
      .subscribe((res:any) => {

        this.dbData=res.dataset
        console.log(this.dbData);
        let objType=this.groupBy(this.dbData,'extension');
        for(let key in objType){
          let obj:any={};
          obj.extension = key;
          obj.quantity = objType[key].length;
          obj.totalFileSize = this.sumByProp(objType[key],'fileSize')
          this.statByType.push(obj)
        }
        let objModule=this.groupBy(this.dbData.filter((x:any)=>x.module),'module');
        for(let key in objModule){
          let obj:any={};
          obj.module = key;
          obj.quantity = objModule[key].length;
          obj.totalFileSize = this.sumByProp(objModule[key],'fileSize')
          this.statByModule.push(obj)
        }
        let objOrg=this.groupBy(this.dbData.filter((x:any)=>x.orgUnitID),'orgUnitID');
        for(let key in objOrg){
          let obj:any={};
          obj.orgUnitID = key;
          obj.organizationName = objOrg[key][0].organizationName;
          obj.quantity = objOrg[key].length;
          obj.totalFileSize = this.sumByProp(objOrg[key],'fileSize');
          obj.percentage = (obj.quantity/this.dbData.length)*100;
          obj.sizePercentage = (obj.totalFileSize/this.sumByProp(this.dbData,'fileSize'))*100;
          obj.png = objOrg[key].filter((x:any)=>x.extension =='.png').length;
          obj.pdf = objOrg[key].filter((x:any)=>x.extension =='.pdf').length;
          obj.xlsx = objOrg[key].filter((x:any)=>x.extension =='.xlsx').length;
          obj.jpg = objOrg[key].filter((x:any)=>x.extension =='.jpg').length;
          obj.docx = objOrg[key].filter((x:any)=>x.extension =='.docx').length;
          obj.exe = objOrg[key].filter((x:any)=>x.extension =='.exe').length;
          this.statByOrg.push(obj)
        }

        this.isLoaded = true;
        this.subscription.unsubscribe();
      });

    this.detectorRef.detectChanges();
  }

  objParams:any;
  filterChange(e: any) {
    this.isLoaded = false;
    const { predicates, dataValues } = e[0];
    const param = e[1];
    this.objParams=param;
    this.reportItem && this.getDashboardData(predicates, dataValues, param);

    this.detectorRef.detectChanges();
  }

  reportItem:any;
  onActions(e: any) {
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
                      path: 'dm/dashboard/' + this.arrReport[i].recID,
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
                    this.getDashboardData();


                  }

                  //this.reloadAllChart();
                  //this.isLoaded = true
                }
              });

      }
    }
    // if (e.type == 'reportLoaded') {
    //   this.arrReport = e.data;
    //   if (this.arrReport.length) {
    //     let arrChildren: any = [];
    //     for (let i = 0; i < this.arrReport.length; i++) {
    //       arrChildren.push({
    //         title: this.arrReport[i].customName,
    //         path: 'dm/dashboard/' + this.arrReport[i].reportID,
    //       });
    //     }
    //     this.pageTitle.setSubTitle(arrChildren[0].title);
    //     this.pageTitle.setChildren(arrChildren);
    //     this.codxService.navigate('', arrChildren[0].path);
    //   }
    //}
    //this.isLoaded = false;
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

  getAvatar(ex: string) {
    if (!ex) return 'file.svg';
    var ext = ex.toLocaleLowerCase();
    switch (ext) {
      case '.txt':
        return 'txt.svg';
      case '.doc':
      case '.docx':
        return 'doc.svg';
      case '.7z':
      case '.rar':
      case '.zip':
        return 'zip.svg';
      case '.jpg':
      case '.jpeg':
      case '.jfif':
        return 'jpg.svg';
      case '.mp4':
        return 'mp4.svg';
      case '.xls':
      case '.xlsx':
        return 'xls.svg';
      case '.pdf':
        return 'pdf.svg';
      case '.png':
        return 'png.svg';
      case '.js':
        return 'javascript.svg';
      case '.apk':
        return 'android.svg';
      case '.ppt':
        return 'ppt.svg';
      case '.mp3':
      case '.wma':
      case '.wav':
      case '.flac':
      case '.ogg':
      case '.aiff':
      case '.aac':
      case '.alac':
      case '.lossless':
      case '.wma9':
      case '.aac+':
      case '.ac3':
        return 'audio.svg';
      default:
        return 'file.svg';
    }
  }

  getThumbnail(data) {
    return `../../../assets/themes/dm/default/img/${this.getAvatar(data.extension)}`;
  }

  activeType:any='topView'
  topFileChange(ele:any,chart:any){
    if(ele.id==this.activeType) return;
    this.activeType=ele.id
    switch (ele.id) {
      case 'topView':
        chart.topView.classList.contains('d-none') && chart.topView.classList.remove('d-none')
        !chart.topNew.classList.contains('d-none') && chart.topNew.classList.add('d-none')
        !chart.topDownload.classList.contains('d-none') && chart.topDownload.classList.add('d-none')
        break;
      case 'topNew':
        !chart.topView.classList.contains('d-none') && chart.topView.classList.add('d-none')
        chart.topNew.classList.contains('d-none') && chart.topNew.classList.remove('d-none')
        !chart.topDownload.classList.contains('d-none') && chart.topDownload.classList.add('d-none')
        break;
      case 'topDownload':
        !chart.topView.classList.contains('d-none') && chart.topView.classList.add('d-none')
        !chart.topNew.classList.contains('d-none') && chart.topNew.classList.add('d-none')
        chart.topDownload.classList.contains('d-none') && chart.topDownload.classList.remove('d-none')
        break;

    }

  }

  activeTypeOrg:any='topSize'
  topOrgChange(ele:any,chart:any){
    if(ele.id==this.activeTypeOrg) return;
    this.activeTypeOrg=ele.id
    switch (ele.id) {
      case 'topSize':
        chart.topSize.classList.contains('d-none') && chart.topSize.classList.remove('d-none')
        !chart.topQuantity.classList.contains('d-none') && chart.topQuantity.classList.add('d-none')
        break;
      case 'topQuantity':
        !chart.topSize.classList.contains('d-none') && chart.topSize.classList.add('d-none')
        chart.topQuantity.classList.contains('d-none') && chart.topQuantity.classList.remove('d-none')
        break;

    }
  }
  activeView:any='viewType'
  viewChange(ele:any,charts:any){
    if(ele.id==this.activeView) return;
    this.activeView=ele.id
    switch (ele.id) {
      case 'viewType':
        charts.chart1.pie1.element.classList.contains('d-none') && charts.chart1.pie1.element.classList.remove('d-none');
        charts.chart1.pie1.refresh()
        charts.chart1.gauge1.classList.contains('d-none') &&  charts.chart1.gauge1.classList.remove('d-none');
        !charts.chart2.pie2.element.classList.contains('d-none') && charts.chart2.pie2.element.classList.add('d-none')
        !charts.chart2.gauge2.classList.contains('d-none') && charts.chart2.gauge2.classList.add('d-none')
        break;
      case 'viewModule':
        charts.chart2.pie2.element.classList.contains('d-none') && charts.chart2.pie2.element.classList.remove('d-none');
        charts.chart2.pie2.refresh()
        charts.chart2.gauge2.classList.contains('d-none') &&  charts.chart2.gauge2.classList.remove('d-none');
        !charts.chart1.pie1.element.classList.contains('d-none') && charts.chart1.pie1.element.classList.add('d-none')
        !charts.chart1.gauge1.classList.contains('d-none') && charts.chart1.gauge1.classList.add('d-none')
        break;

    }
  }

  getData1() {}

  getData2() {}

  getData3() {}

  getData4() {}

  getData5() {}

  private groupBy(arr: any, key: any) {
    return arr.reduce(function (r: any, a: any) {
      r[a[key]] = r[a[key]] || [];
      r[a[key]].push(a);
      return r;
    }, Object.create(null));
  }

  sortByProp(arr:any[],property:string,dir:string='asc',take:number=0){
    if(arr.length && property){
      if(dir == 'asc'){
        if(take){
          return JSON.parse(JSON.stringify(arr)).sort((a:any,b:any)=>{
            if(typeof a[property] == 'string' && new Date(a[property]) instanceof Date)  return new Date(a[property]).getTime()- new Date(b[property]).getTime();
            return a[property]-b[property];
          } ).slice(0,take)
        }
        return JSON.parse(JSON.stringify(arr)).sort((a:any,b:any)=>{
          if(a[property] instanceof Date)  return new Date(a[property]).getTime()- new Date(b[property]).getTime();
          return a[property]-b[property];
        });
      }
      else{
        if(take){
          return JSON.parse(JSON.stringify(arr)).sort((a:any,b:any)=>{
            if(typeof a[property] == 'string' && new Date(a[property]) instanceof Date) {

              return new Date(b[property]).getTime()- new Date(a[property]).getTime();
            }
            return b[property]-a[property];
          }).slice(0,take)
        }
        return JSON.parse(JSON.stringify(arr)).sort((a:any,b:any)=>{
          if(a[property] instanceof Date)  return new Date(b[property]).getTime()- new Date(a[property]).getTime();
          return b[property]-a[property];
        });
      }

    }
    return [];
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
