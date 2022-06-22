import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, AuthStore, ButtonModel, CallFuncService, CodxService, DataRequest, NotificationsService, ViewModel, ViewType, FormModel, DataService, CodxListviewComponent, CRUDService } from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';


@Component({
  selector: 'list-sprints',
  templateUrl: './list-card-sprints.component.html',
  styleUrls: ['./list-card-sprints.component.css']
})
export class ListCardSprintsComponent implements OnInit {
  //@Input('sprintsInfo') sprintsInfo: SprintsInfoComponent;
  @Input() formModel: FormModel;
  @Input() dataService: CRUDService;
  view: string;
  model = new DataRequest();
  gridView: any;
  predicateViewBoards =
    '((Owner=@0) or (@1.Contains(outerIt.IterationID))) and (!@2.Contains(outerIt.IterationID)) AND ProjectID=null';
  predicateProjectBoards =
    '((Owner=@0) or (@1.Contains(outerIt.IterationID))) and (!@2.Contains(outerIt.IterationID)) AND ProjectID!=null';
  totalRowMyBoard: number = 6;
  totalRowProjectBoard: number = 6;
  totalViewBoards: number = 0;
  totalProjectBoards: number = 0;
  boardAction: any;
  user: any;
  @Input() funcID: string;
  @ViewChild('lstViewBoard') lstViewBoard: CodxListviewComponent;
  @ViewChild('lstProjectBoard') lstProjectBoard: any;
  urlShare = "";
  urlView = "";
  moreFunc: any[];
  constructor(private api: ApiHttpService,
    private tmSv: CodxTMService,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private authStore: AuthStore,
    public codxService: CodxService,
    private activedRouter: ActivatedRoute
  ) {
    this.user = this.authStore.get();
  }

  ngOnInit(): void {
    this.funcID = this.activedRouter.snapshot.params["funcID"];;
    this.tmSv.getMoreFunction([this.funcID, null, null]).subscribe((res) => {
      if (res) {
        this.moreFunc = res;
        for (var i = 0; i < this.moreFunc.length; i++) {
          if (this.moreFunc[i].functionID == "TMT042") this.urlView = this.moreFunc[i].url;
        }
      }
    });

  }

  ngAfterViewInit() {
  }
  viewMoreMyBoard() {
    this.totalRowMyBoard += 6;
    this.ngAfterViewInit();
    this.changeDetectorRef.detectChanges();
  }

  viewMoreProjectBoard() {
    this.totalProjectBoards += 6;
    this.ngAfterViewInit();
    this.changeDetectorRef.detectChanges();
  }

  showControl(p, item) {
    this.boardAction = item;
    p.open();
  }
  editTaskBoard(boardAction) {
    //this.sprintsInfo.openInfo(boardAction.iterationID, 'edit');
  }
  copyTaskBoard(boardAction) {
    if (!boardAction.isShared) {
      this.notiService.notify('Bạn chưa được cấp quyền này !');
      return;
    }
    //this.sprintsInfo.getSprintsCoppied(boardAction.iterationID);
  }
  deleteTaskBoard(boardAction) {
    var message = 'Bạn có chắc chắn muốn xóa task này !';
    this.notiService
      .alert('Cảnh báo', message, { type: 'YesNo' })
    // .subscribe((dialog: Dialog) => {
    //   var that = this;
    //   dialog.close = function (e) {
    //     return that.confirmDelete(e, that, boardAction);
    //   };
    // });
  }

  confirmDelete(e: any, t: ListCardSprintsComponent, boardAction) {
    if (e?.event?.status == 'Y') {
      t.tmSv.deleteSprints(t.boardAction.iterationID).subscribe((res) => {
        if (res) {
          if (boardAction?.projectID != null) {
            this.lstProjectBoard.removeHandler(boardAction, 'iterationID');
          } else {
            this.dataService.remove(boardAction);
          }
          this.notiService.notify('Xoá task board thành công !');
        }
      });
    }
  }

  viewTaskBoard(boardAction) {
    //this.sprintsInfo.openInfo(boardAction.iterationID, 'view');
  }

  shareTaskBoard(boardAction) {
    var listUserDetail = [];
    if (boardAction.iterationID) {
      var obj = {
        boardAction: boardAction,
        listUserDetail: listUserDetail,
      }
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'SprintsBusiness',
          'GetListUserSharingOfSprintsByIDAsync',
          boardAction.iterationID
        )
        .subscribe((res) => {
          if (res) obj.listUserDetail = res;
          this.openPopupShare(obj);
        });
    }
  }
  openPopupShare(obj) {
    // this.callfc
    //   .openForm(
    //     PopupShareSprintsComponent,
    //     'Chia sẻ view board',
    //     350,
    //     510,
    //     '',
    //     // boardAction
    //     obj
    //   )
    // .subscribe((dt: any) => {
    //   var that = this;
    //     dt.close = function (e) {
    //       return that.closePopup(e, that);
    //     };
    // });
  }

  // closePopup(e: any, t: ListSprintsComponent) {
  //   if (e.closedBy == 'user action') {
  //     var boardAction = new TM_Sprints();
  //     if (e.event) {
  //       boardAction = e.event;
  //       if (boardAction?.projectID != null) {
  //         t.lstProjectBoard.addHandler(boardAction, false, 'iterationID');
  //       } else {
  //         t.lstViewBoard.addHandler(boardAction, false, 'iterationID');
  //       }
  //       this.notiService.notify("Share board thành công !")
  //     }
  //   }
  // }


  clickMF(e: any, data: any) {
    console.log(e, data);
  }
  click(evt: ButtonModel) {
  }
}
