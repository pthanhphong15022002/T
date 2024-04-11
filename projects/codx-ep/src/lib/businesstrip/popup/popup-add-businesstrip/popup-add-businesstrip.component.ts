import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  DialogRef,
  CodxGridviewV2Component,
  LayoutAddComponent,
  ApiHttpService,
  CacheService,
  AuthStore,
  NotificationsService,
  DialogData,
  Util,
} from 'codx-core';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ep-popup-add-businesstrip',
  templateUrl: './popup-add-businesstrip.component.html',
  styleUrls: ['./popup-add-businesstrip.component.css'],
})
export class PopupAddBusinesstripComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  dialog: DialogRef;
  data: any;
  user: any;
  actionType: string = '';
  grvSetup: any;
  vllEP010: any;
  ACObject: any;
  EPResource: any;
  EPBookingAttendeeIDs: string = '';
  BSReason: any;
  vllACObjectType: string = 'AC152i';
  ACObjectTypes = new Map<string, string>();
  editSettings: any = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'tab1',
    },
    {
      icon: 'icon-monetization_on',
      text: 'Chí phí công tác',
      name: 'tab2',
    },
  ];
  releaseCategory: any;
  hideFooter: boolean = false;
  subcriptions = new Subscription();
  @ViewChild('codxGridViewV2') codxGridViewV2: CodxGridviewV2Component;
  @ViewChild('layoutAdd') layoutAdd: LayoutAddComponent;
  @ViewChild('attachment') attachment: any;
  columnsGrid = [];
  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private auth: AuthStore,
    private codxCommonSV: CodxCommonService,
    private notiSV: NotificationsService,
    private detectorChange: ChangeDetectorRef,
    @Optional() dialogRef: DialogRef,
    @Optional() dialogData: DialogData
  ) {
    this.user = this.auth.get();
    this.dialog = dialogRef;
    if (dialogData?.data) {
      let obj = dialogData.data;
      this.actionType = obj.actionType;
      this.data = JSON.parse(JSON.stringify(obj.data));
      if (this.actionType == 'add') {
        this.data.resources = [];
        this.data.lines = [];
        this.data.resources.push({
          transID: this.data.recID,
          userID: this.user.userID,
          userName: this.user.userName,
          roleType: '1',
        });
        this.EPBookingAttendeeIDs = this.data.resources
          .map((x) => x.userID)
          .join(';');
        this.subcriptions.add(
          this.cache.companySetting().subscribe((res: any) => {
            if (res) {
              this.data.currencyID = res[0]['baseCurr'] || '';
            }
          })
        );
      } else if (this.actionType == 'edit') {
        this.getRequestByID(this.data.recID);
      } else if (this.actionType == 'coppy') {
        let requestID = obj.requestID;
        this.coppyRequestByID(requestID);
      } else {
        this.getRequestByID(this.data.recID);
        this.hideFooter = true;
      }
    }
  }

  ngOnInit(): void {
    this.subcriptions.add(
      this.cache.valueList('EP010').subscribe((vll: any) => {
        if (vll) {
          this.vllEP010 = vll.datas;
        }
      })
    );
    this.subcriptions.add(
      this.cache
        .gridViewSetup(
          this.dialog.formModel.formName,
          this.dialog.formModel.gridViewName
        )
        .subscribe((grv: any) => {
          if (grv) {
            this.grvSetup = grv;
          }
        })
    );
    this.subcriptions.add(
      this.cache.valueList(this.vllACObjectType).subscribe((vll: any) => {
        if (vll)
          vll.datas.forEach((item) =>
            this.ACObjectTypes.set(item.value.toString(), item.text)
          );
      })
    );
  }

  ngAfterViewInit(): void {
    this.columnsGrid = [{ field: 'attachments', template: this.attachment }];
    let subcribeApi = this.api
      .execSv(
        'ES',
        'ERM.Business.ES',
        'CategoriesBusiness',
        'GetCategoryByEntityNameAsync',
        [this.dialog.formModel.entityName]
      )
      .subscribe((res: any) => {
        this.releaseCategory = res;
      });
    this.subcriptions.add(subcribeApi);
  }

  ngOnDestroy(): void {
    this.subcriptions.unsubscribe();
  }

  getRequestByID(recID: string) {
    let subcribeApi = this.api
      .execSv('EP', 'EP', 'RequestsBusiness', 'GetByIDAsync', recID)
      .subscribe((res: any) => {
        if (res) {
          this.data = res;
          if (this.data.resourceID) this.getEPResource(this.data.resourceID);
          if (this.data.resources?.length > 0)
            this.EPBookingAttendeeIDs = this.data.resources
              .filter((x) => x.roleType != '2')
              .map((x) => x.userID)
              .join(';');
          this.detectorChange.detectChanges();
        }
      });
    this.subcriptions.add(subcribeApi);
  }

  coppyRequestByID(recID: string) {
    let subcribeApi = this.api
      .execSv('EP', 'EP', 'RequestsBusiness', 'GetByIDAsync', recID)
      .subscribe((res: any) => {
        if (res) {
          this.data.employeeID = res.employeeID;
          this.data.positionID = res.positionID;
          this.data.requester = res.requester;
          this.data.requesterName = res.requesterName;
          this.data.requestType = res.requestType;
          this.data.fromDate = res.fromDate;
          this.data.toDate = res.toDate;
          this.data.subType = res.subType;
          this.data.objectID = res.objectID;
          this.data.objectType = res.objectType;
          this.data.reasonID = res.reasonID;
          this.data.memo = res.memo;
          this.data.hasBooking = res.hasBooking;
          this.data.hasResources = res.hasResources;
          this.data.resourceID = res.resourceID;
          this.data.resources = res.resources;
          this.data.lines = res.lines;
          this.data.requestAmt = res.requestAmt;
          this.data.pmtMethodID = res.pmtMethodID;
          if (this.data.resourceID) this.getEPResource(this.data.resourceID);
          if (this.data.resources?.length > 0)
            this.EPBookingAttendeeIDs = this.data.resources
              .filter((x) => x.roleType != '2')
              .map((x) => x.userID)
              .join(';');
          else this.data.resources = [];
          if (!this.data.lines) this.data.lines = [];
          this.detectorChange.detectChanges();
        }
      });
    this.subcriptions.add(subcribeApi);
  }

  getEPResource(resourceID) {
    let subcribeApi = this.api
      .execSv('EP', 'EP', 'ResourcesBusiness', 'GetResourceAsync', resourceID)
      .subscribe((res: any) => {
        this.EPResource = res;
        this.detectorChange.detectChanges();
      });
    this.subcriptions.add(subcribeApi);
  }

  valueChange(event: any) {
    let field = event.field;
    let value = null;
    switch (field) {
      case 'employeeID':
        value = event.data.dataSelected[0].dataSelected;
        this.data.employeeID = value.EmployeeID;
        this.data.employeeName = value.EmployeeName;
        this.data.phone = value.Phone;
        this.data.email = value.Email;
        this.data.positionID = value.PositionID;
        this.data.requester = value.UserID;
        this.data.requesterName = value.UserName;
        this.data.bUID = value.BUID;
        this.data.owner = value.UserID;
        this.getEmployeeInfo(this.data.employeeID);
        break;
      case 'fromDate':
      case 'toDate':
        value = event.data.fromDate;
        this.data[field] = value;
        break;
      case 'subType':
        value = event.data;
        this.data.subType = value;
        break;
      case 'objectID':
        this.data.objectID = event.data;
        this.data.objectType = event.type;
        if (event.component.itemsSelected.length > 0) {
          this.ACObject = event.component.itemsSelected[0];
          if (this.ACObjectTypes)
            this.data.memo =
              this.ACObjectTypes.get(this.ACObject.ObjectType) + ' ';
          this.data.memo = this.ACObject.ObjectName;
        } else this.ACObject = null;
        break;
      case 'reasonID':
        value = event.data;
        this.data.reasonID = event.data;
        if (event.component.itemsSelected.length > 0) {
          this.BSReason = event.component.itemsSelected[0];
          if (this.data.memo)
            this.data.memo = this.BSReason.ReasonName + ' ' + this.data.memo;
          else this.data.memo = this.BSReason.ReasonName;
        } else this.BSReason = null;
        break;
      case 'memo':
        value = event.data;
        this.data.memo = value;
        break;
      case 'hasBooking':
        value = event.data;
        this.data.hasBooking = event.data;
        if (!this.data.hasBooking) {
          this.data.resourceID = null;
          this.EPResource = null;
        }
        break;
      case 'hasResources':
        value = event.data;
        this.data.hasResources = value;
        if (!this.data.hasResources) {
          this.data.resources = [];
          this.data.resources.push({
            transID: this.data.recID,
            userID: this.user.userID,
            userName: this.user.userName,
            roleType: '1',
          });
          if (this.data.resourceID && this.EPResource)
            this.data.resources.push({
              transID: this.data.recID,
              userID: this.EPResource.ResourceID,
              userName: this.EPResource.ResourceName,
              roleType: '2',
            });
        }
        this.EPBookingAttendeeIDs = this.data.resources
          .filter((x) => x.roleType != '2')
          .map((x) => x.userID)
          .join(';');
        break;
      case 'resourceID':
        value = event.data.dataSelected[0].dataSelected;
        if (this.data.resources?.length > 0) {
          let idx = this.data.resources.findIndex((x) => x.roleType == '2');
          if (idx > -1) this.data.resources.splice(idx, 1);
        }
        if (value) {
          this.EPResource = {
            recID: value.RecID,
            resourceID: value.ResourceID,
            resourceName: value.ResourceName,
            code: value.Code,
            equipments: value.Equipments
              ? value.Equipments.map((item) => ({
                  equipmentID: item.EquipmentID,
                  createdBy: item.CreatedBy,
                  createdOn: item.CreatedOn,
                }))
              : [],
          };
          this.data.resourceID = value.ResourceID;
          this.data.resources.push({
            transID: this.data.recID,
            userID: value.ResourceID,
            userName: value.ResourceName,
            roleType: '2',
          });
        } else {
          this.data.resourceID = null;
          this.EPResource = null;
        }
        break;
      case 'resources':
        value = event.data.dataSelected;
        if (value?.length > 0) {
          this.data.resources = this.data.resources.filter(
            (item: any) => item.roleType != '3'
          );
          value.forEach((item: any) => {
            let exists = this.data.resources.some((x) => x.userID == item.id);
            if (!exists)
              this.data.resources.push({
                transID: this.data.recID,
                userID: item.id,
                userName: item.text,
                roleType: '3',
              });
          });
        } else {
          this.data.resources = [];
          this.data.resources.push({
            transID: this.data.recID,
            userID: this.user.userID,
            userName: this.user.userName,
            roleType: '1',
          });
          if (this.data.resourceID && this.EPResource)
            this.data.resources.push({
              transID: this.data.recID,
              userID: this.EPResource.resourceID,
              userName: this.EPResource.resourceName,
              roleType: '2',
            });
        }
        this.EPBookingAttendeeIDs = this.data.resources
          .filter((x) => x.roleType != '2')
          .map((x) => x.userID)
          .join(';');
        break;
      default:
        break;
    }
    this.detectorChange.detectChanges();
  }

  valueCellChange(event: any) {
    let field = event.field;
    if (field == 'itemID') event.data.itemName = event.itemData.CostItemName;
    let EPRequestsLine = {
      recID: event.data.recID,
      transID: this.data.recID,
      itemID: event.data.itemID,
      itemName: event.data.itemName,
      amount: event.data.amount,
    };

    let idx = this.data.lines.findIndex(
      (item: any) => item.recID == event.data.recID
    );
    if (idx > -1) this.data.lines[idx] = EPRequestsLine;
    else this.data.lines.push(EPRequestsLine);

    if (field == 'amount')
      this.data.requestAmt = this.data.lines.reduce(
        (accumulator, currentValue) => accumulator + currentValue.amount,
        0
      );
    this.detectorChange.detectChanges();
  }

  addNewRow() {
    if (!this.codxGridViewV2) return;
    let data = { recID: Util.uid(), itemID: '', itemName: '', amount: 0 };
    this.codxGridViewV2.addRow(
      data,
      this.codxGridViewV2.dataSource.length,
      false,
      true
    );
  }

  changeDataMFGrid(event) {
    if (!event) return;
    event.forEach((x) => (x.disabled = x.functionID != 'SYS02'));
  }

  clickGridMF(event: any, data: any) {
    if (event?.functionID == 'SYS02' && data) {
      this.codxGridViewV2.deleteRow(data, true);
      if (this.data.lines.length > 0) {
        this.data.lines = this.data.lines.filter(
          (x) => x.itemID != data.itemID
        );
        if (this.data.lines.length > 0)
          this.data.requestAmt = this.data.lines.reduce(
            (accumulator, currentValue) => accumulator + currentValue.amount,
            0
          );
        else this.data.requestAmt = 0;
        this.detectorChange.detectChanges();
      }
    }
  }

  onSave(isRelease: boolean = false) {
    if (this.actionType == 'edit') {
      this.data._isEdit = true;
      this.dialog.dataService.dataSelected = this.data;
    }
    this.layoutAdd.form
      .save(null, 0, '', '', true, { allowCompare: false })
      .subscribe((res: any) => {
        if (res && !res.update?.error && !res.save?.error) {
          if (isRelease)
            this.codxCommonSV.codxReleaseDynamic(
              'EP',
              this.data,
              this.releaseCategory,
              this.dialog.formModel.entityName,
              this.dialog.formModel.funcID,
              this.data.memo,
              (res) => {
                this.callBackApproval(res, this);
              }
            );
          else this.dialog.close(this.data);
        }
      });
  }

  callBackApproval(res: any, t: any) {
    if (res?.rowCount > 0) {
      t.notiSV.notify('Gửi duyệt thành công'); // chưa có mssgCode
      t.data.status = res.returnStatus;
      t.dialog.close(t.data);
    } else t.notiSV.notify('Gửi duyệt không thành công');
  }

  atmReturnedFile(evt: any, dataLine: any) {
    if (evt) {
      if (!dataLine.attachments) dataLine.attachments = 0;
      dataLine.attachments += 1;
      if (this.data?.lines) {
        var index = (this.data.lines as any[]).findIndex(
          (x) => x.recID == dataLine.recID
        );
        this.data.lines[index] = dataLine;
      }
    }
  }

  showAttachment(evt: any, atm: any) {
    if (atm && atm.uploadFile) atm.uploadFile();
  }

  getEmployeeInfo(employeeID: string) {
    if (!employeeID) return;
    this.api
      .execSv('HR', 'ERM.Business.HR', 'HRBusiness_Old', 'GetModelEmp', [
        employeeID,
      ])
      .subscribe((res: any) => {
        if (res) {
          this.data.positionName = res.positionName;
          this.data.organizationName = res.organizationName;
          this.data.departmentName = res.departmentName;
          this.data.divisionName = res.divisionName;
          this.data.companyName = res.companyName;
        }
      });
  }
}
