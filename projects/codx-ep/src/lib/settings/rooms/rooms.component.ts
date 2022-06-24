import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  CallFuncService,
  DialogRef,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';

import { PopupAddRoomsComponent } from './popup-add-rooms/popup-add-rooms.component';
@Component({
  selector: 'app-rooms',
  templateUrl: 'rooms.component.html',
  styleUrls: ['rooms.component.scss'],
})
export class RoomsComponent implements OnInit, AfterViewInit {
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('view') viewBase: ViewsComponent;
  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  devices: any;
  dataSelected: any;
  addEditForm: FormGroup;
  isAdd = false;
  dialog!: DialogRef;
  vllDevices = [];
  lstDevices = [];
  funcID = 'EPS21';
  showToolBar = 'true';
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '1';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';

  constructor(
    private api: ApiHttpService,
    private cacheSv: CacheService,
    private cr: ChangeDetectorRef,
    private callFunc: CallFuncService
  ) {}
  ngAfterViewInit(): void {
    this.views = [
      {
        sameData: true,
        id: '1',
        type: ViewType.list,
        active: true,
        model: {
          template: this.template,
        },
      },
    ];

    this.buttons = {
      id: 'btnAdd',
    };
  }

  ngOnInit(): void {
    this.cacheSv.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
    });
  }

  clickMF(evt?: any, data?: any) {
    switch (evt.functionID) {
      case 'edit':
        this.edit(data);
        break;
      case 'delete':
        this.delete(data);
        break;
      default:
        break;
    }
  }
  click(evt: ButtonModel) {
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
      this.dialog = this.callFunc.openSide(
        PopupAddRoomsComponent,
        this.dataSelected,
        option
      );
    });
  }

  closeDialog(evt?) {
    this.dialog && this.dialog.close();
  }

  edit(evt?) {
    this.viewBase.dataService
      .edit(this.viewBase.dataService.dataSelected)
      .subscribe((res) => {
        this.dataSelected = this.viewBase.dataService.dataSelected;
        let option = new SidebarModel();
        option.Width = '750px';
        option.DataService = this.viewBase?.currentView?.dataService;
        this.dialog = this.callFunc.openSide(
          PopupAddRoomsComponent,
          this.viewBase.dataService.dataSelected,
          option
        );
      });
  }
  delete(evt?) {
    this.viewBase.dataService
      .delete([this.viewBase.dataService.dataSelected])
      .subscribe((res) => {
        this.dataSelected = res;
      });
  }

  closeEditForm(evt) {}
}
