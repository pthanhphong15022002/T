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
import { Component, TemplateRef, ViewChild, Injector } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  ButtonModel,
  DialogRef,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CodxEpService } from 'projects/codx-ep/src/public-api';
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
  @ViewChild('avatarCol') avatarCol: TemplateRef<any>;
  @ViewChild('ownerCol') ownerCol: TemplateRef<any>;
  @ViewChild('companyIDCol') companyIDCol: TemplateRef<any>;
  @ViewChild('equipmentsCol') equipmentsCol: TemplateRef<any>;

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
  tempCompanyName = '';
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private apiHttpService: ApiHttpService
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
    // this.columnGrids = [
    //   {
    //     field: 'resourceID',
    //     headerText: 'Mã phòng',
    //     width:100,
    //   },
    //   {
    //     field: 'resourceName',
    //     headerText: 'Tên phòng',
    //     width:200,
    //   },
    //   {
    //     field: 'icon',
    //     headerText: "Hình ảnh",
    //     template: this.avatarCol,
    //     width:100,
    //     textAlign:'Center',
    //     headerTextAlign:'Center',
    //   },
    //   {
    //     field: 'area',
    //     headerText: 'Diện tích(m2)',
    //     width:100,
    //     textAlign:'Center',
    //   },
    //   {
    //     field: 'capacity',
    //     headerText: 'Sức chứa(người)',
    //     width:150,
    //     textAlign:'Center',

    //   },
    //   {
    //     field: 'location',
    //     headerText: "Vị trí",
    //     width:200,
    //     textAlign:'Center',
    //   },
    //   {
    //     headerText: "Công ty",
    //     width: 200,
    //     template: this.companyIDCol,
    //     headerTextAlign:'Center',
    //   },
    //   {
    //     headerText: "Người điều phối",
    //     width: 200,
    //     template: this.ownerCol,
    //     headerTextAlign:'Center',
    //   },
    //   {
    //     field: 'equipments',
    //     headerText: 'Thiết bị',
    //     template: this.equipmentsCol,
    //     width:300,
    //     headerTextAlign:'Center',
    //   },
    //   {
    //     field: 'note',
    //     headerTextAlign:'Center',
    //     headerText: 'Ghi chú',
    //     width:200,
    //   },
    // ];
    // this.views = [
    //   {
    //     sameData: true,
    //     id: '1',
    //     text: 'Danh mục phòng',
    //     type: ViewType.grid,
    //     active: true,
    //     model: {
    //       resources: this.columnGrids,
    //     },
    //   },
    // ];
    this.codxEpService.getFormModel(this.funcID).then((formModel) => {
      this.cache
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          this.columnGrids = [
            {
              field: 'resourceID',
              headerText: gv['ResourceID'].headerText,
              width: gv['ResourceID'].width,
            },
            {
              field: 'resourceName',
              headerText: gv['ResourceName'].headerText,
              width: gv['ResourceName'].width,
            },
            {
              headerText: gv['ResourceName'].headerText,
              width: gv['ResourceName'].width,
              field: 'icon',
              template: this.avatarCol,
              textAlign: 'Center',
              headerTextAlign: 'Center',
            },
            {
              headerText: gv['Area'].headerText,
              width: gv['Area'].width,
              field: 'area',
              textAlign: 'Center',
            },
            {
              headerText: gv['Capacity'].headerText,
              width: gv['Capacity'].width,
              field: 'capacity',
              textAlign: 'Center',
            },
            {
              headerText: gv['Location'].headerText,
              width: gv['Location'].width,
              field: 'location',
              textAlign: 'Center',
            },
            {
              headerText: gv['CompanyID'].headerText,
              width: '300',
              template: this.companyIDCol,
              headerTextAlign: 'Center',
            },
            {
              headerText: gv['Owner'].headerText,
              //width:gv['Owner'].width,
              width: 200,
              template: this.ownerCol,
              headerTextAlign: 'Center',
            },
            {
              headerText: gv['Equipments'].headerText,
              width: gv['Equipments'].width,
              field: 'equipments',
              template: this.equipmentsCol,
              headerTextAlign: 'Center',
            },
            {
              headerText: gv['Note'].headerText,
              width: gv['Note'].width,
              field: 'note',
              headerTextAlign: 'Center',
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
          this.detectorRef.detectChanges();
        });
    });
    this.detectorRef.detectChanges();
    this.buttons = {
      id: 'btnAdd',
    };
  }

  getEquiqments(equipments: any) {
    var tmp = [];
    equipments.map((res) => {
      this.vllDevices.forEach((device) => {
        if (res.equipmentID == device.value) {
          tmp.push(device.text);
        }
      });
    });
    return tmp.join(';');
  }
  getCompanyName(companyID: string) {
    this.codxEpService.getCompanyName(companyID).subscribe((res) => {
      if (res.msgBodyData[0]) {
        this.tempCompanyName = res.msgBodyData[0];
      }
    });
    return this.tempCompanyName;
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
