import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from '@shared/services/file.service';
import {
  AuthStore,
  ButtonModel,
  DialogModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxBpService } from '../codx-bp.service';
import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { PopupAddProcessComponent } from './popup-add-process/popup-add-process.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.css'],
})
export class ProcessesComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('templateListCard', { static: true })
  templateListCard: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate: TemplateRef<any>;
  @ViewChild('templateMore') templateMore: TemplateRef<any>;

  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  button?: ButtonModel[];
  method = 'GetListProcessesAsync';
  showButtonAdd: boolean = true;
  dataObj: any;
  titleAction = '';
  heightWin: any;
  widthWin: any;
  itemSelected: any;
  popoverDetail: any;
  popupOld: any;
  popoverList: any;
  readonly btnAdd: string = 'btnAdd';
  asideMode: string;

  constructor(
    inject: Injector,
    private bpService: CodxBpService,
    private notification: NotificationsService,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private fileService: FileService,
    private routers: Router,
    private notiSv: NotificationsService,
    private codxShareService: CodxShareService,
  ) {
    super(inject);
    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.card,
        sameData: true,
        active: true,
        model: {
          template: this.templateListCard,
          headerTemplate: this.headerTemplate,
        },
      },
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.templateMore,
          groupSettings: { showDropArea: false, columns: ['groupID'] },
          //resources: this.columnGrids,
          // frozenColumns: 1,
        },
      },
    ];
  }

  onInit(): void {
    this.asideMode = this.codxService?.asideMode;

    this.button = [
      {
        id: this.btnAdd,
      },
    ];
  }

  //#region  event emit change codx-view
  onDragDrop(e) {}
  searchChange(e) {}
  viewChanged(e) {}
  selectedChange(process: any) {
    this.itemSelected = process?.data ? process?.data : process;
    this.detectorRef.detectChanges();
  }

  PopoverDetail(e, p: any, emp, field: string) {
    let parent = e.currentTarget.parentElement.offsetWidth;
    let child = e.currentTarget.offsetWidth;
    if (this.popupOld?.popoverClass !== p?.popoverClass) {
      this.popupOld?.close();
    }

    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp[field] != null && emp[field]?.trim() != '') {
        if (parent <= child) {
          p.open();
        }
      }
    } else p.close();
    this.popupOld = p;
  }
  //#endregion

  //#region event more
  click(evt) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case this.btnAdd:
        this.add();
        break;
    }
  }

  clickMF(e, data) {
    this.itemSelected = data;
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      default: {
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this
        );
        // this.df.detectChanges();
        break;
      }
    }
  }

  changeDataMF(e, data) {}
  //#endregion

  //#region CRUD more func
  add() {
    this.view.dataService.addNew().subscribe((res) => {
      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;
      dialogModel.zIndex = 999;
      dialogModel.DataService = this.view?.dataService;
      dialogModel.FormModel = JSON.parse(JSON.stringify(this.view.formModel));
      this.cache
        .gridViewSetup(
          this.view.formModel.formName,
          this.view.formModel.gridViewName
        )
        .subscribe((res) => {
          if (res) {
            let obj = {
              gridViewSetup: res,
              action: 'add',
              title: this.titleAction
            };
            var dialog = this.callfc.openForm(
              PopupAddProcessComponent,
              '',
              this.widthWin,
              this.heightWin,
              '',
              obj,
              '',
              dialogModel
            );
            dialog.closed.subscribe((e) => {
              if (!e?.event) this.view.dataService.clear();
            });
          }
        });
    });
  }

  edit(data: any) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        let dialogModel = new DialogModel();
        dialogModel.IsFull = true;
        dialogModel.zIndex = 999;
        dialogModel.DataService = this.view?.dataService;
        dialogModel.FormModel = JSON.parse(JSON.stringify(this.view.formModel));
        this.cache
          .gridViewSetup(
            this.view.formModel.formName,
            this.view.formModel.gridViewName
          )
          .subscribe((res) => {
            if (res) {
              var obj = {
                action: 'edit',
                title: this.titleAction,
                gridViewSetup: res,
              };
              var dialog = this.callfc.openForm(
                PopupAddProcessComponent,
                '',
                this.widthWin,
                this.heightWin,
                '',
                obj,
                '',
                dialogModel
              );
              dialog.closed.subscribe((e) => {
                if (!e?.event) this.view.dataService.clear();
                if (e && e.event != null) {
                  this.view.dataService.update(e.event, true).subscribe();
                  this.detectorRef.detectChanges();
                  // this.detectorRef.markForCheck();
                }
              });
            }
          });
      });
  }

  copy(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.copy().subscribe((res) => {
      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;
      dialogModel.zIndex = 999;
      dialogModel.DataService = this.view?.dataService;
      dialogModel.FormModel = JSON.parse(JSON.stringify(this.view.formModel));
      this.cache
        .gridViewSetup(
          this.view.formModel.formName,
          this.view.formModel.gridViewName
        )
        .subscribe((res) => {
          if (res) {
            let obj = {
              gridViewSetup: res,
              action: 'copy',
              title: this.titleAction
            };
            var dialog = this.callfc.openForm(
              PopupAddProcessComponent,
              '',
              this.widthWin,
              this.heightWin,
              '',
              obj,
              '',
              dialogModel
            );
            dialog.closed.subscribe((e) => {
              if (!e?.event) this.view.dataService.clear();
            });
          }
        });
    });
  }

  async delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete(
        [this.view.dataService.dataSelected],
        true,
        (opt) => this.beforeDel(opt),
        null,
        null,
        null,
        null,
        false
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
          this.notiSv.notifyCode('SYS008');
        }
      });

    this.detectorRef.detectChanges();
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteAsync';
    opt.data = [itemSelected.recID];
    return true;
  }
  //#endregion
}
