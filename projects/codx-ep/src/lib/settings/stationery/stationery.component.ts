import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  DataRequest,
  DialogRef,
  FormModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';
import { PopupAddQuotaComponent } from './popup-add-quota/popup-add-quota.component';
import { PopupAddStationeryComponent } from './popup-add-stationery/popup-add-stationery.component';
import { PopupUpdateQuantityComponent } from './popup-update-quantity/popup-update-quantity.component';

@Component({
  selector: 'setting-stationery',
  templateUrl: './stationery.component.html',
  styleUrls: ['./stationery.component.scss'],
})
export class StationeryComponent extends UIComponent implements AfterViewInit {
  @ViewChild('columnsList') columnsList: TemplateRef<any>;
  @ViewChild('templateListCard') templateListCard: TemplateRef<any>;
  viewType = ViewType;
  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  devices: any;
  columnsGrid: any;
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';
  dialog!: DialogRef;
  model: DataRequest;
  formModel: FormModel;
  grvStationery: any;
  moreFuncs = [
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

  popupTitle: string = '';
  funcIDName: string = '';
  popupClosed = true;

  constructor(
    private injector: Injector,
    private epService: CodxEpService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.epService.getFormModel(this.funcID).then((res) => {
      this.formModel = res;
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.funcIDName = res.customName.toString().toLowerCase();
      }
    });
  }

  onLoading(evt: any) {
    let formModel = this.view.formModel;
    if (formModel) {
      this.cache
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          this.grvStationery = gv;
          this.views = [
            {
              type: ViewType.card,
              sameData: true,
              active: true,
              model: {
                template: this.templateListCard,
              },
            },
            {
              type: ViewType.list,
              sameData: true,
              active: false,
              model: {
                template: this.columnsList,
              },
            },
          ];
          this.detectorRef.detectChanges();
        });
    }
  }
  ngAfterViewInit(): void {
    this.view.dataService.methodDelete = 'DeleteResourceAsync';

    this.buttons = {
      id: 'btnAdd',
    };

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
    this.detectorRef.detectChanges();
  }

  click(evt: ButtonModel) {
    this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
    }
  }

  clickMF(evt, data) {
    this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'EPS2301':
        this.updateQuantity(data);
        break;
      case 'EPS2302':
        this.addQuota(data);
        break;
      default:
        break;
    }
  }

  changeDataMF(e: any, data: any) {
    if (e != null && data != null) {
      e.forEach((func) => {
        if (
          func.functionID == 'SYS02' /*MF sửa*/ ||
          func.functionID == 'SYS03' /*MF xóa*/ ||
          func.functionID == 'SYS04' /*MF chép*/
        ) {
          func.disabled = false;
        }
      });
    }
  }

  addNew() {
    if (this.popupClosed) {
      this.view.dataService.addNew().subscribe((res) => {
        this.popupClosed = false;
        let dataSelected = this.view.dataService.dataSelected;
        let option = new SidebarModel();
        option.Width = '800px';
        option.DataService = this.view?.dataService;
        option.FormModel = this.formModel;
        let dialog = this.callfc.openSide(
          PopupAddStationeryComponent,
          [dataSelected, true, this.popupTitle],
          option
        );
        dialog.closed.subscribe((x) => {
          this.popupClosed = true;
          if (!x.event) this.view.dataService.clear();
          if (x.event == null && this.view.dataService.hasSaved)
            this.view.dataService
              .delete([this.view.dataService.dataSelected])
              .subscribe((x) => {
                this.changeDetectorRef.detectChanges();
              });
          else if (x.event) {
            x.event.modifiedOn = new Date();
            this.view.dataService.update(x.event).subscribe();
          }
        });
      });
    }
  }

  edit(data?) {
    if (data) {
      data.uMID = data.umid;
      this.view.dataService.dataSelected = data;if (this.popupClosed) {
        this.view.dataService
          .edit(this.view.dataService.dataSelected)
          .subscribe((res) => {
            this.popupClosed = false;
            let dataSelected = this.view?.dataService?.dataSelected;
            let option = new SidebarModel();
            option.Width = '800px';
            option.DataService = this.view?.dataService;
            option.FormModel = this.formModel;
            this.dialog = this.callfc.openSide(
              PopupAddStationeryComponent,
              [dataSelected, false, this.popupTitle],
              option
            );
            this.dialog.closed.subscribe((x) => {
              this.popupClosed = true;
              if (!x.event) this.view.dataService.clear();
              if (x?.event) {
                x.event.modifiedOn = new Date();
                this.view.dataService.update(x.event).subscribe((res) => {});
              }
            });
          });
      }
    }

    
  }

  copy(data) {
    if (data) {
      data.uMID = data.umid;
      this.view.dataService.dataSelected = data;
      if (this.popupClosed) {
        this.view.dataService
          .copy(this.view.dataService.dataSelected)
          .subscribe((res) => {
            this.popupClosed = false;
            let dataSelected = this.view?.dataService?.dataSelected;
            let option = new SidebarModel();
            option.Width = '800px';
            option.DataService = this.view?.dataService;
            option.FormModel = this.formModel;
            this.dialog = this.callfc.openSide(
              PopupAddStationeryComponent,
              [dataSelected, true, this.popupTitle],
              option
            );
            this.dialog.closed.subscribe((x) => {
              this.popupClosed = true;
              if (!x.event) this.view.dataService.clear();
              if (x?.event) {
                x.event.modifiedOn = new Date();
                this.view.dataService.update(x.event).subscribe((res) => {});
              }
            });
          });
      }
    }

    
  }

  delete(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .delete([this.view.dataService.dataSelected])
      .subscribe();
  }

  addQuota(data) {
    this.callfc.openForm(PopupAddQuotaComponent, '', 500, null, '', [data]);
  }

  updateQuantity(data) {
    this.callfc
      .openForm(PopupUpdateQuantityComponent, '', 500, null, '', [
        data,
        this.view.dataService,
      ])
      .closed.subscribe((x) => {
        debugger;
        if (!x.event) this.view.dataService.clear();
        if (x.event == null && this.view.dataService.hasSaved)
          this.view.dataService
            .delete([this.view.dataService.dataSelected])
            .subscribe((x) => {
              this.changeDetectorRef.detectChanges();
            });
        else if (x.event) {
          x.event.modifiedOn = new Date();
          this.view.dataService.update(x.event).subscribe();
        }
      });
  }

  closeEditForm(evt?: any) {
    if (evt) {
      this.dialog && this.dialog.close();
    }
  }
}
