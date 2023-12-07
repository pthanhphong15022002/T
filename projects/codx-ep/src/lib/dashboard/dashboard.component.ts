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
  @ViewChildren('templateCar') templatesCar: QueryList<any>;
  @ViewChildren('templateStationery') templatesStationery: QueryList<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;


  panels:any = JSON.parse(
    '[{"header":"Thời gian sử dụng & số lượt đặt phòng","id":"0.4199281088325755_layout","row":0,"col":12,"sizeX":18,"sizeY":11,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"header":"Top nhân viên đặt phòng","id":"0.4592017601751599_layout","row":0,"col":30,"sizeX":18,"sizeY":11,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"header":"Tỉ lệ thời gian sử dụng phòng","id":"0.06496875406606994_layout","row":11,"col":12,"sizeX":36,"sizeY":11,"minSizeX":16,"minSizeY":12,"maxSizeX":null,"maxSizeY":null},{"header":"Thống kê số lượt đặt phòng","id":"0.21519762020962552_layout","row":0,"col":0,"sizeX":12,"sizeY":23,"minSizeX":8,"minSizeY":8,"maxSizeX":null,"maxSizeY":null}]'
  );
  datas:any = JSON.parse(
    '[{"panelId":"0.4199281088325755_layout","data":"5"},{"panelId":"0.4592017601751599_layout","data":"6"},{"panelId":"0.06496875406606994_layout","data":"8"},{"panelId":"0.21519762020962552_layout","data":"7"}]'
  );
  panelCar:any = JSON.parse(
    '[{"header":"Đi công tác nhiều nhất","id":"0.4199281088325755_layout","row":0,"col":36,"sizeX":12,"sizeY":10,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"header":"Thống kê đặt xe theo lý do","id":"0.4592017601751599_layout","row":0,"col":24,"sizeX":12,"sizeY":10,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"header":"Thống kê mức độ sử dụng xe","id":"0.06496875406606994_layout","row":10,"col":12,"sizeX":36,"sizeY":13,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"header":"Thống kê đặt xe","id":"0.21519762020962552_layout","row":0,"col":0,"sizeX":12,"sizeY":23,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"header":"Tỉ lệ sử dụng nguồn xe","id":"0.4905937674104959_layout","row":0,"col":12,"sizeX":12,"sizeY":10,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null}]'
  );
  dataCar:any = JSON.parse(
    '[{"panelId":"0.4199281088325755_layout","data":"5"},{"panelId":"0.4592017601751599_layout","data":"1"},{"panelId":"0.06496875406606994_layout","data":"2"},{"panelId":"0.21519762020962552_layout","data":"3"},{"panelId":"0.4905937674104959_layout","data":"4"}]'
  );
  panelStationery:any = JSON.parse(
    '[{"header":"Văn phòng phẩm được đặt nhiều nhất","id":"0.4199281088325755_layout","row":0,"col":36,"sizeX":12,"sizeY":10,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"header":"Thống kê đặt văn phòng phẩm theo lý do","id":"0.4592017601751599_layout","row":0,"col":24,"sizeX":12,"sizeY":10,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"header":"Thống kê đặt văn phòng phẩm theo phòng ban","id":"0.06496875406606994_layout","row":10,"col":12,"sizeX":36,"sizeY":13,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"header":"Thống kê số lượng văn phòng phẩm","id":"0.21519762020962552_layout","row":0,"col":0,"sizeX":12,"sizeY":23,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null},{"header":"Số lượng văn phòng phẩm được đặt","id":"0.4905937674104959_layout","row":0,"col":12,"sizeX":12,"sizeY":10,"minSizeX":1,"minSizeY":1,"maxSizeX":null,"maxSizeY":null}]'
  );
  dataStationery:any = JSON.parse(
    '[{"panelId":"0.4199281088325755_layout","data":"5"},{"panelId":"0.4592017601751599_layout","data":"1"},{"panelId":"0.06496875406606994_layout","data":"2"},{"panelId":"0.21519762020962552_layout","data":"3"},{"panelId":"0.4905937674104959_layout","data":"4"}]'
  );
  dataLabel: Object = {
    visible: true,
    position: 'Outside', name: 'resourceName',
    font: {
        fontWeight: '500'
    },
    connectorStyle: { length: '20px', type: 'Curve'},

  };
  dataLabel1: Object = {
    visible: true,
    position: 'Outside', name: 'itemName',
    font: {
        fontWeight: '500'
    },
    connectorStyle: { length: '20px', type: 'Curve'},

  };
  dataLabelStationery: Object = {
    visible: true,
    position: 'Outside', name: 'reason',
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
   primaryXAxis: Object = {
    majorGridLines: { width: 0 },
    minorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
    minorTickLines: { width: 0 },
    interval: 1,
    lineStyle: { width: 0 },
    valueType: 'Category'
};
//Initializing Primary Y Axis
 primaryYAxis: Object = {
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    majorGridLines: { width: 1 },
    minorGridLines: { width: 1 },
    minorTickLines: { width: 0 },
};
chartArea: Object = {
  border: {
      width: 0
  }
};
  constructor(
    private injector: Injector,
    private cacheService: CacheService,
    private pageTitle: PageTitleService,
    private routerActive: ActivatedRoute,
  ){
    super(injector);
    //this.router.params.subscribe((param) => {
      //if (param) this.funcID = param['funcID'];
    //});

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
        //this.funcID = res.funcID;
        this.isLoaded = false;
        this.reportID=res.funcID;
        if(this.arrReport && this.arrReport.length){
          let idx =this.arrReport.findIndex((x:any)=>x.recID==this.reportID);
          if(idx >-1){
            this.reportItem = this.arrReport[idx];
            this.funcID = this.reportItem.reportID;
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

  getBookingRoom(params?:any){
    this.statByEmp=[];
    this.subscription  && this.subscription.unsubscribe();
    this.subscription = this.api.execSv('rptep','Codx.RptBusiness.EP','BookingRoomsBusiness','GetDatasetAsync', params ? [params] : [{}])
                        .subscribe((res:any)=>{
                          if(res ){
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

  statByReason:any=[];
  statByCard:any=[];
  lstResources:any=[];
  lstBookingPerAttendee:any=[];
  statByAttendees:any=[];
  getBookingCar(params?:any){
    this.statByReason=[];
    this.statByCard=[];
    this.lstResources = [];
    this.lstBookingPerAttendee=[];
    this.statByAttendees=[];
    this.subscription  && this.subscription.unsubscribe();
    this.subscription = this.api.execSv('rptep','Codx.RptBusiness.EP','BookingCarsBusiness','GetDatasetAsync', params ? [params] : [{}])
                        .subscribe((res:any)=>{
                          this.dataset = res;
                            let objRes = this.groupBy(this.dataset.filter((x:any)=>x.resourceID),"resourceID");
                            for(let key in objRes){
                              let obj:any={};
                              obj.resourceID = key;
                              obj.resourceName = objRes[key][0].resourceName;
                              obj.quantity = objRes[key].length;
                              obj.percentage = this.toFixed((obj.quantity/this.dataset.length)*100);
                              obj.usedHours = this.sumByProp(objRes[key],'hours');
                              obj.departmentName = objRes[key][0].departmentName,
                              obj[key] =  objRes[key].length
                              let oKey:any={};
                              oKey.resourceID=key;
                              oKey.resourceName = obj.resourceName;
                              this.lstResources.push(oKey);
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
                            let objReasons = this.groupBy(this.dataset,'reason');
                            for(let key in objReasons){
                              let obj:any={};
                              obj.reason = key !='null' ? key : 'Lí do khác',
                              obj.quantity = objReasons[key].length;
                              obj.percentage = this.toFixed((obj.quantity/this.dataset.length)*100)
                              this.statByReason.push(obj);
                            }
                            let objCards = this.groupBy(this.dataset,'useCard');
                            for(let key in objCards){
                              let obj:any={};
                              obj.resourceName = key =='true' ? 'Xe nội bộ' : 'Xe ngoài',
                              obj.quantity = objCards[key].length;
                              obj.percentage = this.toFixed((obj.quantity/this.dataset.length)*100)
                              this.statByCard.push(obj);
                            }
                            this.dataset.map((x:any)=>{
                              if(x.attendees && x.attendees.length){
                                for(let i =0;i<x.attendees.length;i++){
                                  let objNew = JSON.parse(JSON.stringify(x));
                                  objNew.attendeeName = x.attendees[i].userName;
                                  objNew.attendeeID= x.attendees[i].userName
                                  this.lstBookingPerAttendee.push(objNew);
                                }
                              }
                              return x;
                            })
                            let objAttendee = this.groupBy(this.lstBookingPerAttendee,'attendeeName');
                            for(let key in objAttendee){
                              let obj:any={};
                              obj.username = key,
                              obj.userID=objAttendee[key][0].attendeeID;
                              obj.quantity = objAttendee[key].length;
                              obj.percentage = this.toFixed((obj.quantity/this.lstBookingPerAttendee.length)*100)
                              this.statByAttendees.push(obj);
                            }
                            console.log(this.lstBookingPerAttendee   );

                            this.isLoaded = true;
                        })
  }


  statByItems:any=[];
  lstBookingPerItem:any=[];
  getBookingStationery(params?: any){
    this.statByItems = [];
    this.statByReason = [];
    this.lstBookingPerItem = [];
    this.subscription  && this.subscription.unsubscribe();
    this.subscription = this.api.execSv('rptep','Codx.RptBusiness.EP','StationaryBusiness','GetDatasetAsync', params ? [params] : [{}])
                        .subscribe((res:any)=>{
                          this.dataset=res;

                          let objReasons = this.groupBy(this.dataset,'reason');
                          for(let key in objReasons){
                            let obj:any={};
                            obj.reason = key !='null' ? key : 'Lí do khác',
                            obj.quantity = objReasons[key].length;
                            obj.percentage = this.toFixed((obj.quantity/this.dataset.length)*100)
                            this.statByReason.push(obj);
                          }
                          this.dataset.map((x:any)=>{
                            if(x.items && x.items.length){
                              for(let i =0;i<x.items.length;i++){
                                let objNew = JSON.parse(JSON.stringify(x));
                                objNew.itemName = x.items[i].itemName;
                                objNew.itemID= x.items[i].itemID;
                                objNew.itemCount = x.items[i].quantity
                                this.lstBookingPerItem.push(objNew);
                              }
                            }
                            return x;
                          })
                          let objItem = this.groupBy(this.lstBookingPerItem,'itemName');
                          for(let key in objItem){
                            let obj:any={};
                            obj.itemName = key,
                            obj.itemID=objItem[key][0].itemID;
                            obj.departmentName=objItem[key][0].departmentName;
                            obj.departmentID=objItem[key][0].departmentID;
                            obj.itemRoomBooking = this.sumByProp(objItem[key].filter((x:any)=>x.resourceID),'itemCount');
                            obj.itemBooking = this.sumByProp(objItem[key].filter((x:any)=>!x.resourceID),'itemCount');
                            obj.quantity = this.sumByProp(objItem[key],'itemCount');
                            obj.percentageRoom = this.toFixed((obj.itemRoomBooking/this.sumByProp(this.lstBookingPerItem,'itemCount'))*100)
                            obj.percentageBooking = this.toFixed((obj.itemBooking/this.sumByProp(this.lstBookingPerItem,'itemCount'))*100)
                            obj.percentage = this.toFixed((obj.quantity/this.lstBookingPerItem.length)*100)
                            this.statByItems.push(obj);
                          }

                          console.log(this.statByReason);

                          this.isLoaded = true;
                        });
  }

  getDataset(params?:any){
    this.isLoaded = false;
    this.statByRes = [];
    if(params) this.objParams = params;
    else params = this.objParams
    if(this.funcID == "EPD001"){
      this.getBookingRoom(params);
    }
    if(this.funcID == 'EPD002'){
      this.getBookingCar(params);
    }
    if(this.funcID == 'EPD003'){
      this.getBookingStationery(params);
    }
   }

  onActions(e:any){
    if (e.type == 'reportLoaded') {
      this.arrReport = e.data;
      if (this.arrReport.length) {
        let pattern =
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

          if(this.arrReport.length > 1 && !this.reportID.match(pattern)){
            this.codxService.navigate('',`${this.view.function?.module ? this.view.function?.module.toLocaleLowerCase() : 'ep'}/dashboard-view/${this.reportID}`);
            return;
          }
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

  activePane:string="btnQuantityBooking"
  changeDir(ele:any,obj:any){
    if(ele.id == this.activePane) return;
    this.activePane = ele.id;
    if(ele.id == 'btnQuantityBooking' && Object.keys(obj).length){
      obj.chart1.pie1.element.classList.contains('d-none') && obj.chart1.pie1.element.classList.remove('d-none');
      obj.chart1.pie1.refresh();
      obj.chart1.elePane1.classList.contains('d-none') && obj.chart1.elePane1.classList.remove('d-none');

      !obj.chart2.pie2.element.classList.contains('d-none') && obj.chart2.pie2.element.classList.add('d-none');
      !obj.chart2.elePane2.classList.contains('d-none') && obj.chart2.elePane2.classList.add('d-none');
    }
    if(ele.id == 'btnQuantityRoomBooking' && Object.keys(obj).length){
      obj.chart2.pie2.element.classList.contains('d-none') && obj.chart2.pie2.element.classList.remove('d-none');
      obj.chart2.pie2.refresh();
      obj.chart2.elePane2.classList.contains('d-none') && obj.chart2.elePane2.classList.remove('d-none');

      !obj.chart1.pie1.element.classList.contains('d-none') && obj.chart1.pie1.element.classList.add('d-none');
      !obj.chart1.elePane1.classList.contains('d-none') && obj.chart1.elePane1.classList.add('d-none');
    }
      this.detectorRef.detectChanges();
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

  random_bg_color() {
    let x = Math.floor(Math.random() * 256);
    let y = Math.floor(Math.random() * 256);
    let z = Math.floor(Math.random() * 256);
    return "rgb(" + x + "," + y + "," + z + ")";
  }
}
