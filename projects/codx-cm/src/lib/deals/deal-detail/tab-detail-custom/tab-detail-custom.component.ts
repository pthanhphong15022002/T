import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-gantt';
import { UIComponent, FormModel, SidebarModel } from 'codx-core';
import { PopupAddCmCustomerComponent } from '../../../cmcustomer/popup-add-cmcustomer/popup-add-cmcustomer.component';
import { CodxCmService } from '../../../codx-cm.service';

@Component({
  selector: 'codx-tab-deal-detail',
  templateUrl: './tab-detail-custom.component.html',
  styleUrls: ['./tab-detail-custom.component.scss'],
})
export class TabDetailCustomComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() tabClicked: any;
  @Input() dataSelected: any;
  @Input() formModel: any;
  titleAction: string = '';
  listStep = [];
  isUpdate = true; //xư lý cho edit trung tuy chinh ko
  listStepsProcess = [];
  listCategory = [];
  // titleDefault= "Trường tùy chỉnh"//truyen vay da
  readonly tabInformation: string = 'Information';
  readonly tabField: string = 'Field';
  readonly tabContact: string = 'Contact';
  readonly tabOpponent: string = 'Opponent';
  readonly tabTask: string = 'Task';
  readonly tabProduct: string = 'Product';

  fmProcductsLines: FormModel = {
    formName: 'CMProducts',
    gridViewName: 'grvCMProducts',
    entityName: 'CM_Products',
  };
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
  };

  constructor(private inject: Injector, private codxCmService: CodxCmService) {
    super(inject);

  }
  ngAfterViewInit() {}
  onInit(): void {
    this.executeApiCalls();
  }

  ngOnChanges(changes: SimpleChanges){
    //nvthuan
    if(changes.dataSelected){
      this.getListInstanceStep();
    //  this.dataSelected? = ch
    //  this.getListContactByObjectID(this.dataSelected?.recID);
    }
  }

  async executeApiCalls() {
    try {
      await this.getValueList();
    } catch (error) {
      console.error('Error executing API calls:', error);
    }
  }
  //nvthuan
  getListInstanceStep() {
    let instanceID = this.dataSelected?.refID;
    if (instanceID) {
      this.codxCmService.getStepInstance([instanceID]).subscribe((res) => {
        this.listStep = res;
      });
    }
  }

  // getListContactByObjectID(objectID) {
  //   this.codxCmService.getListContactByObjectID(objectID).subscribe((res) => {
  //     if (res && res.length > 0) {
  //       this.listContacts = res;
  //       this.contactPerson = this.listContacts.find((x) => x.isDefault);
  //     }
  //   });
  // }

  async getValueList() {
    this.cache.valueList('CRM010').subscribe((res) => {
      if (res.datas) {
        this.listCategory = res?.datas;
      }
    });
  }

  getNameCategory(categoryId:string) {
    return this.listCategory.filter(x=> x.value == categoryId)[0]?.text;
  }


  addContact() {
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
      this.titleAction = ' Bao test';
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

  //truong tuy chinh - đang cho bằng 1
  showColumnControl(stepID) {
    if (this.listStepsProcess?.length > 0) {
      var idx = this.listStepsProcess.findIndex((x) => x.recID == stepID);
      if (idx == -1) return 1;
      return this.listStepsProcess[idx]?.showColumnControl;
    }
    return 1;
  }
}
