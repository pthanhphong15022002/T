import { UIComponent } from 'codx-core';
import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  CallFuncService,
  DataRequest,
  DialogRef,
  NotificationsService,
  ResourceModel,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { PopupRequestStationeryComponent } from './popup-request-stationery/popup-request-stationery.component';
import { PopupListStationeryComponent } from './popup-list-stationery/popup-list-stationery.component';

@Component({
  selector: 'stationery',
  templateUrl: './booking-stationery.component.html',
  styleUrls: ['./booking-stationery.component.scss'],
})
export class BookingStationeryComponent extends UIComponent {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('listItem') listItem: TemplateRef<any>;
  @ViewChild('cardItem') cardItem: TemplateRef<any>;
  @ViewChild('chart') chart: TemplateRef<any>;
  @ViewChild('resourceNameCol') resourceNameCol: TemplateRef<any>;
  @ViewChild('usageRateCol') usageRateCol: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  dataSelected: any;
  columnsGrid: any;
  dialog!: DialogRef;
  model: DataRequest;
  modelResource: ResourceModel;
  cart: [];
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '6';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';

  constructor(
    private injector: Injector,
    private notification: NotificationsService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'EP';
    this.modelResource.className = 'ResourcesBusiness';
    this.modelResource.service = 'EP';
    this.modelResource.method = 'GetListAsync';
    this.modelResource.predicate = 'ResourceType=@0';
    this.modelResource.dataValue = '6';
  }

  ngAfterViewInit(): void {
    this.moreFunc = [
      {
        id: 'btnAdd',
        icon: 'icon-shopping_cart',
        text: 'Yêu cầu VPP',
      },
      {
        id: 'btnAddNew',
        icon: 'icon-playlist_add_check',
        text: 'Danh sách yêu cầu',
      },
      {
        id: 'btnDelete',
        icon: 'icon-list-checkbox',
        text: 'Xóa',
      },
    ];

    this.columnsGrid = [
      {
        headerText: 'Sản phẩm',
        width: '75%',
        template: this.resourceNameCol,
      },
      {
        field: 'costPrice',
        headerText: 'Đơn giá',
        width: '10%',
      },
      {
        headerText: 'Định mức sử dụng',
        width: '15%',
        template: this.usageRateCol,
      },
    ];

    this.views = [
      {
        id: '1',
        text: 'Dashboard',
        type: ViewType.chart,
        sameData: true,
        active: false,
        model: {
          template: this.chart,
        },
      },
      {
        id: '2',
        text: 'Card',
        type: ViewType.card,
        sameData: true,
        active: true,
        model: {
          template: this.cardItem,
        },
      },
      {
        id: '3',
        text: 'Grid',
        type: ViewType.grid,
        sameData: true,
        active: false,
        model: {
          resources: this.columnsGrid,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  click(evt: any) {
    switch (evt.id) {
      case 'btnAdd':
        this.addNewRequest();
        break;
      case 'btnAddNew':
        this.openRequestList();
        break;
    }
  }
  openRequestList(evt?) {
    let dataItem = this.viewBase.dataService.dataSelected;
    if (evt) {
      dataItem = evt;
    }
    this.viewBase.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.dataService;
      option.FormModel = this.viewBase?.formModel;
      this.dialog = this.callfc.openSide(
        PopupListStationeryComponent,
        dataItem,
        option
      );
    });
  }
  addNewRequest(evt?) {
    let dataItem = this.viewBase.dataService.dataSelected;
    if (evt) {
      dataItem = evt;
    }
    this.viewBase.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.dataService;
      option.FormModel = this.viewBase?.formModel;
      this.dialog = this.callfc.openSide(
        PopupRequestStationeryComponent,
        [dataItem, this.listData, this.count],
        option
      );
    });
  }

  closeEditForm(evt?: any) {
    if (evt) {
      this.dialog && this.dialog.close();
    }
  }
  
  listData = [];
  count = 0;
  addCart(evt, data) {
    let dataItem = data;
    if (this.listData.length == 0) {
      this.count = 1;
      this.listData.push(dataItem);
      this.notification.notifyCode('EP001');
    } else {
      let check = this.listData.indexOf(dataItem);
      if (check > -1) {
        this.notification.notifyCode('EP002');
      } else {
        this.listData.push(dataItem);
        this.count += 1;
        this.notification.notifyCode('EP001');
      }
    }
  }

  clickMF(evt, data) {}
}
