import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  CacheService,
  CodxGridviewV2Component,
  DataRequest,
  FormModel,
  NotificationsService,
  ResourceModel,
  UIComponent,
  Util,
} from 'codx-core';

import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { CodxPrService } from '../../codx-pr.service';

@Component({
  selector: 'total-kowds',
  templateUrl: './total-kowds.component.html',
  styleUrls: ['./total-kowds.component.css'],
})
export class TotalKowDsComponent extends UIComponent implements AfterViewInit {
  @ViewChild('tempEmployee', { static: true }) tempEmployee: TemplateRef<any>;
  @ViewChild('tempKow', { static: true }) tempKow: TemplateRef<any>;
  @ViewChild('gridview', { static: true }) gridview: CodxGridviewV2Component;
  @Input() mode = '2'; //1:Load theo nghiệp vụ; 2:Load theo RequestID;
  @Input() dataValue = "";
  @Input() predicate = "";
  @Input() cbbKowCode = [];
  
  method = 'LoadTotalKowDsAsync';
  gridFM: any;
  gridKow: any;
  gridKowColumns: any[];
  renderedGrid = false;
  constructor(
    injector: Injector,
    private authStore: AuthStore,
    private cacheService: CacheService,
    private codxCommonService: CodxCommonService,
    private codxPrService: CodxPrService,
    private notify: NotificationsService,
    private df: ChangeDetectorRef
  ) {
    super(injector);
    this.method = this.mode=="1" ? 'LoadDataForGridStatisticAsync' :'LoadTotalKowDsAsync';
  }
  onInit(): void {
    this.gridFM = new FormModel();
    this.gridFM.formName = 'KowDs';
    this.gridFM.gridViewName = 'grvKowDsUIByKow';
    this.gridFM.entityName = 'TS_KowDs';

    this.cacheService
      .gridViewSetup('KowDs', 'grvKowDsUIByKow')
      .subscribe((res: any) => {
        if (res) {
          this.gridKowColumns = [];
          this.gridKow = Util.camelizekeyObj(res);
          for (let field in this.gridKow) {
            if (this.gridKow[field]?.fieldName == 'EmployeeID') {
              this.gridKowColumns.push({
                headerTemplate: 'Nhân viên',
                template: this.tempEmployee,
                field: 'employeeID',
              });
            } else if (this.gridKow[field]?.fieldName == 'KowCode') {
              if (this.cbbKowCode?.length > 0) {
                this.cbbKowCode.forEach((kow) => {
                  this.gridKowColumns.push({
                    headerText: kow?.KowID,
                    template: this.tempKow,
                    field: kow?.KowID,
                    refField: 'kowCode',
                  });
                });
                this.renderedGrid = true;
                this.detectorRef.detectChanges();
              } else {
                let gridModel = new DataRequest();
                gridModel.pageLoading = false;
                gridModel.comboboxName = this.gridKow[field]?.referedValue;
                this.api
                  .execSv(
                    'HR',
                    'ERM.Business.Core',
                    'DataBusiness',
                    'LoadDataCbxAsync',
                    [gridModel]
                  )
                  .subscribe((cbx: any) => {
                    if (cbx && cbx[0] != null) {
                      this.cbbKowCode = JSON.parse(cbx[0]);
                      if (this.cbbKowCode?.length > 0) {
                        this.cbbKowCode.forEach((kow) => {
                          this.gridKowColumns.push({
                            headerText: kow?.KowID,
                            template: this.tempKow,
                            field: kow?.KowID,
                            refField: 'kowCode',
                          });
                        });
                      }
                      this.renderedGrid = true;
                      this.detectorRef.detectChanges();
                    }
                  });
              }
            }
          }
        }
      });
  }
  ngAfterViewInit(): void {}
  changeDataMF(evt: any, data: any) {}
  openFormFuncID(evt: any) {}
  debuger(){
    this.reloadGrid();
  }
  reloadGrid(){
    this.detectorRef.detectChanges();
    this.gridview.refresh();
    this.detectorRef.detectChanges();
  }
}
