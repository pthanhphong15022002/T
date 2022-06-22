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
  CacheService,
  CodxGridviewComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TITLE_HEADER_CLASS } from '@syncfusion/ej2-pivotview/src/common/base/css-constant';
import { ButtonModel } from '@syncfusion/ej2-angular-buttons/public_api';
import { EditSignatureComponent } from './dialog/editor.component';
import { environment } from 'src/environments/environment';

export class defaultRecource {}
@Component({
  selector: 'signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss'],
})
export class SignatureComponent implements OnInit, AfterViewInit {
  @ViewChild('view') viewBase: ViewsComponent;
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
  @ViewChild('editSignature') editSignature: EditSignatureComponent;
  @ViewChild('imageStamp', { static: true }) imageStamp;
  @ViewChild('imageSignature1', { static: true }) imageSignature1;
  @ViewChild('imageSignature2', { static: true }) imageSignature2;

  devices: any;
  editform: FormGroup;
  isAdd = true;
  columnsGrid;

  constructor(
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private cr: ChangeDetectorRef,
    private readonly auth: AuthService
  ) {}

  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.views = [
      {
        sameData: true,
        id: '1',
        type: ViewType.list,
        active: true,
        model: {
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
  addNew(evt: any) {
    this.cr.detectChanges();
  }

  edit(dataItem) {
    this.editSignature.isAdd = false;
    this.editSignature.dialogSignature.patchValue(dataItem);
    this.editSignature.dialogSignature.patchValue({
      oTPControl: dataItem.otpControl,
    });
    this.editSignature.dialogSignature.addControl(
      'recID',
      new FormControl(dataItem.recID, Validators.required)
    );
    this.cr.detectChanges();
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
