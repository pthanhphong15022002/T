import {
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  CodxGridviewComponent,
  CodxGridviewV2Component,
  CRUDService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddFAPostingAccountComponent } from './popup-add-faposting-account/popup-add-faposting-account.component';

@Component({
  selector: 'lib-faposting-accounts',
  templateUrl: './faposting-accounts.component.html',
  styleUrls: ['./faposting-accounts.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class FAPostingAccountsComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('grid') grid: CodxGridviewV2Component;

  views: Array<ViewModel> = [];
  menuActive = 5; // = ModuleID
  menuNavs: any[];
  menuItems: Array<any> = [];
  selectedValue: string;
  defaultPostType: string;
  btnAdd = [
    {
      id: 'btnAdd',
    },
  ];
  functionName: string;
  isSubView: boolean;

  constructor(inject: Injector) {
    super(inject);
    this.router.params.subscribe((res:any)=>{
      if(res){
        if(res['funcID']) this.funcID = res['funcID']
      }
    })
    this.router.data.subscribe((res) => {
      if (res && res['isSubView']) this.isSubView = res.isSubView;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache.valueList('AC060').subscribe((res) => {
      if(res){
        this.menuItems = res?.datas;
        this.defaultPostType = res?.datas[0].value;
        this.selectedValue = res?.datas[0].value;
        this.filter('PostType',this.defaultPostType);
      }

    });

    this.cache.valueList('AC059').subscribe((res) => {
      if(res){
        console.log(res);
      this.menuNavs = res?.datas;
      }

    });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        sameData: false,
        active: true,
        showFilter:false,
        showSort:false,
        model: {
          panelLeftRef: this.templateLeft,
          widthLeft: '21%',
          panelRightRef: this.templateRight,
        },
      },
    ];

    this.cache.functionList(this.view.funcID).subscribe((res) => {
      this.functionName =
        res.defaultName.charAt(0).toLowerCase() + res.defaultName.slice(1);
    });
  }
  //#endregion

  //#region Event
  handleClickMoreFuncs(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(e, data);
        break;
      case 'SYS04':
        this.copy(e, data);
        break;
    }
  }

  handleClickAdd(e) {
    (this.grid.dataService as CRUDService).addNew().subscribe((res: any) => {
      let options = new SidebarModel();
      options.DataService = this.grid.dataService;
      options.FormModel = this.grid.formModel;
      options.Width = '550px';
     let dialog = this.callfc.openSide(
        PopupAddFAPostingAccountComponent,
        {
          formType: 'add',
          formTitle: `${e.text} ${this.functionName}`,
          moduleId: this.menuActive,
          postType: this.selectedValue ?? this.defaultPostType,
          breadcrumb: this.getBreadcrumb(
            this.selectedValue ?? this.defaultPostType
          ),
        },
        options,
        this.view.funcID
      );
      dialog.closed.subscribe((res:any)=>{
        if(res.event){
          this.grid.addRow(res.event,0,true);
        }
      })
    });
  }

  edit(e, data): void {

    this.grid.dataService.dataSelected = data;
    (this.grid.dataService as CRUDService).edit(data).subscribe((res) => {
      let options = new SidebarModel();
      options.DataService = this.grid.dataService;
      options.FormModel = this.grid.formModel;
      options.Width = '550px';

      let dialog = this.callfc.openSide(
        PopupAddFAPostingAccountComponent,
        {
          formType: 'edit',
          formTitle: `${e.text} ${this.functionName}`,
          moduleId: data.moduleID,
          postType: data.postType,
          breadcrumb: this.getBreadcrumb(data.postType),
        },
        options,
        this.view.funcID
      );
      dialog.closed.subscribe((res:any)=>{
        if(res.event){
          this.grid.updateRow(this.grid.rowIndex,res.event);
        }
      })
    });
  }

  copy(e, data): void {

    const { diM1, diM2, diM3, buid, ...rest1 } = data;
    this.grid.dataService.dataSelected = {
      ...rest1,
      bUID: buid,
      dIM1: diM1,
      dIM2: diM2,
      dIM3: diM3,
    };
    (this.grid.dataService as CRUDService).copy().subscribe((res) => {
      console.log(res);

      const { bUID, dIM1, dIM2, dIM3, ...rest2 } = res;
      this.grid.dataService.dataSelected = {
        ...rest2,
        buid: bUID,
        diM1: dIM1,
        diM2: dIM2,
        diM3: dIM3,
      };

      let options = new SidebarModel();
      options.DataService = this.grid.dataService;
      options.FormModel = this.grid.formModel;
      options.Width = '550px';

      let dialog = this.callfc.openSide(
        PopupAddFAPostingAccountComponent,
        {
          formType: 'add',
          formTitle: `${e.text} ${this.functionName}`,
          moduleId: data.moduleID,
          postType: data.postType,
          breadcrumb: this.getBreadcrumb(data.postType),
        },
        options,
        this.view.funcID
      );
      dialog.closed.subscribe((res:any)=>{
        if(res.event){
          this.grid.addRow(res.event,0,true);
        }
      })
    });
  }
  //#endregion

  //#region Method
  delete(data): void {

    (this.grid.dataService as CRUDService)
      .delete([data], true)
      .subscribe((res:any) =>{
        if(!res.error && res.data){
          this.grid.deleteRow(res.data,true);
        }
      });
  }
  //#endregion

  //#region Function
  filter(field: string, value: string): void {
    this.selectedValue = value;
    this.view.dataService.setPredicates([field + '=@0'], [value]);
  }

  getBreadcrumb(postType): string {
    return (
      this.menuNavs.find((m) => m.value == this.menuActive)?.text +
      ' > ' +
      this.menuItems.find((m) => m.value == postType)?.text
    );
  }

  onSelected(e:any){
    if(e)
      this.view.dataService.dataSelected = e;
  }

  viewActions(e:any){
    if(e.type == 'search'){
      this.grid.searchText = e.data;
      this.grid.refresh()
    }
  }
  //#endregion
}
