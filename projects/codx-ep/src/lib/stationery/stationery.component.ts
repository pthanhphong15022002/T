import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  ButtonModel,
  CallFuncService,
  CodxGridviewComponent,
  DataRequest,
  DialogRef,
  ResourceModel,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { DialogStationeryComponent } from './dialog/dialog-stationery.component';

@Component({
  selector: 'codx-stationery',
  templateUrl: './stationery.component.html',
  styleUrls: ['./stationery.component.scss'],
})
export class StationeryComponent implements OnInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('listItem') listItem: TemplateRef<any>;
  @ViewChild('cardItem') cardItem: TemplateRef<any>;
  @ViewChild('chart') chart: TemplateRef<any>;
  @ViewChild('colorPicker') colorPicker: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeft: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  columnsGrid: any;
  dataSelected: any;
  dialog!: DialogRef;
  model: DataRequest;
  modelResource: ResourceModel;

  constructor(
    private callfunc: CallFuncService,
    private cf: ChangeDetectorRef
  ) {}

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
        active: true,
        model: {
          template: this.listItem,
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
        DialogStationeryComponent,
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
        option.DataService = this.viewBase?.currentView?.dataService;
        this.dialog = this.callfunc.openSide(
          DialogStationeryComponent,
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

  addCart(evt) {
    this.callfunc.openForm(this.colorPicker, 'Chọn màu', 400, 300);
  }

  clickMF(evt, data) {}

  click(data) {
    console.log(data);
  }
}
