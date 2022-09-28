import { Device } from './../../booking/room/popup-add-booking-room/popup-add-booking-room.component';
import { Equipments } from './../../models/equipments.model';
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
export class RoomsComponent extends UIComponent {
  @ViewChild('itemTemplate') template!: TemplateRef<any>;

  @ViewChild('resourceNameCol') resourceNameCol: TemplateRef<any>;
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
  roomEquipments=[];

  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '1';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';
  moreFunc:any;
  funcIDName:any;
  afterViewInit = false;
  popupTitle='';
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
          
  }

  onInit(): void {
    //this.view.dataService.methodDelete = 'DeleteResourceAsync';
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;        
        this.cache.functionList(this.funcID).subscribe(res => {
          if (res) {            
            this.funcIDName = res.customName.toString().toLowerCase();
          }
        });
      }
    });
    
    this.cache.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;       
        this.roomEquipments.push(device);
        this.roomEquipments = JSON.parse(JSON.stringify(this.roomEquipments));
      });
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
              field: 'resourceName',
              headerText: gv['ResourceName'].headerText,
              width: '300',//gv['ResourceID'].width,
              template: this.resourceNameCol,
            },
            {
              headerText: gv['Location'].headerText,
              //width: gv['Location'].width,
              field: 'location',
              template: this.locationCol,
            },
            {
              headerText: gv['Equipments'].headerText,
              //width: gv['Equipments'].width,
              field: 'equipments',
              template: this.equipmentsCol,
              headerTextAlign: 'Center',
              textAlign: 'Center',
            },          
            {
              headerText: gv['Note'].headerText,
              //width: gv['Note'].width,
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
  openPopupDevice(template: any,lstEquipments? ) {    
    this.roomEquipments.forEach(element => {
      element.isSelected=false;
    });
    this.roomEquipments.forEach(element => {
      lstEquipments.forEach(item=>{
        if(element.id==item.equipmentID){
          element.isSelected=true;
        }
      })
    });   

    var dialog = this.callfc.openForm(template, '', 550, 430);
    this.detectorRef.detectChanges();
  }

  clickMF(event, data) {
    console.log(event);
    this.popupTitle=event?.text + " " + this.funcIDName;      
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
    this.popupTitle=evt?.text + " " + this.funcIDName;  
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
  //   this.view.dataService.addNew().subscribe((res: any) => {
  //   this.dataSelected = this.view.dataService.dataSelected;
  //   let option = new SidebarModel();
  //   option.DataService = this.view?.dataService;
  //   option.FormModel = this.view?.formModel;
  //   option.Width = '550px';
  //   this.dialog = this.callfc.openSide(PopupAddRoomsComponent, this.dataSelected, option);
  //   this.dialog.closed.subscribe((e) => {
  //     if (e?.event) {
  //       e.event.modifiedOn = new Date();
  //       this.view.dataService.update(e.event).subscribe();
  //     }
  //   });
  // });
    this.view.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.view.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.formModel;
      this.dialog = this.callfc.openSide(
        PopupAddRoomsComponent,
        [this.dataSelected, true,this.popupTitle],
        option
      );
    });
  }

  edit(obj?) {
    if (obj) {
      this.view.dataService.dataSelected = obj;
      this.view.dataService
        .edit(this.view.dataService.dataSelected)
        .subscribe((res) => {
          this.dataSelected = this.view?.dataService?.dataSelected;
          let option = new SidebarModel();
          option.Width = '550px';
          option.DataService = this.view?.dataService;
          option.FormModel = this.formModel;
          this.dialog = this.callfc.openSide(
            PopupAddRoomsComponent,
            [this.view.dataService.dataSelected, false,this.popupTitle],
            option
          );
        });
    }
  }

  delete(obj?) {
    this.view.dataService.methodDelete = 'DeleteResourceAsync';
    if (obj) {
      this.view.dataService.delete([obj], true).subscribe((res) => {
        if (res) {          
          this.api
          .execSv(
            'DM',
            'ERM.Business.DM',
            'FileBussiness',
            'DeleteByObjectIDAsync',
            [obj.recID, 'EP_Rooms', true]
          )
          .subscribe();
        this.detectorRef.detectChanges();
      }
      });
    }
  }

  // delete(data?) {
  //   this.view.dataService.delete([data], true, (opt) => {
  //       opt.service = 'EP';
  //       opt.assemblyName = 'ERM.Business.EP';
  //       opt.className = 'ResourcesBusiness';
  //       opt.methodName = 'DeleteResourceAsync';
  //       opt.data = data?.recID;
  //       return true;
  //     })
  //     .subscribe((res: any) => {
  //       if (res) {          
  //         this.api
  //           .execSv(
  //             'DM',
  //             'ERM.Business.DM',
  //             'FileBussiness',
  //             'DeleteByObjectIDAsync',
  //             [res.recID, 'EP_Rooms', true]
  //           )
  //           .subscribe();
  //         this.detectorRef.detectChanges();
  //       }
  //     });
  // }

  // closeDialog(evt?) {
  //   this.dialog && this.dialog.close();
  // }
}
