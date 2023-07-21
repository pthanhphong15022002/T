import { async } from '@angular/core/testing';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-gantt';
import {
  UIComponent,
  FormModel,
  SidebarModel,
  NotificationsService,
  AlertConfirmInputConfig,
} from 'codx-core';
import { PopupAddCmCustomerComponent } from '../../../cmcustomer/popup-add-cmcustomer/popup-add-cmcustomer.component';
import { CodxCmService } from '../../../codx-cm.service';
import { DP_Instances_Steps } from 'projects/codx-dp/src/lib/models/models';
import { DealsComponent } from '../../deals.component';
import { DealDetailComponent } from '../deal-detail.component';
import { CodxListContactsComponent } from '../../../cmcustomer/cmcustomer-detail/codx-list-contacts/codx-list-contacts.component';
import {
  CM_Contacts,
  CM_Contracts,
  CM_Quotations,
} from '../../../models/cm_model';
import { firstValueFrom } from 'rxjs';

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
  @Input() checkMoreReason = true;
  // @Input() mergedList: any[] = [];
  @Input() listSteps: any;
  @Input() isUpdateTab: any;

  @ViewChild('loadContactDeal') loadContactDeal: CodxListContactsComponent;
  // @Output() contactEvent = new EventEmitter<any>();
  titleAction: string = '';
  // listStep = [];
  // isUpdate = true; //xư lý cho edit trung tuy chinh ko
  listStepsProcess = [];
  listCategory = [];
  @Input() tabDetail = [];

  // titleDefault= "Trường tùy chỉnh"//truyen vay da
  readonly tabInformation: string = 'Information';
  readonly tabField: string = 'Field';
  readonly tabTask: string = 'Task';
  readonly tabContact: string = 'Contact';
  readonly tabOpponent: string = 'Opponent';
  readonly tabHistory: string = 'History';

  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
  };

  recIdOld: string = '';
  isDataLoading = true;
  grvSetupQuotation: any[] = [];
  vllStatusQuotation: any;
  grvSetupContract: any[] = [];
  vllStatusContract: any;
  grvSetupLead: any[] = [];
  vllStatusLead: any;
  modifiedOn: any;

  viewSettings: any;
  constructor(
    private inject: Injector,
    private codxCmService: CodxCmService,
    private changeDetec: ChangeDetectorRef,
    private dealComponent: DealsComponent,
    private dealDetailComponent: DealDetailComponent,
    private notificationsService: NotificationsService
  ) {
    super(inject);
  }
  ngAfterViewInit() {}
  onInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    // if (changes.dataSelected) {
    //   this.isDataLoading = true;
    //   this.dataSelected = changes.dataSelected.currentValue;
    //   this.loadContactDeal?.getListContactsByObjectId(this.dataSelected?.recID);
    // }
    // if (changes?.listSteps) {
    //   if (
    //     changes?.listSteps?.currentValue?.length > 0 &&
    //     changes?.listSteps?.currentValue !== null
    //   ) {
    //     this.isDataLoading = false;
    //     this.listSteps = changes?.listSteps.currentValue;
    //   }
    // }
  }




  checkContinueStep(isDefault, step) {
    let check = true;
    let listTask = isDefault
      ? step?.tasks?.filter((task) => task?.requireCompleted)
      : step?.tasks;
    if (listTask?.length <= 0) {
      return isDefault ? true : false;
    }
    for (let task of listTask) {
      if (task.progress != 100) {
        check = false;
        break;
      }
    }
    return check;
  }

  //event giao viec
  contactChange($event) {
    if ($event) {
      this.dealDetailComponent.getContactPerson($event.data);
    }
  }

  completedAllTasks(instanceSteps): boolean {
    var isCheckOnwer = instanceSteps?.owner ? false : true;
    if (isCheckOnwer) {
      return false;
    }
    var isCheckFields = this.checkFieldsIEmpty(instanceSteps.fields);
    if (isCheckFields) {
      return false;
    }
    return true;
  }

  checkFieldsIEmpty(fields) {
    return fields.some((x) => !x.dataValue && x.isRequired);
  }

  getHeaderText() {}
  saveDataStep(e) {
    if (e) {
    }
    // this.listSteps = e;
    // this.outDataStep.emit(this.dataStep);
  }

  // getSettingValue(type: string, fieldName: string): any {
  //   const obj = this.viewSettings[type];
  //   if (obj) {
  //     switch (fieldName) {
  //       case 'icon':
  //         return obj.icon + ' icon-22 me-2 text-gray-700';
  //       case 'name':
  //         return obj.name;
  //       case 'headerText':
  //         return obj.headerText;
  //       case 'deadValue':
  //         return obj.deadValue;
  //       case 'formModel':
  //         return obj.formModel;
  //       case 'status':
  //         return obj.status;
  //       case 'gridViewSetup':
  //         return obj.gridViewSetup;
  //       case 'createOn':
  //         return obj.gridViewSetup['CreatedOn']?.headerText;
  //     }
  //   }
  //   return '';
  // }
}
