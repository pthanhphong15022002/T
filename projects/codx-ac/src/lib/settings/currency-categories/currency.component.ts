import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ButtonModel,
  CallFuncService,
  DialogRef,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CurrencyAddComponent } from './currency-add/currency-add.component';
import { CodxAcService } from '../../codx-ac.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'lib-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.css','../../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyComponent extends UIComponent {

  //#region Contructor
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;
  funcName: any;
  views: Array<ViewModel> = [];
  button?: ButtonModel = {
    id: 'btnAdd',
    icon: 'icon-add_circle_outline'
  };;
  headerText:any;
  optionSidebar: SidebarModel = new SidebarModel();
  dataDefault:any;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private callfunc: CallFuncService
  ) {
    super(inject);
  }

  //#endregion Contructor

  //#region Init
  onInit(): void {}

  ngAfterViewInit(): void {
    this.cache.functionList(this.view.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
      this.funcName = res.defaultName;
    });
    
    this.views = [
      {
        type: ViewType.grid,
        sameData: true,
        active: true,
        model: {
          template2: this.templateGrid,
        },
      },
    ];

    //* thiết lập cấu hình sidebar
    this.optionSidebar.DataService = this.view.dataService;
    this.optionSidebar.FormModel = this.view.formModel;
    this.optionSidebar.Width = '550px';
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region Function

  /**
   * *Hàm click toolbar
   * @param evt 
   */
  toolBarClick(evt: any) {
    switch (evt.id) {
      case 'btnAdd':
        this.addNew(evt); //? thêm mới tiền tệ
        break;
    }
  }

  /**
   * *Hàm xử lí click (sửa,xóa,copy)
   * @param e 
   * @param data 
   */
  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS03':
        this.edit(e, data); //? chỉnh sửa tiền tệ
        break;
      case 'SYS02':
        this.delete(data); //? xóa tiền tệ
        break;
      case 'SYS04':
        this.copy(e, data); //? sao chép tiền tệ
        break;
    }
  }

  /**
   * *Hàm thêm mới tiền tệ
   * @param e 
   */
  addNew(e) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    let data = {
      headerText: this.headerText,
      dataDefault:{...this.dataDefault}
    };
    if(!this.dataDefault){
      this.view.dataService.addNew().subscribe((res: any) => {
        if(res){
          res._isAdd = true;
          this.dataDefault = {...res};
          data.dataDefault = {...this.dataDefault};
          let dialog = this.callfunc.openSide(
            CurrencyAddComponent,
            data,
            this.optionSidebar,
            this.view.funcID
          );
        }       
      });
    }else{
      let dialog = this.callfunc.openSide(
        CurrencyAddComponent,
        data,
        this.optionSidebar,
        this.view.funcID
      );
    }
  }

  /**
   * *Hàm chỉnh sửa tiền tệ
   * @param e 
   * @param dataEdit 
   */
  edit(e, dataEdit) {
    if (dataEdit) this.view.dataService.dataSelected = dataEdit;
    this.view.dataService
      .edit(dataEdit)
      .subscribe((res: any) => {
        if (res) {
          this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
          let data = {
            headerText: this.headerText,
            dataDefault:{...res},
            funcName:this.funcName
          };
          let dialog = this.callfunc.openSide(
            CurrencyAddComponent,
            data,
            this.optionSidebar,
            this.view.funcID
          );
        }
      });
  }

  /**
   * *Hàm sao chép tiền tệ
   * @param e 
   * @param dataCopy 
   */
  copy(e, dataCopy) {
    if (dataCopy) this.view.dataService.dataSelected = dataCopy;
    this.view.dataService
      .copy()
      .subscribe((res: any) => {
        if (res) {
          res._isCopy = true;
          this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
          let data = {
            headerText: this.headerText,
            dataDefault: { ...res },
            funcName:this.funcName
          };
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.Width = '550px';
          let dialog = this.callfunc.openSide(
            CurrencyAddComponent,
            data,
            this.optionSidebar,
            this.view.funcID
          );
        }
      });
  }

  /**
   * *Hàm xóa tiền tệ
   * @param dataDelete 
   */
  delete(dataDelete) {
    if (dataDelete) this.view.dataService.dataSelected = dataDelete;
    this.view.dataService.delete([dataDelete], true).subscribe((res: any) => {
      if (res) {
        this.api
          .exec('ERM.Business.BS', 'ExchangeRatesBusiness', 'DeleteAsync', [
            dataDelete.currencyID,
          ])
          .subscribe((res: any) => {});
      }
    });
  }
  //#endregion
}
