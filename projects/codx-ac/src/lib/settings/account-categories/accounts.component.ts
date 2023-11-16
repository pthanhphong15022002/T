import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ButtonModel,
  ViewModel,
  UIComponent,
  ViewType,
  CallFuncService,
  SidebarModel,
  Util,
} from 'codx-core';
import { AccountsAddComponent } from './accounts-add/accounts-add.component';
import { CodxAcService } from '../../codx-ac.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-accounts',
  templateUrl: 'accounts.component.html',
  styleUrls: ['accounts.component.css','../../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsComponent extends UIComponent {

  //#region Contructor
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;
  views: Array<ViewModel> = []; //? model view
  button: ButtonModel[] = [{ //? nút thêm tài khoản
    id: 'btnAdd',
    icon: 'icon-add_circle_outline',
  }];
  funcName = ''; //? tên truyền vào headertext
  headerText: any;
  optionSidebar: SidebarModel = new SidebarModel();
  dataDefault:any;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private acService: CodxAcService,
  ) {
    super(inject);
  }
  //#endregion Contructor

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    this.cache
      .functionList(this.view.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) this.funcName = res.defaultName;
      });
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: false,
        model: {
          template2: this.templateGrid,
        },
      },
    ];

    //* thiết lập cấu hình sidebar
    this.optionSidebar.DataService = this.view.dataService;
    this.optionSidebar.FormModel = this.view.formModel;
    this.optionSidebar.Width = '800px';

  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  //#endregion Init

  //#region Event

  /**
   * *Hàm xử lí thêm mới tài khoản
   * @param e 
   */
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.addNew(e); //? thêm mới tài khoản
        break;
    }
  }

  /**
   * *Hàm xử lí chỉnh sửa,copy,xóa tài khoản
   * @param e 
   * @param data 
   */
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data); //? xóa tài khoản
        break;
      case 'SYS03':
        this.edit(e, data); //? chỉnh sửa tài khoản
        break;
      case 'SYS04':
        this.copy(e, data); //? copy tài khoản
        break;
    }
  }
  //#endregion Event

  //#region Function

  /**
   * *Hàm thêm mới tài khoản
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
          res.isAdd = true;
          this.dataDefault = {...res};
          data.dataDefault = {...this.dataDefault};
          let dialog = this.callfunc.openSide(
            AccountsAddComponent,
            data,
            this.optionSidebar,
            this.view.funcID
          );
        }       
      });
    }else{
      let dialog = this.callfunc.openSide(
        AccountsAddComponent,
        data,
        this.optionSidebar,
        this.view.funcID
      );
    }
    
  }

  /**
   * *Hàm chỉnh sửa tài khoản
   * @param e 
   * @param dataEdit 
   */
  edit(e, dataEdit) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    if (dataEdit) this.view.dataService.dataSelected = dataEdit;
    this.view.dataService
      .edit(dataEdit)
      .subscribe((res: any) => {
        if (res) {
          res.isEdit = true;
          let data = {
            headerText: this.headerText,
            dataDefault:{...res},
            funcName:this.funcName
          };
          let dialog = this.callfunc.openSide(
            AccountsAddComponent,
            data,
            this.optionSidebar
          );
        }
      });
  }

  /**
   * *Hàm sao chép chỉnh sửa
   * @param e 
   * @param dataCopy 
   */
  copy(e, dataCopy) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    if (dataCopy) this.view.dataService.dataSelected = dataCopy;
    this.view.dataService
      .copy()
      .subscribe((res: any) => {
        if (res) {
          res.isCopy = true;
          let data = {
            headerText: this.headerText,
            dataDefault:{...res},
            funcName:this.funcName
          };
          let dialog = this.callfunc.openSide(
            AccountsAddComponent,
            data,
            this.optionSidebar
          );
        }
      });
  }

  /**
   * *Hàm xóa tài khoản
   * @param dataDelete 
   */
  delete(dataDelete) {
    if (dataDelete) this.view.dataService.dataSelected = dataDelete;
    this.view.dataService.delete([dataDelete], true).subscribe((res: any) => {
      if (res) {
        this.acService.clearCache('account');
      }
    });
  }

  //#endregion Function
}
