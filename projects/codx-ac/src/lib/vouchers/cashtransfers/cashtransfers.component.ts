import {
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { AuthStore, ButtonModel, NotificationsService, SidebarModel, TenantStore, UIComponent, ViewModel, ViewType } from 'codx-core';
import { BehaviorSubject, Subject, distinctUntilKeyChanged, takeUntil } from 'rxjs';
import { JournalService } from '../../journals/journals.service';
import { CashtransferAddComponent } from './cashtransfers-add/cashtransfers-add.component';
import { CodxAcService } from '../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-cashtransfers',
  templateUrl: './cashtransfers.component.html',
  styleUrls: ['./cashtransfers.component.scss'],
})
export class CashtransfersComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = []; // model view
  @ViewChild('templateDetailLeft') templateDetailLeft?: TemplateRef<any>; //? template view danh sách chi tiết (trái)
  @ViewChild('templateDetailRight') templateDetailRight: TemplateRef<any>; //? template view danh sách chi tiết (phải)
  @ViewChild('listTemplate') listTemplate?: TemplateRef<any>; //? template view danh sách
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>; //? template view lưới
  headerText: any; 
  journalNo: string; 
  dataCategory: any; 
  runmode: any;
  itemSelected: any; 
  journal: any; 
  baseCurr: any;
  dataDefault: any;
  hideFields: Array<any> = [];
  button: ButtonModel[] = [{
    //? nút thêm phiếu
    id: 'btnAdd',
    icon: 'icon-i-file-earmark-plus',
  }];
  viewActive:number = ViewType.listdetail;
  ViewType = ViewType;
  optionSidebar: SidebarModel = new SidebarModel();
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private authStore: AuthStore,
    private shareService: CodxShareService,
    private notification: NotificationsService,
    private tenant: TenantStore,
    private journalService: JournalService
  ) {
    super(inject);
    this.cache
      .companySetting()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.length > 0) {
          this.baseCurr = res[0].baseCurr; //? get đồng tiền hạch toán
        }
      });
    this.router.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.journalNo = params?.journalNo; //? get số journal từ router
      });
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    //this.getJournal(); //? lấy data journal và các field ẩn từ sổ nhật kí
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngAfterViewInit() {
    
    this.cache
      .functionList(this.view.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.headerText = res?.defaultName; //? lấy tên chứng từ (Phiếu chi)
        }
      });

    this.views = [
      {
        type: ViewType.listdetail, //? thiết lập view danh sách chi tiết
        active: true,
        sameData: true,
        model: {
          template: this.templateDetailLeft,
          panelRightRef: this.templateDetailRight,
          collapsed: true,
          widthLeft: '23%',
          //separatorSize:3
        },
      },
      {
        type: ViewType.list, //? thiết lập view danh sách
        active: false,
        sameData: true,
        model: {
          template: this.listTemplate,
        },
      },
      {
        type: ViewType.grid, //? thiết lập view lưới
        active: false,
        sameData: true,
        model: {
          template2: this.templateGrid,
        },
      },
    ];
    this.journalService.setChildLinks(this.journalNo);

    this.optionSidebar.DataService = this.view?.dataService;
    this.optionSidebar.FormModel = this.view?.formModel;
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  /**
   * *Hàm hủy các obsevable subcrible
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion Init

  //#region Event
   /**
   * * Hàm xử lí click toolbar
   * @param event
   */
   toolbarClick(event) {
    switch (event.id) {
      case 'btnAdd':
        //this.addNewVoucher(); //? thêm mới chứng từ
        break;
    }
  }

  /**
   * *Hàm click các morefunction
   * @param event
   * @param data
   */
  clickMoreFunction(e, data) {}

  /**
   * * Hàm get data và get dữ liệu chi tiết của chứng từ khi được chọn
   * @param event
   * @returns
   */
  onSelectedItem(event) {
    this.itemSelected = event;
    this.detectorRef.detectChanges();
    // if (this.view?.views) {
    //   let view = this.view?.views.find((x) => x.type == 1);
    //   if (view && view.active == true) return;
    // }
    // if (typeof event.data !== 'undefined') {
    //   if (event?.data.data || event?.data.error) {
    //     return;
    //   } else {
    //     this.itemSelected = event?.data;
    //     this.detectorRef.detectChanges();
    //   }
    // }
  }

  viewChanged(view) {
    if(view && view?.view?.type == this.viewActive) return;
    this.viewActive = view?.view?.type;
    this.detectorRef.detectChanges();
  }

  /**
   * *Hàm ẩn hiện các morefunction của từng chứng từ ( trên view danh sách và danh sách chi tiết)
   * @param event : danh sách morefunction
   * @param data
   * @returns
   */
  changeMFDetail(event: any, data: any, type: any = '') {
    if (data) {
      //this.acService.changeMFCashPayment(event,data,type,this.journal,this.view.formModel);
    }
  }
  //#endregion Event

  //#region Function
  //#endregion Function
}
