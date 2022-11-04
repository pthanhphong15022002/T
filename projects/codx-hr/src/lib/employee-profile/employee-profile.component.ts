import {
  Component,
  Injector,
  OnInit,
  Optional,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../codx-hr.service';

@Component({
  selector: 'lib-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss'],
})
export class EmployeeProfileComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
  }

  @ViewChild('itemTemplate') template: TemplateRef<any>;
  @ViewChild('paneRight') panelRight: TemplateRef<any>;

  views: Array<ViewModel> | any = [];

  statusVll = 'L0225';
  funcID = '';
  service = '';
  assemblyName = '';
  entity = '';
  className = '';
  idField = 'recID';

  itemDetail;

  vllTabs = [
    { icon: 'icon-apartment', text: 'Thông tin cá nhân' },
    { icon: 'icon-apartment', text: 'Thông tin công việc' },
    { icon: 'icon-apartment', text: 'Phúc Lợi' },
    { icon: 'icon-apartment', text: 'Quá trình nhân sự' },
    { icon: 'icon-apartment', text: 'Kiến thức' },
    { icon: 'icon-apartment', text: 'Khen thưởng' },
    { icon: 'icon-apartment', text: 'Kỷ luật' },
    { icon: 'icon-apartment', text: 'Sức khỏe' },
    { icon: 'icon-apartment', text: 'Thôi việc' },
  ];
  sampleData = {
    employeeID: '012.MPDF',
    joinedOn: '10/03/2015',
    status: '',
    orgUnitID: '',
    email: 'lphthuong@lacviet.com.vn',
    phone: '#LinePhone',
    mobile: '0907323495',
  };
  onInit(): void {
    console.log('data', this.sampleData);
  }

  ngAfterViewInit(): void {
    this.view.dataService.methodDelete = 'DeleteSignFileAsync';
    this.views = [
      {
        id: '1',
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.template,
          panelRightRef: this.panelRight,
          contextMenu: '',
        },
      },
    ];
    this.df.detectChanges();
  }

  changeItemDetail(item) {}
}
