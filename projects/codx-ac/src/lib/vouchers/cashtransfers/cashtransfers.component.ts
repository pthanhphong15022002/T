import {
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { BehaviorSubject, distinctUntilKeyChanged } from 'rxjs';
import { JournalService } from '../../journals/journals.service';
import { CashtransferAddComponent } from './cashtransfers-add/cashtransfers-add.component';
import { CashtransfersService } from './cashtransfers.service';
import { ICashTransfer } from './interfaces/ICashTransfer.interface';

@Component({
  selector: 'lib-cashtransfers',
  templateUrl: './cashtransfers.component.html',
  styleUrls: ['./cashtransfers.component.scss'],
})
export class CashtransfersComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('sider') sider?: TemplateRef<any>;
  @ViewChild('content') content?: TemplateRef<any>;

  views: Array<ViewModel> = [];
  btnAdd = {
    id: 'btnAdd',
  };
  master: ICashTransfer;
  functionName: string;
  journalNo: string;
  defaultSubject = new BehaviorSubject<ICashTransfer>(null);

  constructor(
    injector: Injector,
    private journalService: JournalService,
    private cashTransferService: CashtransfersService
  ) {
    super(injector);
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.router.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
      this.journalService.setChildLinks(this.journalNo);
    });

    this.emitDefault();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.templateMore,
          frozenColumns: 1,
        },
      },
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.sider,
          panelRightRef: this.content,
        },
      },
    ];

    this.cache.functionList(this.view.funcID).subscribe((res) => {
      this.functionName = res.defaultName;
    });
  }
  //#endregion

  //#region Event
  onClickMF(e, data) {
    this.cashTransferService.onClickMF(
      e,
      data,
      this.functionName,
      this.view.formModel,
      this.view.dataService
    );
  }

  onSelectChange(e): void {
    if (e.data?.error?.isError) {
      return;
    }

    if (e.data?.data ?? e?.data) {
      this.master = e.data?.data ?? e?.data;
    }
  }

  onAddClick(e): void {
    this.view.dataService
      .addNew(() =>
        this.defaultSubject
          .asObservable()
          .pipe(distinctUntilKeyChanged('recID'))
      )
      .subscribe((res: any) => {
        let options = new SidebarModel();
        options.DataService = this.view.dataService;
        options.FormModel = this.view.formModel;
        options.isFull = true;
        this.callfc
          .openSide(
            CashtransferAddComponent,
            {
              formType: 'add',
              formTitle: this.functionName,
            },
            options,
            this.view.funcID
          )
          .closed.subscribe(() => {
            this.emitDefault();
          });
      })
      .unsubscribe();
  }
  //#endregion

  //#region Method
  emitDefault(): void {
    this.api
      .exec('AC', 'CashTranfersBusiness', 'GetDefaultAsync', [this.journalNo])
      .subscribe((res: any) => {
        this.defaultSubject.next({
          ...res,
          recID: res.data.recID,
        });
      });
  }
  //#endregion

  //#region Function
  //#endregion
}
