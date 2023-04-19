import { AfterViewInit, Component, Injector, Input, OnInit } from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-gantt';
import { UIComponent, FormModel, SidebarModel } from 'codx-core';
import { PopupAddCmCustomerComponent } from '../../../cmcustomer/popup-add-cmcustomer/popup-add-cmcustomer.component';

@Component({
  selector: 'codx-tab-deal-detail',
  templateUrl: './tab-detail-custom.component.html',
  styleUrls: ['./tab-detail-custom.component.scss']
})
export class TabDetailCustomComponent extends UIComponent
implements OnInit, AfterViewInit {
  @Input() tabClicked: any;
  @Input() data: any;

  titleAction: string = '';

  readonly tabInformation: string = 'Information';
  readonly tabField: string = 'Field';
  readonly tabContact: string ='Contact';
  readonly tabOpponent: string = 'Opponent';
  readonly tabTask: string = 'Task';
  readonly tabProduct: string = 'Product';

  // fmProcductsLines: FormModel = {
  //   formName: 'CMProducts',
  //   gridViewName: 'grvCMProducts',
  //   entityName: 'CM_Products',
  // };
  // editSettings: EditSettingsModel = {
  //   allowEditing: true,
  //   allowAdding: true,
  //   allowDeleting: true,
  //   mode: 'Normal',
  // };

  constructor(
    private inject: Injector,

  ) {
    super(inject);
  }
  ngAfterViewInit() {}
  onInit(): void {}


  addContact(){
    var contact = 'CM0103'; // contact
    this.cache.functionList(contact).subscribe((fun) => {
      let option = new SidebarModel();
     // option.DataService = this.view.dataService;
      var formMD = new FormModel();
      formMD.entityName = fun.entityName;
      formMD.formName = fun.formName;
      formMD.gridViewName = fun.gridViewName;
      formMD.funcID = contact;
      option.FormModel = JSON.parse(JSON.stringify(formMD));
      option.Width = '800px';
      option.DataService = null;
      this.titleAction = ' Bao test'
      var dialog = this.callfc.openSide(
        PopupAddCmCustomerComponent,
        ['add', this.titleAction],
        option
      );
      dialog.closed.subscribe((e) => {
  //      if (!e?.event) this.view.dataService.clear();
        // if (e && e.event != null) {
        //   this.customerDetail.listTab(this.funcID);
        // }
      });
    });
  }
}
