import { ButtonModel, DialogRef, SidebarModel, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PopupAddDriversComponent } from './popup-add-drivers/popup-add-drivers.component';

@Component({
  selector: 'setting-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss']
})
export class DriversComponent extends UIComponent implements AfterViewInit {
  @ViewChild('view') viewBase: ViewsComponent;
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '1';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';
  funcID: string;
  columnGrids: any;
  moreFuncs: any
  dataSelected: any;
  dialog!: DialogRef;
  buttons: ButtonModel;
  views: Array<ViewModel> = [];
  dialogAddDriver: FormGroup;

  constructor(private injector: Injector) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
    this.columnGrids = [
      {
        field: 'resourceID',
        headerText: 'Mã lái xe',
      },
      {
        field: 'resourceName',
        headerText: 'Tên lái xe',
      },
      {
        field: 'resourceName',
        headerText: 'Xe',
      },
      {
        field: 'code',
        headerText: 'Biển số',
      },
      {
        field: 'owner',
        headerText: 'Người điều phối',
      },
    ];
    this.views = [
      {
        sameData: true,
        id: '1',
        text: 'Danh mục tài xế',
        type: ViewType.grid,
        active: true,
        model: {
          resources: this.columnGrids,
        },
      },
    ];
    this.buttons = {
      id: 'btnAdd',
    };
    this.moreFuncs = [
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
  }

  onInit(): void {

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

  addNew() {
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      this.dialog = this.callfc.openSide(
        PopupAddDriversComponent,
        [this.dataSelected, true],
        option
      );
    });
  }

  edit(evt?) {
    // this.dataSelected = this.viewBase.dataService.dataSelected;
    // if (evt) this.dataSelected = evt;
    // this.viewBase.dataService.edit(this.dataSelected).subscribe((res) => {
    //   let option = new SidebarModel();
    //   option.Width = '800px';
    //   option.DataService = this.viewBase?.currentView?.dataService;
    //   option.FormModel = this.viewBase?.currentView?.formModel;
    //   this.dialog = this.callFunc.openSide(
    //     PopupAddCarsComponent,
    //     [this.dataSelected, false],
    //     option
    //   );
    // });
  }

  delete(evt?) {
    // let delItem = this.viewBase.dataService.dataSelected;
    // if (evt) delItem = evt;
    // this.viewBase.dataService.delete([delItem]).subscribe((res) => {
    //   this.dataSelected = res;
    // });
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

  closeDialog(evt?) {
    this.dialog && this.dialog.close();
  }
}
