import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';
import { ApiHttpService, CacheService } from 'codx-core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TITLE_HEADER_CLASS } from '@syncfusion/ej2-pivotview/src/common/base/css-constant';

export class defaultRecource {}
@Component({
  selector: 'settings',
  templateUrl: 'driver.component.html',
  styleUrls: ['driver.component.scss'],
})
export class DriverBookingComponent implements OnInit {
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('popupDevice', { static: true }) popupDevice;

  devices: any;

  defaultRecource: any = {
    resourceName: '',
    ranking: '1',
    category: '1',
    area: '',
    capacity: '',
    location: '',
    companyID: '1',
    owner: '',
    note: '',
    resourceType: '',
    icon: '',
    equipments: '',
  };
  editform: FormGroup;
  isAdd = true;
  constructor(
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private cr: ChangeDetectorRef
  ) {}

  vllDevices = [];
  lstDevices = [];
  tmplstDevice = [];

  views: Array<ViewModel> = [
    {
      id: '1',
      type: 'content',
      active: true,
    },
    {
      id: '2',
      type: 'grid',
      active: false,
    },
  ];

  ngOnInit(): void {


}
}
