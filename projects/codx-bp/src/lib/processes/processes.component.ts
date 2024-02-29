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
  ViewEncapsulation,
} from '@angular/core';
import { PopupAddProcessComponent } from './popup-add-process/popup-add-process.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { firstValueFrom } from 'rxjs';
import { FormTestDiagramComponent } from './popup-add-process/form-test-diagram/form-test-diagram.component';

@Component({
  selector: 'lib-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProcessesComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('templateListCard', { static: true })
  templateListCard: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate: TemplateRef<any>;
  @ViewChild('templateMore') templateMore: TemplateRef<any>;
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplateList') headerTemplateList?: TemplateRef<any>;
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
  vllBP016 = [];
  constructor(
    inject: Injector,
    private bpService: CodxBpService,
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
        },
      },
      {
        type: ViewType.list,
        sameData: true,
        active: false,
        model: {
          template: this.templateList,
          headerTemplate: this.headerTemplateList,
        },
      },
    ];
    this.view.dataService.methodSave = 'AddProcessAsync';
    this.view.dataService.methodUpdate = 'UpdateProcessAsync';
    this.view.dataService.methodDelete = 'DeleteAsync';
    this.detectorRef.detectChanges();
  }

  onInit(): void {
    this.asideMode = this.codxService?.asideMode;

    this.button = [
      {
        id: this.btnAdd,
      },
    ];

    this.cache.valueList('BP016').subscribe(vll => {
      if (vll && vll?.datas?.length > 0) {
        this.vllBP016 = vll.datas;
      }
    })
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

  popoverCrr: any;
  popoverDataSelected: any;
  lstPermissions = [];
  dataPermissions: any;
  lstUsersPositions = [];
  async popoverEmpList(p: any, data = null) {
    if (this.popoverCrr && this.popoverCrr?.isOpen()) {
      this.popoverCrr.close();
      this.lstPermissions = [];
    }
    if (this.popoverDataSelected) {
      if (this.popoverDataSelected.isOpen()) {
        this.lstPermissions = [];
        this.popoverDataSelected.close();
      }
    }

    if (p) {
      var element = document.getElementById(data?.recID);
      if (element) {
        var t = this;
        this.dataPermissions = data;
        this.lstPermissions = data?.permissions ?? [];
        let lstIDs = this.lstPermissions
          .filter(
            (x) =>
              x.objectID &&
              x.objectID.trim() !== '' &&
              (x.objectType == 'U' || x.objectType == '1')
          )
          .map((q) => q.objectID)
          .filter((value, index, self) => self.indexOf(value) === index);
        this.lstUsersPositions = await firstValueFrom(
          this.bpService.getPositionsByUserID(lstIDs)
        );
        //
      }
    }
    this.detectorRef.detectChanges();
  }

  searchName(e) {
    if (this.dataPermissions?.permissions) {
      if (e == null || e?.trim() == '') {
        this.lstPermissions = this.dataPermissions?.permissions ?? [];
        return;
      }

      this.lstPermissions = this.dataPermissions?.permissions.filter(
        (x) =>
          (x.objectName &&
            x.objectName?.trim() != '' &&
            this.fuzzySearch(e, x.objectName)) ||
          (x.objectID &&
            x.objectID?.trim() != '' &&
            this.fuzzySearch(e, x.objectID))
      );
    }
    this.detectorRef.detectChanges();
  }

  fuzzySearch(needle: string, haystack: string): boolean {
    const haystackLower = haystack
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '');

    const needleLower = needle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '');

    const regex = new RegExp([...needleLower].join('.*'));

    return regex.test(haystackLower);
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
      case "SYS008":
        this.openFormDiagram();
        break;
      case "BPT0101":
      {
        this.codxService.navigate('',"/bp/instances/BPT011/"+this.itemSelected.recID);
        break;
      }
      //Phát hành quy trình
      case "BPT0105":
      {
        this.releaseProcess();
        break;
      }
      default: {
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this
        );
        break;
      }
    }
  }

  openFormDiagram(){
    let option = new DialogModel;
    option.IsFull = true;
    this.callfc.openForm(FormTestDiagramComponent,'',0,0,this.funcID,null,'',option);
  }

  changeDataMF(e:any,data:any) {
    var approvelCL = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'BPT0105'
    );
    if (approvelCL[0] && data?.status == "5") approvelCL[0].disabled = true;
  }
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

  //Phát hành quy trình
  releaseProcess()
  {
    this.api.execSv("BP","BP","ProcessesBusiness","ReleaseAsync",this.view.dataService.dataSelected?.recID).subscribe(item=>{
      if(item)
      {
        this.itemSelected = item;
        this.view.dataService.update(item, true).subscribe();
        this.codxService.reloadMenuAside();
        this.notiSv.notifyCode("SV001")
      }
      else
      {
        this.notiSv.notifyCode("SV002")
      }
    })
  }
}
