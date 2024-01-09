import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from '@shared/services/file.service';
import {
  AuthStore,
  ButtonModel,
  DialogModel,
  NotificationsService,
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
  constructor(
    inject: Injector,
    private bpService: CodxBpService,
    private notification: NotificationsService,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private fileService: FileService,
    private routers: Router,
    private notificationsService: NotificationsService
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

  clickMF(e, data) {}

  changeDataMF(e, data) {}
  //#endregion

  //#region more func
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
  //#endregion
}
