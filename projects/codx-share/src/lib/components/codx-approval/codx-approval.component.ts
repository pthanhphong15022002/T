import {
  Component,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnInit,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  CallFuncService,
  CodxService,
  DialogModel,
  NotificationsService,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { PopupSignForApprovalComponent } from 'projects/codx-es/src/lib/sign-file/popup-sign-for-approval/popup-sign-for-approval.component';
import { DispatchService } from '../../../../../codx-od/src/lib/services/dispatch.service';

@Component({
  selector: 'codx-approval',
  templateUrl: './codx-approval.component.html',
  styleUrls: ['./codx-approval.component.scss'],
})
export class CodxApprovalComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('view') view!: ViewsComponent;
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  @Input() tmpHeader?: TemplateRef<any>;
  @Input() tmpBody?: TemplateRef<any>;
  @Input() tmpDetail?: TemplateRef<any>;
  @Output() selectedChange = new EventEmitter<any>();
  funcID: any;
  transID: any;
  views: Array<ViewModel> | any = [];
  button?: ButtonModel;
  gridViewSetup: any;
  dvlApproval: any;
  dataItem: any;
  lstDtDis: any;
  lstUserID: any;
  /**
   *
   */
  constructor(
    private router: Router,
    private api: ApiHttpService,
    private cache: CacheService,
    private odService: DispatchService,
    private detectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private codxService: CodxService,
    private notifySvr: NotificationsService,
    private callfunc: CallFuncService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {}
  ngOnInit(): void {}
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.template,
          //panelLeftRef: this.panelLeft,
          panelRightRef: this.panelRight,
          contextMenu: '',
        },
      },
    ];
    this.button = {
      id: 'btnAdd',
    };
    this.getGridViewSetup(this.view.formModel.funcID);
    this.detectorRef.detectChanges();
  }

  click(e: any) {}
  openFormFuncID(e: any) {}
  valueChange(dt: any) {
    this.transID = null;
    if (dt?.data) {
      if (dt?.data[0]) {
        this.transID = dt.data[0].transID;
        this.dataItem = dt?.data[0];
      } else {
        this.transID = dt?.data?.transID;
        this.dataItem = dt?.data;
      }
    } else if (dt?.transID) {
      this.transID = dt.transID;
      this.dataItem = dt;
    }
    this.cache.functionList(this.dataItem?.functionID).subscribe((fuc) => {
      debugger;
      if (fuc) {
        var params;
        if (fuc?.url) {
          params = fuc?.url.split('/');
          this.codxService.navigate(
            '',
            '/es/approvals/EST021/' +
              params[1] +
              '/' +
              fuc?.functionID +
              '/' +
              this.dataItem?.transID
          );
        }

        ///es/approvals/EST021/
        //const queryParams = { 'id' : this.dataItem?.transID};

        //this.router.navigate(['tester/od/approvals/ODT71/'+params[1]+"/"+fuc?.functionID]);
      }
      //this.router.navigate([{ outlets: { 'detail': ['/tester/'+fuc?.url+'/detail'] } }], { skipLocationChange: true });
      //this.router.navigate([ { outlets: { primary:['/tester/od/dispatches/'+fuc?.url+'/detail', 'test1'] } }]);
      //this.router.navigate(['/tester/od/dispatches/'+fuc?.url+'/detail'])
      //this.codxService.navigate("","",{})
    });
    this.selectedChange.emit([this.dataItem, this.view]);
  }

  getGridViewSetup(funcID: any) {
    this.cache.valueList('ES022').subscribe((item) => {
      this.dvlApproval = item?.datas[0];
      //this.ref.detectChanges();
    });
    /*  this.cache.functionList('ODT31').subscribe((fuc) => {

        this.cache
          .gridViewSetup(fuc?.formName, fuc?.gridViewName)
          .subscribe((grd) => {
            this.gridViewSetup = grd;
          });
      }); */
    //formName: string, gridName: string
  }
  setStyles(bg: any): any {
    let styles = {
      backgroundColor: bg,
    };
    return styles;
  }
  changeMF(data: any, value: object = null) {
    var datas = this.dataItem;
    if (value) datas = value;
    if (datas) {
      var list = data.filter(
        (x) =>
          x.data != null &&
          x.data.formName == 'Approvals' &&
          x.functionID != 'SYS206' &&
          x.functionID != 'SYS205'
      );
      for (var i = 0; i < list.length; i++) {
        list[i].disabled = true;
        if (
          ((datas?.stepType == 'S1' || datas?.stepType == 'S2') &&
            list[i].functionID == 'SYS202') ||
          ((datas?.stepType == 'A1' ||
            datas?.stepType == 'R' ||
            datas?.stepType == 'C') &&
            list[i].functionID == 'SYS203') ||
          (datas?.stepType == 'S3' && list[i].functionID == 'SYS204') ||
          (datas?.stepType == 'A2' && list[i].functionID == 'SYS201')
        ) {
          list[i].disabled = false;
          //list[i].isbookmark = true
        }
      }
      var list2 = data.filter(
        (x) =>
          x.functionID == 'SYS02' ||
          x.functionID == 'SYS01' ||
          x.functionID == 'SYS03' ||
          x.functionID == 'SYS04'
      );
      for (var i = 0; i < list2.length; i++) {
        list2[i].disabled = true;
      }
    }
  }
  clickMF(e: any, data: any) {
    //Duyệt SYS201 , Ký SYS202 , Đồng thuận SYS203 , Hoàn tất SYS204 , Từ chối SYS205 , Làm lại SYS206
    var funcID = e?.functionID;
    if (data.processType == 'ES_SignFiles') {
      //Kys
      if (
        funcID == 'SYS202' ||
        funcID == 'SYS205' ||
        funcID == 'SYS206' ||
        funcID == 'SYS204' ||
        funcID == 'SYS203' ||
        funcID == 'SYS202'
      ) {
        debugger;
        let option = new SidebarModel();
        option.Width = '800px';
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;

        let dialogModel = new DialogModel();
        dialogModel.IsFull = true;
        let dialogApprove = this.callfunc.openForm(
          PopupSignForApprovalComponent,
          'Thêm mới',
          700,
          650,
          this.funcID,
          {
            funcID: 'EST021',
            recID: data.transID,
          },
          '',
          dialogModel
        );
        // dialogApprove.closed.subscribe((x) => {
        //   if (x.event) {
        //     delete x.event._uuid;
        //     this.view.dataService.add(x.event, 0).subscribe();
        //     //this.getDtDis(x.event?.recID)
        //   }
        // });
      }

      //hoan tat
      // else if (funcID == 'SYS204') {

      // }
    } else if (data.processType != 'ES_SignFiles') {
      var status;
      if (
        funcID == 'SYS201' ||
        funcID == 'SYS202' ||
        funcID == 'SYS203' ||
        funcID == 'SYS204'
      )
        status = '5';
      else if (funcID == 'SYS205') status = '4';
      else if (funcID == 'SYS206') status = '6';
      this.api
        .execSv(
          'ES',
          'ERM.Business.ES',
          'ApprovalTransBusiness',
          'ApproveAsync',
          [data?.recID, status, '', '']
        )
        .subscribe((res2: any) => {
          if (!res2?.msgCodeError) {
            this.view.dataService.update(data).subscribe();
            this.notifySvr.notifyCode('SYS007');
          } else this.notifySvr.notify(res2?.msgCodeError);
        });
    }
  }

  approve(data) {}
}
