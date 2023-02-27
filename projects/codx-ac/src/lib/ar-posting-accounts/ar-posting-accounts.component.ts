import { ChangeDetectorRef, Component, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { UIComponent, CodxGridviewComponent, ViewModel, CallFuncService, DialogRef, ViewType, SidebarModel } from 'codx-core';
import { PopAddArComponent } from './pop-add-ar/pop-add-ar.component';

@Component({
  selector: 'lib-ar-posting-accounts',
  templateUrl: './ar-posting-accounts.component.html',
  styleUrls: ['./ar-posting-accounts.component.css']
})
export class ArPostingAccountsComponent extends UIComponent {
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('grid') grid: CodxGridviewComponent;
  views: Array<ViewModel> = [];
  menuAccount: Array<any> = [];
  menuRules: Array<any> = [];
  dialog: DialogRef;
  headerText: any;
  subheaderText:any;
  moreFuncName: any;
  funcName: any;
  menuActive:any = 0;
  linkActive = '';
  postType:any;
  button = {
    id: 'btnAdd',
  };
  editSettings: EditSettingsModel = {
    allowEditing: false,
    allowAdding: false,
    allowDeleting: true,
    mode: 'Normal',
  };
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef
  ) { 
    super(inject);
    this.dialog = dialog;
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncName = m.defaultName;
      }
    });
  }

  onInit() {
    this.cache.valueList('AC047').subscribe((res) => {
      if (res) {
        this.menuAccount = res.datas;
      }
    });
    this.cache.valueList('AC048').subscribe((res) => {
      if (res) {
        this.menuRules = res.datas;
      }
    });
  }
  ngAfterViewInit() {
    this.cache.functionList(this.view.funcID).subscribe((res) => {
      if (res) this.funcName = res.defaultName;
    });
    this.views = [
      {
        type: ViewType.content,
        sameData: false,
        active: true,
        model: {
          panelLeftRef: this.templateLeft,
          widthLeft: '15%',
          panelRightRef: this.templateRight,
        },
      },
    ];
  }
  load(field: string, value: string) {
    this.postType = value;
    //this.grid.dataService.setPredicates([field + '=@0'], [value]).subscribe();
  }
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        if (this.menuActive != 0 && this.postType != '') {
          this.add();
        }else{
          break;
        }  
    }
  }
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        //this.delete(data);
        break;
      case 'SYS03':
        //this.edit(e, data);
        break;
    }
  }
  add() {
    if (this.menuActive == 1) {
      this.menuAccount.forEach(element => {
        if (element.value == this.postType) {
          this.subheaderText = 'Tài khoản > ' + element.text;
        }
      });
    }
    if (this.menuActive == 2) {
      this.menuRules.forEach(element => {
        if (element.value == this.postType) {
          this.subheaderText = 'Điều khoản > ' + element.text;
        }
      });
    }
    this.headerText = this.moreFuncName + ' ' + this.funcName;
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
        subheaderText:this.subheaderText,
        moduleID:this.menuActive,
        postType : this.postType
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.dialog = this.callfunc.openSide(PopAddArComponent, obj, option, this.view.funcID);
    });
  }
}
