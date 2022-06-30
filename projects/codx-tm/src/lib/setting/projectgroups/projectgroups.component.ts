import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, DialogRef, SidebarModel, ViewModel, ViewsComponent, ViewType, CallFuncService } from 'codx-core';
import { PopAddProjectgroupComponent } from './pop-add-projectgroup/pop-add-projectgroup.component';

@Component({
  selector: 'lib-projectgroups',
  templateUrl: './projectgroups.component.html',
  styleUrls: ['./projectgroups.component.css']
})
export class ProjectgroupsComponent implements OnInit {

  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('itemCreate', { static: true }) itemCreate: TemplateRef<any>;
  @ViewChild('itemApprovalControlVll', { static: true }) itemApprovalControlVll: TemplateRef<any>;
  @ViewChild('itemNote', { static: true }) itemNote: TemplateRef<any>;

  @ViewChild('view') view!: ViewsComponent;

  columnsGrid = [];
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  itemSelected: any;
  dialog!: DialogRef
  constructor(private changeDetectorRef: ChangeDetectorRef, private callfunc: CallFuncService) { }

  ngOnInit(): void {
    this.columnsGrid = [
      { field: 'noName', headerText: '', template: this.GiftIDCell, width: 30 },
      { field: 'projectGroupID', headerText: 'Mã nhóm', width: 100 },
      { field: 'projectGroupName', headerText: 'Tên nhóm dự án', width: 150 },
      { field: 'projectGroupName2', headerText: 'Tên khác', width: 140 },
      { field: 'projectCategory', headerText: 'Phân loại', template: this.itemApprovalControlVll, width: 80 },
      { field: 'note', headerText: 'Ghi chú', width: 160, template: this.itemNote },
      { field: 'createName', headerText: 'Người tạo', template: this.itemCreateBy, width: 120 },
      { field: 'createdOn', headerText: 'Ngày tạo', template: this.itemCreate, width: 100 }
    ];
    this.button = {
      id: 'btnAdd',
    };

    this.moreFuncs = [
      {
        id: 'edit',
        icon: 'icon-list-checkbox',
        text: 'Sửa',
      },
      {
        id: 'btnMF2',
        icon: 'icon-list-checkbox',
        text: 'more 2',
      },
    ];
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.show();
        break;
    }
  }

  ngAfterViewInit(): void {
    this.views = [{
      type: ViewType.grid,
      sameData: true,
      active: true,
      model: {
        resources: this.columnsGrid,
      }
    }];
    this.changeDetectorRef.detectChanges();
  }

  show() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '550px';
      this.dialog = this.callfunc.openSide(PopAddProjectgroupComponent, this.view.dataService.dataSelected, option);
      this.dialog.closed.subscribe(e => {
        console.log(e);
      })
    });
  }

  changeView(evt: any) {
    console.log('evt: ', evt);
    var t = this;
  }
  requestEnded(evt: any) {
    // if (evt) {
    //   this.dialog.close();
    // }
  }
  aaa(val: any) {
    console.log(val);
  }
  selectedChange(val: any) {
    console.log(val);
    this.itemSelected = val.data;
    // this.dt.detectChanges();
  }
}
