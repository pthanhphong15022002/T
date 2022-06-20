import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ApiHttpService, CacheService, ViewModel, ViewType } from 'codx-core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TITLE_HEADER_CLASS } from '@syncfusion/ej2-pivotview/src/common/base/css-constant';
import { RouterModule, Routes } from '@angular/router';

export class defaultRecource {}
@Component({
  selector: 'settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.scss'],
})
export class SettingsComponent implements OnInit {
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
      sameData: false,
      id: '1',
      type: ViewType.content,
      active: true,
    },
    {
      sameData: false,
      id: '2',
      type: ViewType.grid,
      active: false,
    },
  ];
  tenant = 'tester';
  public currentActive = 1;
  ngOnInit(): void {}

  scroll(el: HTMLElement, numberActive) {
    el.scrollIntoView({ behavior: 'smooth' });
    this.currentActive = numberActive;
  }
}
