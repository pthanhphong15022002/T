import {
  Component,
  TemplateRef,
  Injector,
  ViewChild,
  Input,
  AfterViewInit,
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
import { CodxEpService } from '../../codx-ep.service';
import { PopupAddDriversComponent } from './popup-add-drivers/popup-add-drivers.component';

@Component({
  selector: 'setting-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss'],
})
export class DriversComponent extends UIComponent implements AfterViewInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('rankingCol') rankingCol: TemplateRef<any>;
  @ViewChild('statusCol') statusCol: TemplateRef<any>;
  @ViewChild('categoryCol') categoryCol: TemplateRef<any>;
  @ViewChild('icon', { static: true }) icon: TemplateRef<any>;
  @ViewChild('avatar') avatar: TemplateRef<any>;
  @ViewChild('owner') owner: TemplateRef<any>;

  @Input() data!: any;

  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '3';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';

  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  buttons: ButtonModel;

  funcID: string;
  columnsGrid;
  dataSelected: any;
  dialog!: DialogRef;
  formModel: FormModel;
  // fGroupAddDriver: FormGroup;
  // dialogRef: DialogRef;
  isAfterRender = false;

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
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
    this.codxEpService.getFormModel(this.funcID).then((fModel) => {
      this.cache
        .gridViewSetup(fModel.formName, fModel.gridViewName)
        .subscribe((gv) => {
          console.log(gv);
        });

      this.columnsGrid = [
        {
          field: 'resourceID',
          headerText: 'Mã lái xe', //gv['resourceID'].headerText,
        },
        {
          field: 'icon',
          headerText: 'Ảnh đại diện',
          template: this.avatar,
        },
        {
          field: 'resourceName',
          headerText: 'Tên lái xe',
        },
        // {
        //   headerText: 'Tình trạng',
        //   template: this.statusCol,
        // // },
        // {
        //   headerText: 'Xếp hạng',
        //   template: this.rankingCol,
        // },
        {
          headerText: 'Nguồn',
          template: this.categoryCol,
        },
        {
          headerText: 'Người điều phối',
          width: '20%',
          template: this.owner,
        },
      ];

      this.views = [
        {
          sameData: true,
          type: ViewType.grid,
          active: true,
          model: {
            resources: this.columnsGrid,
          },
        },
      ];
      this.detectorRef.detectChanges();
    });
  }

  click(event: ButtonModel) {
    switch (event.id) {
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
        PopupAddDriversComponent,
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
            PopupAddDriversComponent,
            [this.viewBase.dataService.dataSelected, false],
            option
          );
        });
    }
  }

  // delete(obj?) {
  //   if (obj) {
  //     this.viewBase.dataService.delete([obj], true).subscribe((res) => {
  //       console.log(res);
  //     });
  //   }
  // }

  delete(data?: any) {
    this.viewBase.dataService.dataSelected = data;
    this.viewBase.dataService
      .delete([this.viewBase.dataService.dataSelected], true)
      .subscribe((res: any) => {
        if (res.data) {
          this.codxEpService.deleteFile(res.data.recID, this.formModel.entityName, true);
        }
      });
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

  closeDialog(evt?) {
    this.dialog && this.dialog.close();
  }
}
