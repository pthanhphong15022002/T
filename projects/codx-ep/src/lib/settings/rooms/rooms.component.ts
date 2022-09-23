import {
  Component,
  TemplateRef,
  ViewChild,
  Injector,
  AfterViewInit,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ButtonModel,
  DialogRef,
  FormModel,
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
export class RoomsComponent extends UIComponent implements AfterViewInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('itemTemplate') template!: TemplateRef<any>;

  @ViewChild('resourceIDCol') resourceIDCol: TemplateRef<any>;
  @ViewChild('locationCol') locationCol: TemplateRef<any>;
  @ViewChild('equipmentsCol') equipmentsCol: TemplateRef<any>;
  @ViewChild('ownerCol') ownerCol: TemplateRef<any>;  
  @ViewChild('preparatorCol') preparatorCol: TemplateRef<any>;

  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  devices: any;
  dataSelected: any;
  columnGrids: any;
  addEditForm: FormGroup;
  formModel: FormModel;
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
    private codxEpService: CodxEpService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
      }
    });
  }

  onInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
   
    this.cache.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
    });
  }

  ngAfterViewInit(): void {
    this.buttons = {
      id: 'btnAdd',
    };
    this.codxEpService.getFormModel(this.funcID).then((formModel) => {
      this.cache
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          this.columnGrids = [
            {
              field: 'resourceID',
              headerText: gv['ResourceID'].headerText,
              width: gv['ResourceID'].width,
              template: this.resourceIDCol,
            },
            {
              headerText: gv['Location'].headerText,
              width: 250,//gv['Location'].width,
              field: 'location',
              textAlign: 'Center',
              template: this.locationCol,
            },
            {
              headerText: gv['Equipments'].headerText,
              width: gv['Equipments'].width,
              field: 'equipments',
              template: this.equipmentsCol,
              headerTextAlign: 'Center',
              textAlign: 'Center',
            },          
            {
              headerText: gv['Note'].headerText,
              width: gv['Note'].width,
              field: 'note',
              headerTextAlign: 'Center',  
              textAlign: 'Center',            
            },
            {
              headerText: gv['Owner'].headerText,
              //width:gv['Owner'].width,
              width: 200,
              template: this.ownerCol,
              headerTextAlign: 'Center',
            },
            {
              headerText: 'Người chuẩn bị',//gv['Owner'].headerText,
              //width:gv['Owner'].width,
              width: 200,
              template: this.preparatorCol,
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
  }

  getEquiqments(equipments: any) {
    equipments.map((res) => {
      this.vllDevices.forEach((device) => {
        if (res.equipmentID == device.value) {
          this.lstDevices.push(device.text);
        }
      });
    });
    return this.lstDevices.join(';');
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
      option.FormModel = this.formModel;
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
          option.FormModel = this.formModel;
          this.dialog = this.callfc.openSide(
            PopupAddRoomsComponent,
            [this.viewBase.dataService.dataSelected, false],
            option
          );
        });
    }
  }

  delete(obj?) {
    this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
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
