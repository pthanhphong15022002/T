import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ButtonModel, CacheService, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';

@Component({
  selector: 'codx-contacts',
  templateUrl: './crmcontacts.component.html',
  styleUrls: ['./crmcontacts.component.scss'],
})
export class ContactsComponent extends UIComponent implements AfterViewInit {

  @ViewChild('templateDetail', { static: true })
  templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true })
  itemTemplate: TemplateRef<any>;
  @ViewChild('itemContactName', { static: true }) itemContactName: TemplateRef<any>;
  @ViewChild('itemPhoneNumber', { static: true }) itemPhoneNumber: TemplateRef<any>;
  @ViewChild('itemEmail', { static: true }) itemEmail: TemplateRef<any>;
  @ViewChild('itemAddress', { static: true }) itemAddress: TemplateRef<any>;
  @ViewChild('itemPriority', { static: true }) itemPriority: TemplateRef<any>;
  @ViewChild('itemCreatedBy', { static: true }) itemCreatedBy: TemplateRef<any>;
  @ViewChild('itemCreatedOn', { static: true }) itemCreatedOn: TemplateRef<any>;

  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  columnGrids = [];
  showButtonAdd = false;
  button?: ButtonModel;
  funcID: any;
  constructor(private injector: Injector,
    private cacheSv: CacheService,) {
    super(injector);
  }

  onInit(): void {
  }

  ngAfterViewInit(): void {
    let formModel = this.view?.formModel;
    if(formModel){
      this.cacheSv
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          this.columnGrids = [
            {
              field: 'contactName',
              headerText: gv
              ? gv['ContactName']?.headerText
              : 'Họ tên',
              width: 250,
              template: this.itemContactName,
            },
            {
              field: 'phoneNumber',
              headerText: gv
                ? gv['PhoneNumber']?.headerText
                : 'Điện thoại',
              template: this.itemPhoneNumber,
              width: 180,
            },
            {
              field: 'email',
              headerText: gv
                ? gv['Email']?.headerText
                : 'Email',
              template: this.itemEmail,
              width: 180,
            },
            {
              field: 'address',
              headerText: gv ? gv['Address']?.headerText : 'Địa chỉ',
              template: this.itemAddress,
              width: 250,
            },
            {
              field: 'priority',
              headerText: gv ? gv['Piority']?.headerText : 'Độ ưu tiên',
              template: this.itemPriority,
              width: 100,
            },
            {
              field: 'createdBy',
              headerText: gv ? gv['CreatedBy']?.headerText : 'Người tạo',
              template: this.itemCreatedBy,
              width: 100,
            },
            {
              field: 'createdOn',
              headerText: gv ? gv['CreatedOn']?.headerText : 'Ngày tạo',
              template: this.itemCreatedOn,
              width: 180,
            },
          ];
        })
    }


    this.views = [
      {
        sameData: true,
        type: ViewType.grid,
        active: false,
        model: {
          resources: this.columnGrids,
        },
      },
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  //#region event codx-view
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
  searchChange(e){
    this.view.dataService.search(e).subscribe();
    this.detectorRef.detectChanges();
  }

  clickMF(e, data){

  }
  //#endregion


  //#region Crud
  add(){

  }
  //#endregion
}
