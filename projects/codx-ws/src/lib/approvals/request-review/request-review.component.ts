import { AfterViewInit, Component, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModel, CallFuncService, DialogModel, NotificationsService, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { TabModel } from 'projects/codx-ep/src/lib/models/tabControl.model';
import { PopupSignForApprovalComponent } from 'projects/codx-es/src/lib/sign-file/popup-sign-for-approval/popup-sign-for-approval.component';
import { CodxEsService } from 'projects/codx-es/src/public-api';
import { DispatchService } from 'projects/codx-od/src/lib/services/dispatch.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'lib-request-review',
  templateUrl: './request-review.component.html',
  styleUrls: ['./request-review.component.css']
})
export class RequestReviewComponent
  extends UIComponent
  implements OnChanges, AfterViewInit
{
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  @Input() tmpHeader?: TemplateRef<any>;
  @Input() tmpBody?: TemplateRef<any>;
  @Input() tmpDetail?: TemplateRef<any>;
  @Output() selectedChange = new EventEmitter<any>();
  funcID: any;
  transID: any;
  recID: any;
  views: Array<ViewModel> | any = [];
  button?: ButtonModel;
  gridViewSetup: any;
  dvlApproval: any;
  dataItem: any;
  lstDtDis: any;
  lstUserID: any;
  listApproveMF: any = [];

  tabControl: TabModel[] = [];
  /**
   *
   */
  odService: DispatchService;
  codxShareService: CodxShareService;
  notifySvr: NotificationsService;
  callfunc: CallFuncService;
  esService: CodxEsService;
  routers: Router;
  allMFunc: any;
  constructor(inject: Injector) {
    super(inject);
    this.routers = inject.get(Router);
    this.odService = inject.get(DispatchService);
    (this.codxShareService = inject.get(CodxShareService)),
      (this.notifySvr = inject.get(NotificationsService)),
      (this.callfunc = inject.get(CallFuncService)),
      (this.esService = inject.get(CodxEsService));
  }

  ngOnChanges(changes: SimpleChanges): void {}
  onInit(): void {}
  ngAfterViewInit(): void {
    this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Bình luận', isActive: false },
      { name: 'AssignTo', textDefault: 'Giao việc', isActive: false },
      { name: 'References', textDefault: 'Nguồn công việc', isActive: false },
      { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
    ];
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
    // this.button = {
    //   id: 'btnAdd',
    // };
    this.getGridViewSetup(this.view.formModel.funcID);
    this.detectorRef.detectChanges();
  }

  click(e: any) {}
  openFormFuncID(e: any) {}
  valueChange(dt: any) {
    this.dataItem = dt?.data;
    switch(dt?.data?.functionID)
    {
      case "HRTPro01":
      {

        break;
      }
    }
    debugger
    return ;
  }

  vllApproval: any;

  getGridViewSetup(funcID: any) {
    this.cache.valueList('SYS055').subscribe((result) => {
      if (result?.datas?.length > 0) {
        var obj: { [key: string]: any } = {};

        let lstData = result?.datas;
        lstData.forEach((element) => {
          let key = element?.value;
          obj[key] = element;
        });

        this.vllApproval = obj as Object;
        this.dvlApproval = result?.datas[0];
        //this.ref.detectChanges();
      }
    });
  }
  setStyles(bg: any): any {
    let styles = {
      backgroundColor: bg,
    };
    return styles;
  }
  changeMF(data: any, value: object | any = null) {
    var datas = this.dataItem;
    this.allMFunc = this.allMFunc ?? data;
    if (value) datas = value;
    if (datas) {
      var list = data.filter(
        (x) => x.data != null && x.data.formName == 'Approvals'
      );
      for (var i = 0; i < list.length; i++) {
        list[i].isbookmark = true;
        if (list[i].functionID != 'SYS206' && list[i].functionID != 'SYS205') 
        {
          list[i].disabled = true;
          if (value.status == '5' || value.status == '2' || value.status == '4')
            list[i].disabled = true;
          else if (
            ((datas?.stepType == 'S1' ||
              datas?.stepType == 'S2' ||
              datas?.stepType == 'S3' ||
              datas?.stepType == 'S') &&
              list[i].functionID == 'SYS202') ||
            ((datas?.stepType == 'A1' ||
              datas?.stepType == 'R' ||
              datas?.stepType == 'C') &&
              list[i].functionID == 'SYS203') ||
            (datas?.stepType == 'S3' && list[i].functionID == 'SYS204') ||
            (datas?.stepType == 'A2' && list[i].functionID == 'SYS201')
          ) {
            list[i].disabled = false;
          }
        } 
        else if (
          value.status == '5' ||
          value.status == '2' ||
          value.status == '4'
        )
        {
          list[i].disabled = true;
        }
        else{
          
          list[i].disabled = false;
        }
      }
      this.listApproveMF = list.filter(
        (p) => (p.data.functionID == 'SYS208' || p.disabled == false) && p.data.functionID != 'SYS200'
      );

      if(datas?.eSign)
      {
        var listDis = data.filter(
          (x) =>
            x.functionID == 'SYS202' ||
            x.functionID == 'SYS203' ||
            x.functionID == 'SYS204' ||
            x.functionID == 'SYS205' ||
            x.functionID == 'SYS206' ||
            x.functionID == 'SYS201'
            
        );
        for (var i = 0; i < listDis.length; i++) {
          listDis[i].disabled = true;
        }

        var sys200 = data.filter(x=>x.functionID == "SYS200");
        sys200[0].disabled = false;
      }
      //Ẩn thêm xóa sửa
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
    var bm = data.filter(
      (x: { functionID: string }) => x.functionID == 'SYS207'
    );
    bm[0].disabled = true;
    if (datas.status != '3') {
      this.api
        .execSv<any>(
          'ES',
          'ERM.Business.ES',
          'ApprovalTransBusiness',
          'CheckRestoreAsync',
          datas.recID
        )
        .subscribe((item) => {
          var bm = data.filter(
            (x: { functionID: string }) => x.functionID == 'SYS207'
          );
          bm[0].disabled = !item;
          this.detectorRef.detectChanges();
        });
    }
    this.detectorRef.detectChanges();
  }
  clickMF(e: any, data: any) {
    this.changeMF( this.allMFunc, data);
    //Duyệt SYS201 , Ký SYS202 , Đồng thuận SYS203 , Hoàn tất SYS204 , Từ chối SYS205 , Làm lại SYS206 , Khôi phục SY207
    var funcID = e?.functionID;
    if (data.eSign == true) {
      //Kys
      if (
        funcID == 'SYS201' ||
        funcID == 'SYS205' ||
        funcID == 'SYS206' ||
        funcID == 'SYS204' ||
        funcID == 'SYS203' ||
        funcID == 'SYS202' ||
        funcID == 'SYS200'
      ) {
        let option = new SidebarModel();
        option.Width = '800px';
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;

        console.log('oTrans', data);

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
            sfRecID: data.transID,
            title: data.htmlView,
            status: data.status,
            stepType: data.stepType,
            stepNo: data.stepNo,
            transRecID: data.recID,
            oTrans: data,
            lstMF: this.listApproveMF,
          },
          '',
          dialogModel
        );
        dialogApprove.closed.subscribe((x) => {
          if (x.event?.rowCount>0 && x.event?.msgCodeError==null) {
            //return ResponseModel            
            data.status = x.event?.returnStatus;
            this.view.dataService.update(data).subscribe();
            this.esService.setupChange.next(true);
            this.esService.isStatusChange.subscribe((res) => {
              if (res != null) {
                if (res.toString() == '2') {
                  this.view.dataService.remove(data).subscribe();
                } else {
                  data.status = res;
                  this.view.dataService.update(data).subscribe();
                }
              }
            });
          }

          /*return {
            result: true,
            mode: 1
          }

          mode: 1. Ký
              2. Từ chối
              3. Làm lại */
        });
      }

      //hoan tat
      // else if (funcID == 'SYS204') {

      // }
    } else {
      var status;
      if (
        funcID == 'SYS201' ||
        funcID == 'SYS202' ||
        funcID == 'SYS203' ||
        funcID == 'SYS204'
      )
        status = '5';
      else if (funcID == 'SYS205') status = '4';
      else if (funcID == 'SYS206') status = '2';

      let dialog = this.codxShareService.beforeApprove(
        status,
        data,
        this.funcID,
        e?.text,
        this.view?.formModel
      );
      if (dialog) {
        dialog.closed.subscribe((res) => {
          let oComment = res?.event;
          if(oComment)
          {
            this.codxShareService
            .codxApprove(
              data?.recID,
              status,
              oComment?.comment,
              oComment?.reasonID,
              null,
            )
            .subscribe((res2: any) => {
              if (!res2?.msgCodeError) {
                if (status.toString() == '2') {
                  this.view.dataService.remove(data).subscribe();
                } else {
                  data.status = status;
                  this.view.dataService.update(data).subscribe();
                  this.esService.setupChange.next(true);
                }
                this.notifySvr.notifyCode('SYS007');
              } else this.notifySvr.notify(res2?.msgCodeError);
            });
          }
        });
      } else {
        this.codxShareService
          .codxApprove(
            data?.recID,
            status,
            null,
            null,
            null,
          )
          .subscribe((res2: any) => {
            if (!res2?.msgCodeError) {
              if (!res2?.msgCodeError) {
                if (status.toString() == '2') {
                  this.view.dataService.remove(data).subscribe();
                } else {
                  data.status = status;
                  this.view.dataService.update(data).subscribe();
                  this.esService.setupChange.next(true);
                }
              }
              this.notifySvr.notifyCode('SYS007');
            } else this.notifySvr.notify(res2?.msgCodeError);
          });
      }
    }
    if (funcID == 'SYS207') {
      this.codxShareService.codxUndo(data?.recID,null).subscribe((res) => {
        if (res != null) {
          data = res;
          this.view.dataService.update(data).subscribe();
          this.esService.setupChange.next(true);
        }
      });
    }
  }

  approve(data) {}
}
