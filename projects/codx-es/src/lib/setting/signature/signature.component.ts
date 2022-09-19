import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  AuthService,
  ButtonModel,
  CallFuncService,
  DialogRef,
  FormModel,
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
import { CodxEsService } from '../../codx-es.service';

export class defaultRecource {}
@Component({
  selector: 'signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss'],
})
export class SignatureComponent implements OnInit, AfterViewInit {
  @ViewChild('viewBase') viewBase: ViewsComponent;
  @ViewChild('listItem') listItem: TemplateRef<any>;
  @ViewChild('gridView') gridView: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('gridTemplate') grid: TemplateRef<any>;
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('sideBarRightRef') sideBarRightRef: TemplateRef<any>;
  @ViewChild('signatureType', { static: true }) signatureType;
  @ViewChild('supplier', { static: true }) supplier;
  @ViewChild('oTPControl', { static: true }) oTPControl;
  @ViewChild('noName', { static: true }) noName;
  @ViewChild('createdBy', { static: true }) createdBy;
  @ViewChild('editSignature') editSignature: PopupAddSignatureComponent;
  @ViewChild('imageStamp', { static: true }) imageStamp;
  @ViewChild('imageSignature1', { static: true }) imageSignature1;
  @ViewChild('imageSignature2', { static: true }) imageSignature2;
  isAfterRender = false;

  devices: any;
  editform: FormGroup;
  isAdd = true;
  columnsGrid;
  dataSelected: any;
  dialog!: DialogRef;
  formModel: FormModel;

  constructor(
    private callfunc: CallFuncService,
    private cr: ChangeDetectorRef,
    private readonly auth: AuthService,
    private activedRouter: ActivatedRoute,
    private esService: CodxEsService
  ) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.esService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
        this.isAfterRender = true;
      }
    });
  }

  views: Array<ViewModel> = [];
  moreFunc: Array<ButtonModel> = [];
  ngOnInit(): void {}

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

    this.button = {
      id: 'btnAdd',
    };

    this.columnsGrid = [
      {
        field: 'email',
        headerText: 'Email',
        template: '',
        width: 200,
      },
      {
        field: 'fullName',
        headerText: 'Tên',
        template: '',
        width: 200,
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
        textAlign: 'Center',
      },
      {
        field: 'signature2',
        headerText: 'Chữ kí nháy',
        template: this.imageSignature2,
        width: 150,
        textAlign: 'Center',
      },
      {
        field: 'stamp',
        headerText: 'Con dấu',
        template: this.imageStamp,
        width: 150,
        textAlign: 'Center',
      },
      {
        field: 'otpControl',
        headerText: 'OTP',
        template: this.oTPControl,
        width: 150,
      },
    ];
    this.views = [
      {
        sameData: true,
        type: ViewType.list,
        active: false,
        model: {
          template: this.listItem,
        },
      },
      {
        sameData: true,
        type: ViewType.grid,
        active: true,
        model: {
          resources: this.columnsGrid,
        },
      },
    ];

    this.cr.detectChanges();
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

  addNew(evt?: any) {
    this.viewBase.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.viewBase.dataService;
      option.FormModel = this.viewBase.formModel;
      option.Width = '550px';
      let dialogAdd = this.callfunc.openSide(
        PopupAddSignatureComponent,
        { isAdd: true },
        option
      );
      dialogAdd.closed.subscribe((x) => {
        if (x.event == null && this.viewBase.dataService.hasSaved)
          this.viewBase.dataService
            .delete([this.viewBase.dataService.dataSelected])
            .subscribe((x) => {
              this.cr.detectChanges();
            });
        else if (x.event) {
          x.event.modifiedOn = new Date();
          this.viewBase.dataService.update(x.event).subscribe();
        }
      });
    });
  }

  edit(evt?) {
    if (evt) {
      this.viewBase.dataService.dataSelected = evt;

      this.viewBase.dataService
        .edit(this.viewBase.dataService.dataSelected)
        .subscribe((res) => {
          this.dataSelected = this.viewBase.dataService.dataSelected;
          let option = new SidebarModel();
          option.Width = '550px';
          option.DataService = this.viewBase?.dataService;
          option.FormModel = this.viewBase?.formModel;

          let dialogEdit = this.callfunc.openSide(
            PopupAddSignatureComponent,
            [evt, false],
            option
          );
          dialogEdit.closed.subscribe((x) => {
            if (x.event) {
              x.event.modifiedOn = new Date();
              this.viewBase.dataService.update(x.event).subscribe((res) => {
                console.log('update', res);
              });
            }
          });
        });
    }
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

  closeEditForm(event) {
    //this.dialog && this.dialog.close();
  }

  clickMF(event: any, data) {
    switch (event?.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
    }
  }
}
