import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TmService } from '@modules/tm/tm.service';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import {
  ApiHttpService,
  CodxListviewComponent,
  DataRequest,
  ListCardComponent,
  NotificationsService,
} from 'codx-core';
import * as moment from 'moment';
import { SprintsInfoComponent } from '../sprints-info/sprints-info.component';

@Component({
  selector: 'app-list-sprints',
  templateUrl: './list-sprints.component.html',
  styleUrls: ['./list-sprints.component.scss'],
})
export class ListSprintsComponent implements OnInit {
  @Input('sprintsInfo') sprintsInfo: SprintsInfoComponent;
  fromDate: Date;
  toDate: Date;
  view: string;
  model = new DataRequest();
  gridView: any;
  predicateViewBoards =
    '((Owner=@0) or (@1.Contains(outerIt.IterationID))) and (!@2.Contains(outerIt.IterationID)) AND ProjectID=null';
  predicateProjectBoards =
    '((Owner=@0) or (@1.Contains(outerIt.IterationID))) and (!@2.Contains(outerIt.IterationID)) AND ProjectID!=null';
  listMyBoard = [];
  listProjectBoard = [];
  gridModel: DataRequest = {
    entityName: 'TM_Sprints',
    page: 1,
    pageSize: 5,
    pageLoading: false,
    dataObj: '',
    gridViewName: 'grvSprints',
    formName: 'Sprints',
  };
  totalRowMyBoard: number = 5;
  totalRowProjectBoard: number = 5;
  totalViewBoards: number = 0;
  totalProjectBoards: number = 0;
  boardAction: any;
  @ViewChild('lstViewBoard') lstViewBoard: ListCardComponent;
  @ViewChild('lstProjectBoard') lstProjectBoard: ListCardComponent;

  constructor(
    private api: ApiHttpService,
    private tmSv : TmService,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService : NotificationsService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.sprintsInfo.isAddNew.subscribe((res) => {
      if (res?.projectID != null) {
        this.lstProjectBoard.addHandler(res, true, 'iterationID');
      } else {
        this.lstViewBoard.addHandler(res, true, 'iterationID');
      }
    });
    this.loadDataMyBoards();
    this.loadDataProjectBoards();
    console.log(this.totalViewBoards);
    console.log(this.totalProjectBoards);
  }
  loadDataMyBoards() {
    this.gridModel.predicate =
      '((Owner=@0) or (@1.Contains(outerIt.IterationID))) and (!@2.Contains(outerIt.IterationID)) AND ProjectID=null';
    this.api
      .execSv<any>('TM', 'TM', 'SprintsBusiness', 'GetListSprintAsync', [
        this.gridModel,
      ])
      .subscribe((res) => {
        if (res) {
          this.totalViewBoards = res[1];
        }
      });
  }
  loadDataProjectBoards() {
    this.gridModel.predicate =
      '((Owner=@0) or (@1.Contains(outerIt.IterationID))) and (!@2.Contains(outerIt.IterationID)) AND ProjectID!=null';
    this.api
      .execSv<any>('TM', 'TM', 'SprintsBusiness', 'GetListSprintAsync', [
        this.gridModel,
      ])
      .subscribe((res) => {
        if (res) {
          this.totalProjectBoards = res[1];
        }
      });
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
    this.sprintsInfo.openInfo(boardAction.iterationID, 'edit');
  }
  copyTaskBoard(boardAction) {
    if (!boardAction.isShared) {
      this.notiService.notify('Bạn chưa được cấp quyền này !');
      return;
    }
    this.sprintsInfo.getSprintsCoppied(boardAction.iterationID);
  }
  deleteTaskBoard(boardAction) {
        var message = 'Bạn có chắc chắn muốn xóa task này !';
        this.notiService
          .alert('Cảnh báo', message, { type: 'YesNo' })
          .subscribe((dialog: Dialog) => {
            var that = this;
            dialog.close = function (e) {
              return that.confirmDelete(e, that,boardAction);
            };
          });
    }
  
  confirmDelete(e: any, t: ListSprintsComponent,boardAction) {
    if (e?.event?.status == 'Y') {
      t.tmSv.deleteSprints(t.boardAction.iterationID).subscribe(res=>{
        if(res){
          if (boardAction?.projectID != null) {
            this.lstProjectBoard.removeHandler(boardAction, 'iterationID');
          } else {
            this.lstViewBoard.removeHandler(boardAction, 'iterationID');
          }
          this.notiService.notify("Xoá task board thành công !")
        }
      })
    }
  }

  viewTaskBoard(boardAction) {
    this.sprintsInfo.openInfo(boardAction.iterationID, 'view');
  }
}
