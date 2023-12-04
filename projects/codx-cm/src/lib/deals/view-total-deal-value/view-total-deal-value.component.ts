import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { loaded } from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, DataRequest, FormModel } from 'codx-core';
import { finalize, map, mergeMap, of } from 'rxjs';

@Component({
  selector: 'view-total-deal-value',
  templateUrl: './view-total-deal-value.component.html',
  styleUrls: ['./view-total-deal-value.component.css'],
})
export class ViewTotalDealValueComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input() style = ''; // style
  @Input() stepID = '';
  @Input() isLoading = false;
  @Input() stepIDAdd = ''; //clums cộng
  @Input() stepIDMinus = ''; //colums trừ
  @Input() changeMoney = 0; ///

  @Input() formModel!: FormModel;
  @Input() filterView!: any;
  @Input() currencyIDDefault = 'VND';
  @Input() exchangeRateDefault = 1;
  @Input() totalDealValue = 0;
  @Input() columns = [];
  @Output() getTotalDealValue = new EventEmitter<any>();
  @Output() loadedColumns = new EventEmitter<any>();
  @Input() loaded: any;
  // @Input() predicate = 'StepID=@0';
  // @Input() dataValue = '';
  @Input() loadFirst = true;
  total = 0;
  curentStepID = '';
  constructor(
    private api: ApiHttpService,
    private changeDef: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.columns?.length > 0 && this.loaded) {
      if (this.loadFirst) {
        if (this.curentStepID != this.stepID) {
          this.curentStepID = this.stepID;
          // if(this.stepID== this.columns[this.columns?.length-1].keyField){
          //   this.loadedColumns.emit(false)
          // }
          this.loading();
        }
      } else {
        this.total = this.columns.filter(
          (x) => x.keyField == this.stepID
        )[0].totalDealValue;
        this.changeDef.detectChanges();
      }
    }
  }

  ngAfterViewInit(): void {}

  ngOnInit(): void {}

  loading() {
    this.getTotal().subscribe((total) => {
      if (Number.parseFloat(total)) {
        this.total = total / this.exchangeRateDefault;
        this.getTotalDealValue.emit({ key: this.stepID, total: total });
        this.changeDef.detectChanges();
      }
    });
  }

  getTotal() {
    let service = 'CM';
    let className = 'DealsBusiness'; //gan tam
    let method = 'GetTotalDealValueColumnsAsync'; //gan tam
    let gridModel = new DataRequest();
    gridModel.formName = this.formModel.formName;
    gridModel.entityName = this.formModel.entityName;
    gridModel.funcID = this.formModel.funcID;
    gridModel.gridViewName = this.formModel.gridViewName;
    gridModel.pageLoading = false;
    gridModel.predicate = 'StepID=@0';
    gridModel.dataValue = this.stepID;
    gridModel.onlySetPermit = false; //goi qua phan quyền pes
    gridModel.filter = this.filterView;

    return this.api
      .execSv<any>(service, service, className, method, gridModel)
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response;
        })
      );
  }
}
