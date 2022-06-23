import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CallFuncService,
  DataRequest,
  DialogRef,
  ResourceModel,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { PopupAddStationeryComponent } from './popup-add-stationery/popup-add-stationery.component';

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
  @ViewChild('costPriceCol') costPriceCol: TemplateRef<any>;

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
        id: 'btnEdit',
        icon: 'icon-list-checkbox',
        text: 'Chỉnh sửa',
      },
      {
        id: 'btnDelete',
        icon: 'icon-list-checkbox',
        text: 'Xóa',
      },
    ];

    this.columnsGrid = [
      {
        field: 'resourceName',
        headerText: 'Sản phẩm',
        width: 150,
        template: this.resourceNameCol,
      },
      {
        field: 'costPrice',
        headerText: 'Đơn giá',
        width: 150,
        template: this.costPriceCol,
      },
      {
        field: '',
        headerText: 'Định mức sử dụng',
        width: 150,
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
        active: false,
        model: {
          template: this.cardItem,
        },
      },
      {
        id: '3',
        text: 'List',
        type: ViewType.list,
        sameData: true,
        active: false,
        model: {
          template: this.listItem,
        },
      },
      {
        id: '4',
        text: 'Grid',
        type: ViewType.grid,
        sameData: true,
        active: true,
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
      case 'btnEdit':
        this.edit();
        break;
      case 'btnDelete':
        this.delete();
        break;
    }
  }

  addNew(evt?) {
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '750px';
      option.DataService = this.viewBase?.currentView?.dataService;
      this.dialog = this.callfunc.openSide(
        PopupAddStationeryComponent,
        this.dataSelected,
        option
      );
    });
  }

  edit(evt?) {
    this.viewBase.dataService
      .edit(this.viewBase.dataService.dataSelected)
      .subscribe((res) => {
        this.dataSelected = this.viewBase.dataService.dataSelected;
        let option = new SidebarModel();
        option.Width = '750px';
        option.DataService = this.viewBase?.currentView?.dataService;
        this.dialog = this.callfunc.openSide(
          PopupAddStationeryComponent,
          this.viewBase.dataService.dataSelected,
          option
        );
      });
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

  addCart(evt, data) {
    console.log(data);
  }

  clickMF(evt, data) {}

  click(data) {
    console.log(data);
  }
}
