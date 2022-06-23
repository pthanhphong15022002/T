import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  ApiHttpService,
  AuthService,
  ButtonModel,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  DialogRef,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { PopupAddSignatureComponent } from './popup-add-signature/popup-add-signature.component';
import { Thickness } from '@syncfusion/ej2-angular-charts';

export class defaultRecource {}
@Component({
  selector: 'signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss'],
})
export class SignatureComponent implements OnInit, AfterViewInit {
  @ViewChild('base') viewBase: ViewsComponent;
  @ViewChild('listItem') listItem: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('gridTemplate') grid: TemplateRef<any>;
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('sideBarRightRef') sideBarRightRef: TemplateRef<any>;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('signatureType', { static: true }) signatureType;
  @ViewChild('supplier', { static: true }) supplier;
  @ViewChild('oTPControl', { static: true }) oTPControl;
  @ViewChild('noName', { static: true }) noName;
  @ViewChild('createdBy', { static: true }) createdBy;
  @ViewChild('editSignature') editSignature: PopupAddSignatureComponent;
  @ViewChild('imageStamp', { static: true }) imageStamp;
  @ViewChild('imageSignature1', { static: true }) imageSignature1;
  @ViewChild('imageSignature2', { static: true }) imageSignature2;

  devices: any;
  editform: FormGroup;
  isAdd = true;
  columnsGrid;
  dataSelected: any;
  dialog!: DialogRef;

  constructor(
    private api: ApiHttpService,
    private callfunc: CallFuncService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private cr: ChangeDetectorRef,
    private readonly auth: AuthService,
    private activedRouter: ActivatedRoute
  ) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  views: Array<ViewModel> = [];
  moreFunc: Array<ButtonModel> = [];
  ngOnInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }

  button: ButtonModel;
  funcID: string;
  service = 'ES';
  assemblyName = 'ES';
  entityName = 'ES_Signatures';
  predicate = '';
  dataValue = '';
  idField = 'recID';
  className = 'SignaturesBusiness';
  method = 'GetListAsync';

  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteSignatureAsync';
    this.viewBase.dataService.methodSave = 'AddNewAsync';
    this.viewBase.dataService.methodUpdate = 'EditAsync';
    this.views = [
      {
        sameData: true,
        id: '1',
        type: ViewType.list,
        active: true,
        model: {
          template: this.listItem,
        },
      },
    ];

    this.columnsGrid = [
      {
        field: 'email',
        headerText: 'Email',
        template: '',
        width: 150,
      },
      {
        field: 'fullName',
        headerText: 'Tên',
        template: '',
        width: 150,
      },
      {
        field: 'signatureType',
        headerText: 'Phân loại',
        template: this.signatureType,
        width: 150,
      },
      {
        field: 'supplier',
        headerText: 'Nhà cung cấp',
        template: this.supplier,
        width: 150,
      },
      {
        field: 'signature1',
        headerText: 'Chữ kí chính',
        template: this.imageSignature1,
        width: 150,
      },
      {
        field: 'signature2',
        headerText: 'Chữ kí nháy',
        template: this.imageSignature2,
        width: 150,
      },
      {
        field: 'stamp',
        headerText: 'Con dấu',
        template: this.imageStamp,
        width: 150,
      },
      {
        field: 'otpControl',
        headerText: 'OTP',
        template: this.oTPControl,
        width: 150,
      },
      { field: 'noName', headerText: '', template: this.noName, width: 30 },
    ];
    this.cr.detectChanges();
  }

  closeEditForm(event) {}

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
      option.FormModel = this.viewBase?.currentView?.formModel;
      this.dialog = this.callfunc.openSide(
        PopupAddSignatureComponent,
        this.viewBase.dataService.dataSelected,
        option
      );
    });
  }

  edit(evt?) {
    let item = this.viewBase.dataService.dataSelected;
    if (evt) {
      item = evt;
    }
    this.viewBase.dataService.edit(item).subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '750px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;

      this.dialog = this.callfunc.openSide(
        PopupAddSignatureComponent,
        this.viewBase.dataService.dataSelected,
        option
      );
    });
  }

  delete(evt?) {
    let deleteItem = this.viewBase.dataService.dataSelected;
    if (evt) {
      deleteItem = evt;
    }
    this.viewBase.dataService.delete([deleteItem]).subscribe((res) => {
      console.log(res);
    });
  }

  clickMF(event: any, data) {
    switch (event?.functionID) {
      case 'edit':
        this.edit(data);
        break;
      case 'delete':
        this.delete(data);
        break;
    }
  }

  deleteSignature(dataItem) {
    if (confirm('Are you sure to delete')) {
      this.api
        .execSv('ES', 'ES', 'SignaturesBusiness', 'DeleteSignatureAsync', [
          dataItem.recID,
        ])
        .subscribe((res) => {
          if (res) {
            this.gridView.removeHandler(dataItem, 'recID');
          }
        });
    }
  }

  closeSidebar(event) {
    if (event?.dataItem) {
      this.gridView.addHandler(event.dataItem, event.isAdd, event.key);
    }
    this.cr.detectChanges();

    //this.gridView.addHandler(e)
  }

  getLinkImg(data) {
    return `${environment.apiUrl}/api/dm/files/GetImage?id=${data[0]?.recID}&access_token=${this.auth.userValue.token}`;
  }
}
