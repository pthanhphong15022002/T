// dynamic form
// import { Component, ViewChild, Injector } from '@angular/core';
// import { UIComponent, ViewsComponent } from 'codx-core';
// @Component({
//   selector: 'setting-rooms',
//   templateUrl: 'rooms.component.html',
//   styleUrls: ['rooms.component.scss'],
// })
// export class RoomsComponent extends UIComponent {
//   @ViewChild('view') viewBase: ViewsComponent;
//   funcID: string;

//   constructor(private injector: Injector) {
//     super(injector);
//     this.funcID = this.router.snapshot.params['funcID'];
//   }

//   onInit(): void {}

//   ngAfterViewInit(): void {
//     // if (this.viewBase)
//     //   this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
//   }
// }
import {
  Component,
  TemplateRef,
  ViewChild,
  Injector,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ButtonModel,
  DialogRef,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { PopupAddRoomsComponent } from './popup-add-rooms/popup-add-rooms.component';
@Component({
  selector: 'setting-rooms',
  templateUrl: 'rooms.component.html',
  styleUrls: ['rooms.component.scss'],
})
export class RoomsComponent extends UIComponent {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('statusCol') statusCol: TemplateRef<any>;
  @ViewChild('rankingCol') rankingCol: TemplateRef<any>;  
  @ViewChild('avatar') avatar: TemplateRef<any>;
  @ViewChild('owner') owner: TemplateRef<any>;

  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  devices: any;
  dataSelected: any;
  columnGrids: any;
  addEditForm: FormGroup;
  isAdd = false;
  dialog!: DialogRef;
  vllDevices = [];
  lstDevices = [];
  funcID: string;
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
    private injector: Injector,
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.cache.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
    });
  }

  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
    this.columnGrids = [
      {
        field: 'resourceID',
        headerText: 'Mã phòng',
      },      
      {
        field: 'icon',
        headerText: "Ảnh đại diện",
        template: this.avatar,
      },
      {
        field: 'resourceName',
        headerText: 'Tên phòng',
      },
      {
        field: 'area',
        headerText: 'Diện tích',
      },
      {
        field: 'capacity',
        headerText: 'Sức chứa',
      },
      {
        headerText: "Người điều phối",
        width: '20%',
        template: this.owner,
      },
    ];
    this.views = [
      {
        sameData: true,
        id: '1',
        text: 'Danh mục phòng',
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
  }

  
  clickMF(event, data) {
    console.log(event);
    switch (event?.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS02':
        this.delete(data);
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
  
  addNew() {
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.viewBase?.dataService;
      option.FormModel = this.viewBase?.formModel;
      this.dialog = this.callfc.openSide(
        PopupAddRoomsComponent,
        [this.dataSelected, true],
        option
      );
    });
  }

  edit(obj?) {
    if (obj) {
      this.viewBase.dataService.dataSelected = obj;
      this.viewBase.dataService
        .edit(this.viewBase.dataService.dataSelected)
        .subscribe((res) => {
          this.dataSelected = this.viewBase.dataService.dataSelected;
          let option = new SidebarModel();
          option.Width = '550px';
          option.DataService = this.viewBase?.dataService;
          option.FormModel = this.viewBase?.formModel;
          this.dialog = this.callfc.openSide(
            PopupAddRoomsComponent,
            [this.viewBase.dataService.dataSelected, false],
            option
          );
        });
    }
  }

  delete(obj?) {
    if (obj) {
      this.viewBase.dataService.delete([obj], true).subscribe((res) => {
        console.log(res);
      });
    }
  }

  closeDialog(evt?) {
    this.dialog && this.dialog.close();
  }
}

