import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  Optional,
  SimpleChanges,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  SidebarModel,
  Util,
} from 'codx-core';
import { PopupAddCategoryComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-category/popup-add-category.component';
import { Subject, takeUntil } from 'rxjs';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'codx-view-approve',
  templateUrl: './codx-view-approve.component.html',
  styleUrls: ['./codx-view-approve.component.scss'],
})
export class CodxViewApproveComponent implements OnInit, OnChanges {
  @Input() listApprover;
  @Input() change;
  @Input() categoryID;
  @Input() type = 1;

  viewApprover;
  dialog;
  stepsTasks;
  user;
  entityName = '';
  isActivitie = false;
  idTask = '';
  private destroyFrom$: Subject<void> = new Subject<void>();
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callfc: CallFuncService,
    private cache: CacheService,
    private authStore: AuthStore,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.dialog = dialog;
    this.categoryID = dt?.data?.categoryID;
    this.type = dt?.data?.type || '1';
    this.stepsTasks = dt?.data?.stepsTasks;
    this.isActivitie = dt?.data?.isActivitie || false;
    this.user = this.authStore.get();
    this.idTask = this.stepsTasks?.isTaskDefault
      ? this.stepsTasks?.refID
      : this.stepsTasks?.recID;
  }

  ngOnInit(): void {
    this.loadListApproverStep();
  }

  ngOnChanges(changes: SimpleChanges): void {}

  loadListApproverStep() {
    this.getListAproverStepByCategoryID(this.idTask)
      .pipe(takeUntil(this.destroyFrom$))
      .subscribe((res) => {
        if (res) {
          this.listApprover = res;
          this.changeDetectorRef.markForCheck();
        }
      });
  }
  getListAproverStepByCategoryID(categoryID) {
    return this.api.exec<any>(
      'ES',
      'ApprovalStepsBusiness',
      'GetListStepByCategoryIDAsync',
      categoryID
    );
  }
  popoverApproverStep(p, data) {
    if (!data) {
      p.close();
      return;
    }
    if (p.isOpen()) p.close();
    this.viewApprover = data;
    p.open();
  }
  async clickSettingApprove() {
    let category;
    category = await firstValueFrom(
      this.api.execSv<any>(
        'ES',
        'ES',
        'CategoriesBusiness',
        'GetByCategoryIDAsync',
        this.idTask
      )
    );

    if (category) {
      //this.actionOpenFormApprove(category.recID);
      this.actionOpenFormApprove2(category);
    } else {
      //let transID = Util.uid();
      // this.actionOpenFormApprove(transID);
      this.api
        .execSv<any>('ES', 'Core', 'DataBusiness', 'GetDefaultAsync', [
          'ESS22',
          'ES_Categories',
        ])
        .subscribe(async (res) => {
          if (res && res?.data) {
            category = res.data;
            category.recID = res?.recID ?? Util.uid();
            category.eSign = true;
            category.category = this.isActivitie
              ? 'DP_Activities'
              : 'DP_Instances_Steps_Tasks';
            category.categoryID = this.idTask;
            category.categoryName = this.stepsTasks.taskName;
            category.createdBy = this.user.userID;
            category.owner = this.user.userID;
            category.functionApproval = this.isActivitie ? 'DPT07' : 'DPT04';
            category['refID'] = this.idTask;
            this.actionOpenFormApprove2(category, true);
          }
        });
    }
  }
  titleAction: any;

  actionOpenFormApprove2(item, isAdd = false) {
    this.cache.functionList('ESS22').subscribe((f) => {
      if (f) {
        if (!f || !f.gridViewName || !f.formName) return;
        this.cache.gridView(f.gridViewName).subscribe((gridview) => {
          this.cache
            .gridViewSetup(f.formName, f.gridViewName)
            .pipe(takeUntil(this.destroyFrom$))
            .subscribe((grvSetup) => {
              let formES = new FormModel();
              formES.funcID = f?.functionID;
              formES.entityName = f?.entityName;
              formES.formName = f?.formName;
              formES.gridViewName = f?.gridViewName;
              formES.currentData = item;
              let option = new SidebarModel();
              option.Width = '800px';
              option.FormModel = formES;
              let opt = new DialogModel();
              opt.FormModel = formES;
              option.zIndex = 1100;
              let popupEditES = this.callfc.openForm(
                PopupAddCategoryComponent,
                '',
                800,
                800,
                '',
                {
                  disableCategoryID: '1',
                  data: item,
                  isAdd: isAdd,
                  headerText: this.titleAction,
                  dataType: 'auto',
                  templateRefID: this.idTask,
                  templateRefType: this.isActivitie
                    ? 'DP_Activities'
                    : this.stepsTasks.isTaskDefault
                    ? 'DP_Steps_Tasks'
                    : 'DP_Instances_Steps_Tasks',
                  disableESign: true,
                },
                '',
                opt
              );

              popupEditES.closed.subscribe((res) => {
                if (res?.event) {
                  this.loadListApproverStep();
                }
              });
            });
        });
      }
    });
  }
}
