import { AfterViewInit, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, ButtonModel, CRUDService, CodxGridviewV2Component, DataService, SidebarModel, UIComponent, Util, ViewModel, ViewType } from 'codx-core';
import { PopupAddSalcoeffempComponent } from './popup/popup-add-salcoeffemp/popup-add-salcoeffemp.component';

@Component({
  selector: 'lib-salcoeffemp',
  templateUrl: './salcoeffemp.component.html',
  styleUrls: ['./salcoeffemp.component.css']
})
export class SalcoeffempComponent extends UIComponent{
  

  views:ViewModel[];
  buttonAdd:ButtonModel[];
  dataServiceHR:DataService;
  columnsGrid:any[] = [];
  gridViewSetUp:any;
  dataValues:string = "";
  @ViewChild("tmpLeft") tmpLeft:TemplateRef<any>;
  @ViewChild("tmpRight") tmpRight:TemplateRef<any>;
  @ViewChild("tmpEmployee") tmpEmployee:TemplateRef<any>;
  @ViewChild("tmpData") tmpData:TemplateRef<any>;
  @ViewChild("codxGridViewV2") codxGridViewV2 : CodxGridviewV2Component;


  constructor
  (
    private injector:Injector
  ) 
  {
    super(injector);
  }

  override onInit(): void {
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type:ViewType.content,
        showFilter:true,
        sameData:false,
        model:{
          panelLeftRef: this.tmpLeft,
          panelRightRef: this.tmpRight,
          widthLeft:300,
          // minWidthleft:'250px', 
          // maxWidthleft:'400px', 
          collapsed: true,
          resizable: true
        }
      }
    ];
    this.buttonAdd = [{
      id: 'btnAdd',
    }];
    this.dataServiceHR = new CRUDService(this.injector);
    this.dataServiceHR.idField = "orgUnitID";
    this.getColumns();
    this.getDataSource();
  }
  dataSources:any[] = [];
  // get data sources
  getDataSource(){
    this.dataSources = [
      {
        employeeID:"ELV00694",
        employee:
        {
          employeeID:"ELV00694",
          employeeName:"Nguyễn Thị Tuyết Mận",
          positionName:"Phòng ban CODX"
        },
        kpi1:0.7,
        kpi2:1,
        hs01:1,
        hs02:2,
        dgcn:0.5
      },
      {
        employeeID:"ELV00696",
        employee:
        {
          employeeID:"ELV00696",
          employeeName:"Hà Giang Thanh",
          positionName:"Phòng ban CODX"
        },
        kpi1:0.7,
        kpi2:1,
        hs01:1,
        hs02:2,
        dgcn:0.5
      },
      {
        employeeID:"ELV00753",
        employee:
        {
          employeeID:"ELV00753",
          employeeName:"Nguyễn Thị Tuyết Anh",
          positionName:"Phòng ban CODX"
        },
        kpi1:0.7,
        kpi2:1,
        hs01:1,
        hs02:2,
        dgcn:0.5
      },
      {
        employeeID:"ELV00767",
        employee:
        {
          employeeID:"ELV00767",
          employeeName:"Văn Thị Thủy",
          positionName:"Phòng ban CODX"
        },
        kpi1:0.7,
        kpi2:1,
        hs01:1,
        hs02:2,
        dgcn:0.5
      }
    ];
  }

  // get LS_SalCoeff
  getColumns(){
    this.columnsGrid.push(
    {
      field: 'employeeID', // phải viết field chữ thường nha. Viết hoa core đọc ko dc
      template: this.tmpEmployee,
      width:300
    });
    this.api.execSv("HR","ERM.Business.LS","SalCoeffBusiness","GetAsync")
    .subscribe((res:any) => {
      if(res[0].length > 0){
        res[0].forEach(item => {
          this.columnsGrid.push({
            headerText: item.CoeffName,
            field: item.CoeffCode.toLowerCase(),
            refField: 'coeffCode',
            template:this.tmpData,
            width:100
          });
        });
      }
    });
  }

  // double click gridview
  onDoubleClick(event){
    this.view.dataService.addNew()
    .subscribe((model:any) => {
      if(model)
      {
        let option = new SidebarModel();
        option.Width = '550px';
        option.FormModel = this.view.formModel;
        option.DataService = this.view.dataService;
        this.callfc.openSide(PopupAddSalcoeffempComponent,{data:model},option,this.view.funcID).closed.subscribe((res:any) => {
        });
      }
    });
  }
  // filterChange 
  filterChange($event){
    debugger
  }
}
