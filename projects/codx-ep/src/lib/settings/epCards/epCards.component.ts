import { CodxEpService } from './../../codx-ep.service';
import {
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
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
import { PopupAddEpCardsComponent } from './popup-add-epCards/popup-add-epCards.component';

@Component({
  selector: 'setting-epCards',
  templateUrl: 'epCards.component.html',
  styleUrls: ['epCards.component.scss'],
})
export class EpCardsComponent extends UIComponent implements AfterViewInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('avatarCol') avatarCol: TemplateRef<any>;
  funcID: string;
  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  formModel: FormModel;
  dialog!: DialogRef;
  columnGrids: any;
  dataSelected: any;
  isAfterRender = false;
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '5';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
        this.isAfterRender = true;
      }
    });
  }

  onInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
  }

  ngAfterViewInit(): void {
    this.buttons = {
      id: 'btnAdd',
    };
    this.moreFuncs = [
      {
        id: 'btnViewHistory',
        icon: 'icon-list-checkbox',
        text: 'Lịch sử sử dụng thẻ',
      },
    ];
    this.codxEpService.getFormModel(this.funcID).then((formModel) => {
      this.cache
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          this.columnGrids = [
            {
              field: 'code',
              headerText: gv['ResourceID'].headerText,
              width: gv['ResourceID'].width,
            },
            {
              field: 'resourceName',
              headerText: gv['ResourceName'].headerText,
              width: gv['ResourceName'].width,
            },
            {
              headerText: gv['Icon'].headerText,
              width: gv['Icon'].width,
              template: this.avatarCol,
              textAlign: 'Center',
              headerTextAlign: 'Center',
            },
            {
              field: 'status',
              headerText: gv['Status'].headerText,
              width: gv['Status'].width,
            },
            {
              field: 'note',
              headerText: gv['Note'].headerText,
              width: gv['Note'].width,
            },
            {
              field: 'owner',
              headerText: gv['Owner'].headerText,
              width: gv['Owner'].width,
            },
          ];
          this.views = [
            {
              sameData: true,
              id: '1',
              text: 'Danh mục thẻ xe',
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
      case 'btnViewHistory':
        this.viewHistory();
        break;
    }
  }

  addNew() {
    this.viewBase.dataService.addNew().subscribe((res) => {
      debugger;
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.viewBase?.dataService;
      option.FormModel = this.formModel;
      this.dialog = this.callfc.openSide(
        PopupAddEpCardsComponent,
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
            PopupAddEpCardsComponent,
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

  viewHistory() {
    
  }

  onSelect(obj: any) {
    console.log(obj);
  }

  closeDialog(evt?) {
    this.dialog && this.dialog.close();
  }
}
