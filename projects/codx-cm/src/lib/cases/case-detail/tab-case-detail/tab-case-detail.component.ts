import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-gantt';
import { UIComponent, FormModel } from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';

@Component({
  selector: 'codx-tab-case-detail',
  templateUrl: './tab-case-detail.component.html',
  styleUrls: ['./tab-case-detail.component.scss'],
})
export class TabCaseDetailComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() tabClicked: any;
  @Input() dataSelected: any;
  @Input() formModel: FormModel;
  titleAction: string = '';
  listStep = [];
  isUpdate = true; //xư lý cho edit trung tuy chinh ko
  listStepsProcess = [];
  listCategory = [];


  casesType:string='';
  readonly tabInformation: string = 'Information';
  readonly tabField: string = 'Field';
  readonly tabTask: string = 'Task';


  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
  };

  constructor(
    private inject: Injector,
    private cmService: CodxCmService) {
    super(inject);
    this.executeApiCalls();
  }
  ngAfterViewInit() {}
  onInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelected']) {
      this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
      this.casesType = this.dataSelected?.caseType;
      // if (changes['dataSelected'].currentValue != null && changes['dataSelected'].currentValue?.recID) {
      //   // if (changes['dataSelected'].currentValue?.recID == this.caseId) return;
      //   // this.caseId = changes['dataSelected'].currentValue?.recID;
      //   // this.getContactByObjectID(changes['dataSelected'].currentValue?.customerID);
      // }
    }

  }

  async executeApiCalls() {
    try {
      await this.getValueList();
    } catch (error) {
      console.error('Error executing API calls:', error);
    }
  }

  async getListInstanceStep() {
    let instanceID = this.dataSelected?.refID;
    if (instanceID) {
      this.cmService.getStepInstance([instanceID]).subscribe((res) => {
        this.listStep = res;
      });
    }
  }

  async getValueList() {
    this.cache.valueList('CRM010').subscribe((res) => {
      if (res.datas) {
        this.listCategory = res?.datas;
      }
    });
  }

  getNameCategory(categoryId: string) {
    return this.listCategory.filter((x) => x.value == categoryId)[0]?.text;
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
