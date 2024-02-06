import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { CustomFieldService } from '../../custom-field.service';

@Component({
  selector: 'lib-popup-custom-field',
  templateUrl: './popup-custom-field.component.html',
  styleUrls: ['./popup-custom-field.component.css'],
})
export class PopupCustomFieldComponent implements OnInit {
  fields = [];
  dialog: any;
  titleHeader = '';
  currentRate = 3.5;
  hovered = 0;
  vllShare = '';
  errorMessage = '';
  checkErr = false;
  checkRequired = false;
  isSaving = false;
  isAddComplete: any = true;
  objectIdParent: any;
  customerID: any; //Khách hàng cơ hội

  arrCaculateField = []; //cac field co tinh toán
  point: string = ','; //dấu phân cách thập phân
  isAdd = false;
  taskID = ''; //task
  isShowMore = false; //mở rộng popup
  widthDefault = '550';
  fieldOther = []; //Là form công việc

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private customFieldSV: CustomFieldService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.fields = JSON.parse(JSON.stringify(dt?.data?.data));
    this.titleHeader = dt?.data?.titleHeader;
    this.objectIdParent = dt?.data?.objectIdParent;
    this.customerID = dt?.data?.customerID;
    this.taskID = dt?.data?.taskID;
    this.fieldOther = dt?.data?.fieldOther ?? [];

    this.isAdd = dt?.data?.isAdd ?? false;
    this.arrCaculateField = this.fields.filter((x) => x.dataType == 'CF');
    if (this.arrCaculateField?.length > 0)
      this.arrCaculateField.sort((a, b) => {
        if (a.dataFormat.includes('[' + b.fieldName + ']')) return 1;
        else if (b.dataFormat.includes('[' + a.fieldName + ']')) return -1;
        else return 0;
      });
    //lấy độ rộng popup
    this.widthDefault = this.dialog.dialog.width
      ? this.dialog.dialog.width.toString()
      : '550';
  }

  ngOnInit(): void {
    // this.checkRequired = this.data.some((x) => x.isRequired == true);
    // this.cache.message('SYS028').subscribe((res) => {
    //   if (res) this.errorMessage = res.customName || res.defaultName;
    // });
  }

  valueChangeCustom(event) {
    //bo event.e vì nhan dc gia trị null
    if (event && event.data) {
      var result = event.e?.data;
      var field = event.data;
      switch (field.dataType) {
        case 'D':
          result = event.e?.data.fromDate;
          break;
        case 'P':
        case 'R':
        case 'A':
        case 'C':
        case 'L':
        case 'TA':
        case 'PA':
          result = event.e;
          break;
      }

      // this.fields.forEach((x) => {
      //   if (x.recID == field.recID) x.dataValue = result;
      // });
      //no bij map nguoc dataa
      let index = this.fields.findIndex((x) => x.recID == field.recID);
      if (index != -1) {
        this.fields[index] = this.upDataVersion(this.fields[index], result);
        // this.fields[index].dataValue = result;
        if (field.dataType == 'N') this.caculateField();
      }
    }
  }
  // partValue(item) {
  //   return JSON.parse(JSON.stringify(item));
  // }

  checkFormat(field) {
    if (field.dataType == 'T') {
      if (field.dataFormat == 'E') {
        var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!field.dataValue.toLowerCase().match(validEmail)) {
          //this.notiService.notifyCode('SYS037');
          this.cache.message('SYS037').subscribe((res) => {
            if (res) {
              let errorMessage = res.customName || res.defaultName;
              this.notiService.notify(errorMessage, '2');
            }
          });
          return false;
        }
      }
      if (field.dataFormat == 'P') {
        var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (!field.dataValue.toLowerCase().match(validPhone)) {
          // this.notiService.notifyCode('RS030');
          this.cache.message('RS030').subscribe((res) => {
            if (res) {
              let errorMessage = res.customName || res.defaultName;
              this.notiService.notify(errorMessage, '2');
            }
          });
          return false;
        }
      }
    }
    return true;
  }

  onSave() {
    if (this.fields?.length == 0 || !this.isAddComplete) return;

    let check = true;
    let checkFormat = true;
    this.fields.forEach((f) => {
      if (!f.dataValue || f.dataValue?.toString().trim() == '') {
        if (f.isRequired) {
          this.notiService.notifyCode('SYS009', 0, '"' + f.title + '"');
          check = false;
        }
      } else checkFormat = this.checkFormat(f);
    });
    if (!check || !checkFormat) return;
    if (this.isSaving) return;
    this.isSaving = true;
    let data = [this.fields[0]?.stepID, this.fields, this.taskID];
    this.api
      .exec<any>(
        'DP',
        'InstancesStepsBusiness',
        'UpdateInstanceStepFielsByStepIDAsync',
        data
      )
      .subscribe((res) => {
        if (res) {
          this.dialog.close(this.fields);
          this.notiService.notifyCode('SYS007');
          this.changeDetectorRef.detectChanges();
        } else this.dialog.close();
      });
  }

  addFileCompleted(e) {
    this.isAddComplete = e;
  }

  //----------------------CACULATE---------------------------//
  caculateField() {
    if (!this.arrCaculateField || this.arrCaculateField?.length == 0) return;
    let fieldsNum = this.fields.filter((x) => x.dataType == 'N');
    // let fieldsNum = this.fields.filter(
    //   (x) => x.dataType == 'N' || x.dataType == 'CF'
    // );
    if (!fieldsNum || fieldsNum?.length == 0) return;
    if (this.fieldOther?.length > 0) {
      //lấy các trường liên quan
      fieldsNum = fieldsNum.concat(this.fieldOther);
    }

    this.arrCaculateField.forEach((obj) => {
      let dataFormat = obj.dataFormat;
      // let check = field == null ? true : obj.recID == field.recID;
      // if (!check) return;
      // if (field != null && fieldName != null && dataValue != null)
      //   dataFormat.replaceAll('[' + fieldName + ']', dataValue);
      fieldsNum.forEach((f) => {
        if (dataFormat.includes('[' + f.fieldName + ']')) {
          if (!f.dataValue?.toString()) return;
          let dataValue = f.dataValue;
          // if (versionID) {
          //   let ver = f?.version?.find((x) => x.refID == versionID);
          //   if (ver) dataValue = ver?.dataValue;
          // }

          if (f.dataFormat == 'P') dataValue = dataValue + '/100';
          dataFormat = dataFormat.replaceAll(
            '[' + f.fieldName + ']',
            dataValue
          );
        }
      });

      this.arrCaculateField.forEach((x) => {
        if (dataFormat.includes('[' + x.fieldName + ']')) {
          if (!x.dataValue?.toString()) return;
          let dataValue = x.dataValue;
          dataFormat = dataFormat.replaceAll(
            '[' + x.fieldName + ']',
            dataValue
          );
        }
      });

      if (!dataFormat.includes('[')) {
        //tinh toán
        obj.dataValue = this.customFieldSV.caculate(dataFormat);
        //tính toan end
        let index = this.fields.findIndex((x) => x.recID == obj.recID);
        if (index != -1) {
          this.fields[index] = this.upDataVersion(
            this.fields[index],
            obj.dataValue,
            fieldsNum
          );
        }

        //this.getElement(obj.recID);
        this.changeDetectorRef.detectChanges();
      } else if (obj.dataValue) {
        //Chua xu ly
      }
    });
  }

  //------------------END_CACULATE--------------------//

  //updata Version
  upDataVersion(field, value, listFN = []) {
    field.dataValue = value;
    if (this.taskID) {
      if (field?.versions?.length > 0) {
        let idx = field?.versions.findIndex((x) => x.refID == this.taskID);
        if (idx != -1) field.versions[idx].dataValue = value;
        else {
          let vs = field?.versions;
          let obj = {
            refID: this.taskID,
            dataValue: value,
            createdOn: new Date(),
          };
          vs.push(obj);
          field.versions = vs;
        }
      } else {
        field['versions'] = [
          {
            refID: this.taskID,
            dataValue: value,
            createdOn: new Date(),
          },
        ];
      }
    } else {
      //update cac version
      if (listFN?.length > 0) {
        var versions = field.versions;
        if (versions?.length > 0) {
          versions.forEach((vs) => {
            let listConver = [];
            listFN.forEach((fn) => {
              let f = JSON.parse(JSON.stringify(fn));
              var vsion = f?.versions.find((x) => x.refID == vs.refID);
              if (vsion != null) f.dataValue = vsion.dataValue;
              listConver.push(f);
            });
            let dataVer = this.caculateVersionField(listConver, field);
            if (dataVer != null) vs.dataValue = dataVer;
          });
        }
      }
    }

    return field;
  }
  //cacule Version
  caculateVersionField(fieldsN, fieldCF) {
    let dataFormat = fieldCF.dataFormat;
    fieldsN.forEach((f) => {
      if (
        dataFormat.includes('[' + f.fieldName + ']') &&
        f.dataValue?.toString()
      ) {
        let dataValue = f.dataValue;
        if (f.dataFormat == 'P') dataValue = dataValue + '/100';
        dataFormat = dataFormat.replaceAll('[' + f.fieldName + ']', dataValue);
      }
    });

    if (!dataFormat.includes('[')) {
      //tinh toán
      return this.customFieldSV.caculate(dataFormat);
    }
    return null;
  }

  //openpopup
  rezisePopup(width = '1000') {
    this.isShowMore = !this.isShowMore;
    this.dialog.setWidth(this.isShowMore ? width : this.widthDefault);
    this.changeDetectorRef.detectChanges();
  }

  getElement(recID) {
    let el = document.getElementById(recID);
    if (el) {
      debugger;
    }
  }
}
