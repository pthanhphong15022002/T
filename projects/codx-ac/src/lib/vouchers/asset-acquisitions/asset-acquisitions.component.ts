import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  CRUDService,
  FormModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxAcService, fmJournal } from '../../codx-ac.service';
import { Subject, takeUntil } from 'rxjs';
import { JournalsAddComponent } from '../../journals/journals-add/journals-add.component';

@Component({
  selector: 'lib-asset-acquisitions',
  templateUrl: './asset-acquisitions.component.html',
  styleUrls: ['./asset-acquisitions.component.css'],
})
export class AssetAcquisitionsComponent extends UIComponent {
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button?: ButtonModel[] = [
    {
      id: 'btnAdd',
    },
  ];
  //region Method
  service = 'AM';
  assemblyName = 'ERM.Business.Core';
  method = 'LoadDataAsync';
  className = 'DataBusiness';
  entityName = 'AM_AssetAcquisitions';
  idField = 'recID';
  dataValues = '';
  predicates = '';
  //endregion

  itemSelected: any;
  fmJournal: FormModel = fmJournal;
  journal: any;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  journalNo: string;
  journalSV: CRUDService;

  constructor(private acService: CodxAcService, private inject: Injector) {
    super(inject);
    this.router.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.journalNo = params?.journalNo; //? get số journal từ router
    });
    this.journalSV = this.acService.createCRUDService(
      inject,
      this.fmJournal,
      'AC'
    );
  }

  onInit(): void {
    this.getJournal();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.templateGrid,
        },
      }];

    this.acService.setChildLinks();

  }

  ngOnDestroy() {
    this.onDestroy();
  }
  getJournal() {
    this.api
      .exec('AC', 'ACBusiness', 'GetJournalAsync', [this.journalNo])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.journal = res[0]; // data journal
          // this.hideFields = res[1]; // array field ẩn từ sổ nhật kí
        }
      });
  }
  /**
   * *Hàm hủy các obsevable subcrible
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#region event more
  click(e) {}

  clickMF(e, data) {}

  changeMF(e, data) {}

  selectedChange(e) {}
  //#endregion

  //#region journal
  editJournal() {
    this.journalSV
      .edit(this.journal)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        res.isEdit = true;
        this.cache
          .gridViewSetup(this.fmJournal.formName, this.fmJournal.gridViewName)
          .subscribe((o) => {
            let data = {
              headerText: 'Chỉnh sửa sổ nhật kí'.toUpperCase(),
              oData: { ...res },
            };
            let option = new SidebarModel();
            option.FormModel = this.fmJournal;
            option.DataService = this.journalSV;
            option.Width = '800px';
            let dialog = this.callfc.openSide(
              JournalsAddComponent,
              data,
              option,
              this.fmJournal.funcID
            );
            dialog.closed.subscribe((res) => {
              if (res && res.event) {
                this.getJournal();
              }
            });
          });
      });
  }

  //#endregion
}
