import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { EventEmitter } from 'stream';
import { isBuffer } from 'util';
import { PopupListStationeryComponent } from './popup-list-stationery/popup-list-stationery.component';
import { PopupRequestStationeryComponent } from './popup-request-stationery/popup-request-stationery.component';

@Component({
  selector: 'codx-stationery',
  templateUrl: './booking-stationery.component.html',
  styleUrls: ['./booking-stationery.component.scss'],
})
export class BookingStationeryComponent implements OnInit {
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
  idField = 'RecID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';

  constructor(
    private callfunc: CallFuncService,
    private cf: ChangeDetectorRef,
    private notification: NotificationsService,
    private activedRouter: ActivatedRoute
  ) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  ngOnInit(): void {
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
    this.cf.detectChanges();
  }

  add(evt: any) {
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
      case 'btnAddNew':
        this.addNewStationery();
        break;
      case 'btnEdit':
        this.edit();
        break;
      case 'btnDelete':
        this.delete();
        break;
    }
  }
  addNewStationery(evt?) {
    let dataItem = this.viewBase.dataService.dataSelected;
    if (evt) {
      dataItem = evt;
    }
    this.viewBase.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase.currentView.formModel;
      this.dialog = this.callfunc.openSide(
        PopupListStationeryComponent,
        dataItem,
        option
      );
    });
  }
  addNew(evt?) {
    let dataItem = this.viewBase.dataService.dataSelected;
    if (evt) {
      dataItem = evt;
    }
    this.viewBase.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase.currentView.formModel;
      this.dialog = this.callfunc.openSide(
        PopupRequestStationeryComponent,
        [dataItem, this.listData,this.count],
        option
      );
    });
  }

  edit(evt?) {
    // this.viewBase.dataService
    //   .edit(this.viewBase.dataService.dataSelected)
    //   .subscribe((res) => {
    //     this.dataSelected = this.viewBase.dataService.dataSelected;
    //     let option = new SidebarModel();
    //     option.Width = '800px';
    //     option.DataService = this.viewBase?.currentView?.dataService;
    //     this.dialog = this.callfunc.openSide(
    //       PopupAddStationeryComponent,
    //       this.viewBase.dataService.dataSelected,
    //       option
    //     );
    //   });
  }
  delete(evt?) {
    this.viewBase.dataService
      .delete([this.viewBase.dataService.dataSelected])
      .subscribe((res) => {
        console.log(res);
        this.dataSelected = res;
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
      this.notification.notify('Thêm vỏ hàng thành công', 'success');
    } else {
      let check = this.listData.indexOf(dataItem);
      if (check > -1) {
        this.notification.notify('Bạn đã nhập vào giỏ hàng', 'error');
      } else {
        this.listData.push(dataItem);
        this.count += 1;
        this.notification.notify('Thêm giỏ hàng thành công', 'success');
      }
    }
    console.log('ListData:', this.listData);
    console.log('COunt: ', this.count);
  }

  clickMF(evt, data) {}

  click(data) {
    console.log(data);
  }
}
