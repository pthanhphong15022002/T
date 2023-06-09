import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  CacheService,
  CallFuncService,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  Util,
} from 'codx-core';
import { firstValueFrom } from 'rxjs';
import { CodxCmService } from '../../codx-cm.service';
import {
  CM_Contacts,
  CM_Customers,
  CM_Deals,
  CM_Leads,
} from '../../models/cm_model';
import { CodxListContactsComponent } from '../../cmcustomer/cmcustomer-detail/codx-list-contacts/codx-list-contacts.component';
import { CodxAddressCmComponent } from '../../cmcustomer/cmcustomer-detail/codx-address-cm/codx-address-cm.component';
import { tmpInstances } from '../../models/tmpModel';
import { PopupQuickaddContactComponent } from '../../cmcustomer/cmcustomer-detail/codx-list-contacts/popup-quickadd-contact/popup-quickadd-contact.component';

@Component({
  selector: 'lib-popup-convert-lead',
  templateUrl: './popup-convert-lead.component.html',
  styleUrls: ['./popup-convert-lead.component.css'],
})
export class PopupConvertLeadComponent implements OnInit {
  @ViewChild('imageUpload') imageUpload: ImageViewerComponent;

  @ViewChild('codxListContact') codxListContact: CodxListContactsComponent;
  @ViewChild('codxConvert') codxConvert: CodxListContactsComponent;
  @ViewChild('codxListAddress') codxListAddress: CodxAddressCmComponent;
  @ViewChild('codxLoadAdress') codxLoadAdress: CodxAddressCmComponent;

  deal: CM_Deals = new CM_Deals();
  lead: CM_Leads = new CM_Leads();
  customer: CM_Customers = new CM_Customers();
  dialog: any;
  data: any;
  titleAction = '';
  title = '';
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Cơ hội', name: 'Deal' },
    {
      icon: 'icon-people_outline',
      text: 'Khách hàng',
      name: 'Customer',
    },
    {
      icon: 'icon-contact_phone',
      text: 'Người liên hệ',
      name: 'Contacts',
    },
    {
      icon: 'con-settings',
      text: 'Thông tin nhập liệu',
      name: 'InputInformation',
    },
  ];
  formModelDeals: any;
  formModelCustomer: any;
  listCbxProcess = [];
  listParticipants = [];
  listInstanceSteps = [];
  fieldCbxParticipants = { text: 'userName', value: 'userID' };
  fieldCbxProcess = { text: 'processName', value: 'recID' };
  owner: any;
  gridViewSetupDeal: any;
  gridViewSetupCustomer: any;
  radioChecked = true;
  lstCustomer = [];
  avatarChange = false;
  customerID: any;
  lstContactCustomer = []; //List contact khách hàng lấy ra và convert thêm từ tiềm năng để load ra
  lstContactDeal = []; //List contact cơ hội được convert từ khách hàng
  lstContactDelete = [];
  listCustomFile: any[] = [];
  countAddNew = 0;
  countAddSys = 0;
  customerOld: any;
  customerNewOld: any;
  instance: tmpInstances = new tmpInstances();
  countValidate = 0;
  recIDAvt: any;
  nameAvt: any;
  modifyOnAvt: Date;
  entityName: any;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callFc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.lead = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.titleAction = dt?.data?.title;
    this.recIDAvt = this.lead?.recID;
    this.nameAvt = this.lead?.leadName;
    this.modifyOnAvt = this.lead?.modifiedOn;
    this.entityName = this.dialog.formModel?.entityName;
  }

  async ngOnInit() {
    var options = new DataRequest();
    options.entityName = 'DP_Processes';
    options.predicates = 'ApplyFor=@0 && !Deleted';
    options.dataValues = '1';
    options.pageLoading = false;
    this.listCbxProcess = await firstValueFrom(
      this.cmSv.loadDataAsync('DP', options)
    );
    if (
      this.lead.businessLineID != null &&
      this.lead.businessLineID.trim() != ''
    )
      this.getProcessIDBybusinessLineID(this.lead.businessLineID);

    this.formModelDeals = await this.cmSv.getFormModel('CM0201');
    this.gridViewSetupDeal = await firstValueFrom(
      this.cache.gridViewSetup('CMDeals', 'grvCMDeals')
    );
    this.setData();

    this.changeDetectorRef.detectChanges();
  }

  async ngAfterViewInit() {
    if (this.radioChecked) {
      this.countAddSys++;
    }

    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.changeDetectorRef.detectChanges();
  }

  onSelect(e): void {
    console.log('onSelect', e);
    this.deal.processID = e.itemData.value;
  }

  setData() {
    this.deal.recID = Util.uid();
    this.deal.channelID = this.lead?.channelID;
    this.deal.businessLineID = this.lead?.businessLineID;
    this.deal.consultantID = this.lead?.consultantID;
    // this.deal.salespersonID = this.lead?.salespersonID;
    // this.deal.owner = this.lead?.salespersonID;
    this.deal.note = this.lead?.note;
    this.deal.memo = this.lead?.memo;
    this.changeDetectorRef.detectChanges();
  }

  async getProcessIDBybusinessLineID(businessLineID) {
    var options = new DataRequest();
    options.entityName = 'CM_BusinessLines';
    options.predicates = 'RecID=@0';
    options.dataValues = businessLineID;
    options.pageLoading = false;
    var businessLine = await firstValueFrom(
      this.cmSv.loadDataAsync('CM', options)
    );

    if (this.listCbxProcess != null && this.listCbxProcess.length > 0) {
      this.deal.processID = businessLine[0]?.processID;
      this.getProcessByProcessID(this.deal.processID);
    }
  }

  async getProcessByProcessID(e) {
    var process = this.listCbxProcess.find((x) => x.recID == e);
    if (process != null) {
      if (process.permissions != null) {
        var lstPerm = process.permissions.filter((x) => x.roleType == 'P');
        this.listParticipants =
          lstPerm != null && lstPerm.length > 0
            ? await this.cmSv.getListUserByOrg(lstPerm)
            : [];
      }
      if (this.deal.processID) {
        var lstStep =
          process?.steps != null ? this.groupByStep(process?.steps) : [];
        this.deal.endDate = this.HandleEndDate(lstStep);
      }

      if (
        process.instanceNoSetting != null &&
        process.instanceNoSetting.trim() != ''
      ) {
        this.deal.dealID = await firstValueFrom(
          this.api.execSv<any>(
            'DP',
            'ERM.Business.DP',
            'InstancesBusiness',
            'GenAutoNumberInstanceNoSettingApiAsync',
            process.instanceNoSetting
          )
        );
      } else {
        this.deal.dealID = await firstValueFrom(
          this.api.execSv<any>(
            'SYS',
            'ERM.Business.AD',
            'AutoNumbersBusiness',
            'GenAutoNumberAsync',
            ['CM0201', 'CM_Deals', 'DealID']
          )
        );
      }

      this.listInstanceSteps = await firstValueFrom(
        this.api.execSv<any>(
          'DP',
          'ERM.Business.DP',
          'InstancesBusiness',
          'CreateListInstancesStepsByProcessAsync',
          this.deal?.processID
        )
      );
    }

    this.changeDetectorRef.detectChanges();
  }

  getListContactByObjectID(objectID) {
    this.cmSv.getListContactByObjectID(objectID).subscribe((res) => {
      if (res && res.length > 0) {
        this.lstContactCustomer = this.cmSv.bringDefaultContactToFront(res);
      } else {
        this.lstContactCustomer = [];
      }
      this.lstContactDeal = [];
    });
  }

  setTitle(e: any) {
    this.title =
      this.titleAction + ' ' + e.charAt(0).toLocaleLowerCase() + e.slice(1);
    //this.changDetec.detectChanges();
  }

  //#region save
  async onSave() {
    this.setRecIDConvert();
    this.convertDataInstanceAndDeal();
    this.countValidate = this.cmSv.checkValidate(
      this.gridViewSetupDeal,
      this.deal
    );
    if (this.countValidate > 0) {
      return;
    }

    if (!this.radioChecked) {
      this.countValidate = this.cmSv.checkValidate(
        this.gridViewSetupCustomer,
        this.customer
      );
      if (this.countValidate > 0) {
        return;
      }
    }

    var ischeck = true;
    var ischeckFormat = true;
    var title = '';
    var messageCheckFormat = '';

    for (let items of this.listInstanceSteps) {
      for (let item of items.fields) {
        if (item) {
          messageCheckFormat = this.checkFormat(item);
          if (messageCheckFormat) {
            ischeckFormat = false;
            break;
          }
        }
      }
      if (!ischeck || !ischeckFormat) {
        break;
      }
    }
    if (!ischeck) {
      this.notiService.notifyCode('SYS009', 0, '"' + title + '"');
      return;
    }
    if (!ischeckFormat) {
      this.notiService.notifyCode(messageCheckFormat);
      return;
    }
    setTimeout(() => {
      if (!this.radioChecked && !this.avatarChange) {
        this.entityName = JSON.parse(JSON.stringify('CM_Customers'));
        this.recIDAvt = JSON.parse(JSON.stringify(this.recIDAvt));
        this.nameAvt = JSON.parse(JSON.stringify(this.nameAvt));
        this.modifyOnAvt = JSON.parse(JSON.stringify(this.modifyOnAvt));
        this.imageUpload.loadAvatar();
      }
    }, 0);
    this.onConvert();
  }

  async onConvert() {
    var data = [];
    data = [
      this.lead.recID,
      this.customer,
      this.deal,
      this.lstContactCustomer,
      this.lstContactDeal,
      this.lstContactDelete,
    ];
    await this.api
      .execSv<any>(
        'CM',
        'ERM.Business.CM',
        'LeadsBusiness',
        'ConvertLeadToCustomerAndDealAsync',
        data
      )
      .subscribe(async (res) => {
        if (res) {
          if (this.radioChecked) {
            this.dialog.close(res);
          } else {
            if (this.avatarChange) {
              await firstValueFrom(
                this.imageUpload.updateFileDirectReload(this.customer.recID)
              );
            } else {
              await firstValueFrom(
                this.cmSv.copyFileAvata(this.recIDAvt, this.customer.recID)
              );
            }
            this.dialog.close(res);
          }
          await firstValueFrom(
            this.api.execSv<any>(
              'DP',
              'ERM.Business.DP',
              'InstancesBusiness',
              'AddInstanceAsync',
              [this.instance, this.listInstanceSteps, null]
            )
          );
        } else {
          this.dialog.close(false);
        }
      });
  }

  setRecIDConvert() {
    if (!this.radioChecked) {
      this.customer.recID = this.customerNewOld;
    } else {
      this.customer.recID = this.customerID;
    }
    this.deal.customerID = this.customer?.recID;
    // if (this.lstContactDeal != null) {
    //   this.lstContactDeal.forEach((res) => {
    //     res.recID = Util.uid();
    //   });
    // }
  }

  async convertDataInstanceAndDeal() {
    this.instance.recID = Util.uid();
    this.instance.title = this.deal?.dealName;
    this.instance.memo = this.deal?.memo;
    this.instance.endDate = this.deal?.endDate;
    this.instance.instanceNo = this.deal?.dealID;
    this.instance.owner = this.deal?.salespersonID;
    this.instance.status = '1';
    this.instance.startDate = null;
    this.instance.processID = this.deal?.processID;
    this.instance.stepID = this.deal?.stepID;
    this.deal.status = '1';
    this.deal.refID = this.instance.recID;
    this.deal.startDate = null;

    if (this.listInstanceSteps != null && this.listInstanceSteps.length > 0) {
      this.deal.stepID = this.listInstanceSteps[0]?.stepID;
      this.deal.nextStep = this.listInstanceSteps[1]?.stepID;
    }
  }

  //#endregion
  valueBusinessLine(e) {
    if (this.deal?.businessLineID != e?.data) {
      this.deal.businessLineID = e?.data;
      if (this.deal.businessLineID) {
        var processId = e.component.itemsSelected[0].ProcessID;
        if (processId != this.deal?.processID) {
          this.deal.processID = processId;

          this.getProcessByProcessID(this.deal.processID);
        }
      }
    }
  }
  async cbxProcessChange(e) {
    if (e != null && e.trim() != '') {
      if (e != this.deal?.processID) {
        this.deal.processID = e;
        if (this.listCbxProcess != null) {
        }
      }
    }
  }

  groupByStep(listStep) {
    return listStep.sort(function (a, b) {
      if (a.StepNo > 0 && b.StepNo > 0) {
        return a.StepNo - b.StepNo;
      } else if (a.StepNo > 0) {
        return -1;
      } else if (b.StepNo > 0) {
        return 1;
      } else if (a.IsSuccessStep && !b.IsSuccessStep) {
        return -1;
      } else if (!a.IsSuccessStep && b.IsSuccessStep) {
        return 1;
      } else if (a.IsFailStep && !b.IsFailStep) {
        return -1;
      } else if (!a.IsFailStep && b.IsFailStep) {
        return 1;
      } else {
        return a.StepNo - b.StepNo;
      }
    });
  }

  HandleEndDate(listSteps: any) {
    var dateNow = new Date();
    var endDate = new Date();
    for (let i = 0; i < listSteps.length; i++) {
      endDate.setDate(endDate.getDate() + listSteps[i].durationDay);
      endDate.setHours(endDate.getHours() + listSteps[i].durationHour);
      endDate = this.setTimeHoliday(
        dateNow,
        endDate,
        listSteps[i]?.excludeDayoff
      );
      dateNow = endDate;
    }
    return endDate;
  }
  setTimeHoliday(startDay: Date, endDay: Date, dayOff: string) {
    if (!dayOff || (dayOff && (dayOff.includes('7') || dayOff.includes('8')))) {
      const isSaturday = dayOff.includes('7');
      const isSunday = dayOff.includes('8');
      let day = 0;

      for (
        let currentDate = new Date(startDay);
        currentDate <= endDay;
        currentDate.setDate(currentDate.getDate() + 1)
      ) {
        day += currentDate.getDay() === 6 && isSaturday ? 1 : 0;
        day += currentDate.getDay() === 0 && isSunday ? 1 : 0;
      }
      endDay.setDate(endDay.getDate() + day);

      if (endDay.getDay() === 6 && isSaturday) {
        endDay.setDate(endDay.getDate() + 1);
      }

      if (endDay.getDay() === 0 && isSunday) {
        endDay.setDate(endDay.getDate() + (isSaturday ? 1 : 0));
      }
    }
    return endDay;
  }

  valueChangeCustom(event) {
    if (event && event.e && event.data) {
      var result = event.e?.data;
      var field = event.data;
      switch (field.dataType) {
        case 'D':
          result = event.e?.data.fromDate;
          break;
        case 'P':
        case 'R':
        case 'A':
          result = event.e;
          break;
      }
      var index = this.listInstanceSteps.findIndex(
        (x) => x.recID == field.stepID
      );
      if (index != -1) {
        if (this.listInstanceSteps[index].fields?.length > 0) {
          let idxField = this.listInstanceSteps[index].fields.findIndex(
            (x) => x.recID == event.data.recID
          );
          if (idxField != -1) {
            this.listInstanceSteps[index].fields[idxField].dataValue = result;
            let idxEdit = this.listCustomFile.findIndex(
              (x) =>
                x.recID == this.listInstanceSteps[index].fields[idxField].recID
            );
            if (idxEdit != -1) {
              this.listCustomFile[idxEdit] =
                this.listInstanceSteps[index].fields[idxField];
            } else
              this.listCustomFile.push(
                this.listInstanceSteps[index].fields[idxField]
              );
          }
        }
      }
    }
  }

  async changeRadio(e) {
    if (e.field === 'yes' && e.component.checked === true) {
      if (this.countAddSys > 0) {
        this.customerID = this.customerOld;
        this.lead.customerID = this.customerID;
      }
      this.radioChecked = true;
      this.getListContactByObjectID(this.customerID);
      this.countAddSys++;
    } else if (e.field === 'no' && e.component.checked === true) {
      this.radioChecked = false;
      this.setDataCustomer();
      if (this.countAddNew == 0) {
        this.customerID = Util.uid();
        this.customerNewOld = this.customerID;
        this.customer.recID = this.customerNewOld;
      }
      this.formModelCustomer = await this.cmSv.getFormModel('CM0101');

      this.gridViewSetupCustomer = await firstValueFrom(
        this.cache.gridViewSetup('CMCustomers', 'grvCMCustomers')
      );

      this.countAddNew++;

      this.getListContactByObjectID(this.customerNewOld);
    }
  }

  setDataCustomer() {
    this.customer.recID = null;
    this.customer.customerName = this.lead?.leadName;
    this.customer.phone = this.lead?.companyPhone;
    this.customer.faxNo = this.lead?.faxNo;
    this.customer.webPage = this.lead?.webPage;
    this.customer.industries = this.lead?.industries;
    this.customer.annualRevenue = this.lead?.annualRevenue;
    this.customer.headcounts = this.lead?.headcounts;
    this.customer.establishDate = this.lead?.establishDate;
    this.customer.channelID = this.lead?.channelID;
  }

  valueChangeOwner(e) {
    this.deal.salespersonID = e;
    this.deal.owner = e;
  }
  valueChangeCustomer(e) {
    this.customer[e.field] = e?.data;
    if (e.field == 'customerName' && e?.data) {
      this.recIDAvt = e.data;
    }
  }
  valueTagChange(e) {
    this.data.tags = e.data;
  }

  valueChange(e) {
    this.deal[e.field] = e?.data;
    if (e.field == 'customerID') {
      this.customerID = e?.data ? e.data : null;
      if (this.customerID) {
        this.customerOld = this.customerID;
        this.lead.customerID = this.customerID;
        this.getListContactByObjectID(this.customerID);
      }
    }
  }

  valueDateChange(e, type) {
    if (e) {
      if (type == 'deal') {
        this.deal[e.field] = e?.data?.fromDate;
      } else {
        this.customer[e.field] = e?.data?.fromDate;
      }
    }
  }

  checkFormat(field) {
    if (field.dataType == 'T') {
      if (field.dataFormat == 'E') {
        var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (
          !field?.dataValue?.toLowerCase().match(validEmail) &&
          field?.dataValue
        ) {
          return 'SYS037';
        }
      }
      if (field.dataFormat == 'P') {
        var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (
          !field?.dataValue?.toLowerCase().match(validPhone) &&
          field?.dataValue
        ) {
          return 'RS030';
        }
      }
    }
    return '';
  }
  //#region Contact

  objectConvert(e) {
    if (e.e == true) {
      if (e?.data != null) {
        var tmpContact = new CM_Contacts();
        tmpContact = JSON.parse(JSON.stringify(e.data));
        tmpContact.recID = Util.uid();
        tmpContact.refID = e.data.recID;
        tmpContact.checked = false;
        if (!this.lstContactCustomer.some((x) => x.refID == tmpContact.refID)) {
          var check = this.lstContactCustomer.findIndex(
            (x) => x.isDefault == true
          );
          if (tmpContact.isDefault == true) {
            if (check != -1) {
              var nameDefault = this.lstContactCustomer.find(
                (x) => x.isDefault
              )?.contactName;
              var config = new AlertConfirmInputConfig();
              config.type = 'YesNo';
              this.notiService
                .alertCode('CM005', null, "'" + nameDefault + "'")
                .subscribe((x) => {
                  if (x.event.status == 'Y') {
                    this.lstContactCustomer[check].isDefault = false;
                  } else {
                    tmpContact.isDefault = false;
                  }
                  this.lstContactCustomer.push(Object.assign({}, tmpContact));
                  this.codxListContact.loadListContact(this.lstContactCustomer);
                  this.changeDetectorRef.detectChanges();
                });
            } else {
              this.lstContactCustomer.push(Object.assign({}, tmpContact));
              this.codxListContact.loadListContact(this.lstContactCustomer);
            }
          } else {
            this.lstContactCustomer.push(Object.assign({}, tmpContact));
            this.codxListContact.loadListContact(this.lstContactCustomer);
          }
        }
      }
    } else {
      var index = this.lstContactCustomer.findIndex(
        (x) => x.refID == e?.data?.recID
      );
      if (index != -1) {
        var indexDeal = this.lstContactDeal.findIndex(
          (x) => this.lstContactCustomer[index].recID == x.refID
        );
        this.lstContactCustomer[index].refID = null;
        this.lstContactCustomer.splice(index, 1);
        this.codxListContact.loadListContact(this.lstContactCustomer);

        if (indexDeal != -1) {
          this.lstContactDeal.splice(indexDeal, 1);
        }
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  objectConvertDeal(e) {
    if (e.e == true) {
      if (e.data) {
        var tmp = new CM_Contacts();
        tmp = JSON.parse(JSON.stringify(e.data));
        tmp.recID = Util.uid();
        tmp.refID = e.data.recID;
        tmp.objectType = '4';
        tmp.isDefault = false;
        var indexCus = this.lstContactCustomer.findIndex(
          (x) => x.recID == e.data.recID
        );

        if (!this.lstContactDeal.some((x) => x.refID == e?.data?.recID)) {
          this.lstContactDeal.push(tmp);
          this.codxConvert.loadListContact(this.lstContactDeal);
        }
        if (indexCus != -1) {
          this.lstContactCustomer[indexCus].checked = true;
        }
        if (tmp.objectType) this.popupEditRoleDeal(tmp, e.data);
      }
    } else {
      var index = this.lstContactDeal.findIndex(
        (x) => x.refID == e?.data?.recID
      );
      this.lstContactDeal.splice(index, 1);
    }
    this.changeDetectorRef.detectChanges();
  }

  contactEventCustomer(e) {
    if (e.data) {
      var findIndex = this.lstContactDeal.findIndex(
        (x) => x.refID == e.data?.recID
      );
      if (e.action == 'edit') {
        if (findIndex != -1) {
          var isDefault = this.lstContactDeal[findIndex]?.isDefault;
          var role = this.lstContactDeal[findIndex]?.role;

          this.lstContactDeal[findIndex] = JSON.parse(JSON.stringify(e.data));
          this.lstContactDeal[findIndex].isDefault = isDefault;
          this.lstContactDeal[findIndex].role = role;
        }
      } else {
        this.lstContactDelete.push(Object.assign({}, e?.data));
        if (findIndex != -1) {
          this.lstContactDeal.splice(findIndex, 1);
        }
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  contactEventDeal(e) {
    if (e.data) {
      var findIndex = this.lstContactCustomer.findIndex(
        (x) => x.recID == e.data?.refID
      );
      if (e.action == 'edit') {
        if (findIndex != -1) {
          var isDefault = this.lstContactCustomer[findIndex].isDefault;
          this.lstContactCustomer[findIndex] = JSON.parse(
            JSON.stringify(e.data)
          );
          this.lstContactCustomer[findIndex].recID = e.data.refID;
          this.lstContactCustomer[findIndex].role = null;
          this.lstContactCustomer[findIndex].isDefault = isDefault;
          this.codxListContact.loadListContact(this.lstContactCustomer);
        }
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  lstContactEmit(e) {
    this.lstContactCustomer = e;
  }

  popupEditRoleDeal(tmp, data) {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CMContacts';
    dataModel.gridViewName = 'grvCMContacts';
    dataModel.entityName = 'CM_Contacts';
    dataModel.funcID = 'CM0102';
    var title = '';
    opt.FormModel = dataModel;
    this.cache
      .moreFunction(dataModel.formName, dataModel.gridViewName)
      .subscribe((fun) => {
        if (fun && fun.length) {
          let m = fun.find((x) => x.functionID == 'CM0102_4');
          if (m) title = m.defaultName;
        }
        this.cache
          .gridViewSetup(dataModel.formName, dataModel.gridViewName)
          .subscribe((res) => {
            var obj = {
              moreFuncName: title ?? 'Cập nhật vai trò',
              action: 'editRole',
              dataContact: data,
              type: 'formAdd',
              recIDCm: this.deal?.recID,
              objectType: '4',
              objectName: this.deal?.dealName,
              gridViewSetup: res,
              listContacts: this.lstContactDeal,
              customerID: null,
            };
            var dialog = this.callFc.openForm(
              PopupQuickaddContactComponent,
              '',
              500,
              250,
              '',
              obj,
              '',
              opt
            );
            dialog.closed.subscribe((e) => {
              if (e && e?.event) {
                if (e.event?.recID) {
                  var index = this.lstContactDeal.findIndex(
                    (x) => x.recID != e.event?.recID && x.isDefault
                  );
                  if (index != -1) {
                    if (e?.event?.isDefault) {
                      this.lstContactDeal[index].isDefault = false;
                    }
                  }
                  tmp.isDefault = e?.event?.isDefault;
                  tmp.role = e?.event?.role;
                }
              }
            });
          });
      });
  }
  //#endregion

  changeAvatar() {
    this.avatarChange = true;
    if (this.avatarChange) {
      this.recIDAvt = this.customer?.recID;
      this.entityName = 'CM_Customers';
      this.nameAvt = this.customer?.customerName;
      this.modifyOnAvt = this.customer?.modifiedOn;
    }
  }
}
