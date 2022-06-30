import { ChangeDetectorRef, Component, Injector, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiHttpService, ButtonModel, CodxService, LayoutService, NotificationsService, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'lib-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css']
})
export class CertificatesComponent implements OnInit {

  @Input() functionObject;
  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('itemCreate', { static: true }) itemCreate: TemplateRef<any>;
  @ViewChild('itemStopCheck', { static: true }) itemStopCheck: TemplateRef<any>;

  views: Array<ViewModel> = [];
  button?: ButtonModel;
  itemSelected: any;


  today: any = new Date();
  addEditForm: FormGroup;
  dataItem: any = {};
  isOpen = false;
  myModel = {
    template: null
  };
  searchType = "0";
  predicate: string = "";
  dataValue: string = "";
  lstElastisSearch: any;
  isAfterRender = false;
  columnsGrid = [];

  constructor(private fb: FormBuilder,
    private api: ApiHttpService,
    private notificationsService: NotificationsService,
    private changedr: ChangeDetectorRef,
    // private mainService: MainService,
    private layoutService: LayoutService,
    // private sds: SystemDialogService,
    injector: Injector,
    // private baseService: BaseService,
    // private confirmationDialogService: ConfirmationDialogService,
  ) {
  
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          resources: this.columnsGrid,
          // template: this.grid,
        }
      },
      // {
      //   id: '2',
      //   type: ViewType.card,
      //   active: true,
      //   sameData: true,
      //   model: {
      //     template: this.cardTemp,
      //   }
      // },

    ];
    this.changedr.detectChanges();
  }

  ngOnInit(): void {
    this.columnsGrid = [
      { field: '', headerText: '', template: this.GiftIDCell, width: 30 },
      { field: 'certificateID', headerText: 'Mã', width: 100 },
      { field: 'certificateName', headerText: 'Bằng cấp - Chứng chỉ', width: 150 },
      { field: 'searchName', headerText: 'Tên khác', width: 140 },
      { field: 'stop', headerText: 'Ngưng sử dụng', template: this.itemStopCheck, width: 100 },
      { field: 'createName', headerText: 'Người tạo', template: this.itemCreateBy, width: 100 },
      { field: 'createdOn', headerText: 'Ngày tạo', template: this.itemCreate, width: 100 }
    ];
  }


  headerStyle = {
    textAlign: 'center',
    backgroundColor: '#F1F2F3',
    fontWeight: 'bold',
    border: 'none'
  }
  columnStyle = {
    border: 'none',
    fontSize: '13px !important',
    fontWeight: 400,
    lineHeight: 1.4
  }
  isAddMode = true;

  valueChange(e, element) {
    if (e.field === "stop")
      this.addEditForm.patchValue({ stop: e.data })
  }
  
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        // this.add();
        break;
    }
  }

  changeView(evt: any) { }

  requestEnded(evt: any) {
  }
  
}
