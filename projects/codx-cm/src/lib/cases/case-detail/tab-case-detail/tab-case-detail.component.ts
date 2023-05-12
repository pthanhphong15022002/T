import { AfterViewInit, Component, Injector, Input, OnInit } from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-gantt';
import { UIComponent, FormModel } from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';

@Component({
  selector: 'codx-tab-case-detail',
  templateUrl: './tab-case-detail.component.html',
  styleUrls: ['./tab-case-detail.component.scss']
})
export class TabCaseDetailComponent extends UIComponent
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
  readonly tabTask: string = 'Task';


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

  constructor(private inject: Injector, private cmService: CodxCmService) {
    super(inject);
    this.executeApiCalls();
  }
  ngAfterViewInit() {}
  onInit(): void {
    //this.getListInstanceStep();
  }

  async executeApiCalls() {
    try {
    //  await this.getListInstanceStep();
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

  getNameCategory(categoryId:string) {
    return this.listCategory.filter(x=> x.value == categoryId)[0]?.text;
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
