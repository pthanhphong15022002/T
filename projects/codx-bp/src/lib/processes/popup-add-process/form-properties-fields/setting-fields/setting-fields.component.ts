import { D } from '@angular/cdk/keycodes';
import {
  Component,
  Input,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  AfterViewInit,
  SimpleChanges,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  DataRequest,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { tempVllBP } from 'projects/codx-bp/src/lib/models/models';
import { CodxBpService } from 'projects/codx-bp/src/public-api';
import { tempVllDP } from 'projects/codx-dp/src/lib/models/models';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';

@Component({
  selector: 'codx-setting-fields',
  templateUrl: './setting-fields.component.html',
  styleUrls: ['./setting-fields.component.scss'],
})
export class SettingFieldsComponent implements AfterViewInit {
  @Input() dataFormat: any;
  @Input() dataCurrent: any = {};
  @Input() lstFields = [];
  @Input() formModel: FormModel = {
    formName: 'DPStepsFields',
    gridViewName: 'grvDPStepsFields',
    entityName: 'DP_Steps_Fields',
  };
  @Output() dataValueEmit = new EventEmitter<any>();
  serviceTemp = 'SYS';
  assemblyNameTemp = 'SYS';
  classNameTemp = 'ValueListBusiness';
  methodTemp = 'GetVllCustomsByFormatAsync';
  requestTemp = new DataRequest();
  lstDatasVlls = [];
  dataVll: any = {
    textValue: '',
    color: '',
    backgroundColor: '',
  };
  indexCurrentvll = -1;
  isTime = false;
  minValue = 0;
  maxValue = 5;
  rank = {
    icon: null,
    minValue: 0,
    maxValue: 5,
    color: '',
  };
  maxNumber = 0;
  user: any;
  processNo: any;
  listVll = [];
  tempVllBP: tempVllBP;
  crrVll: tempVllDP;
  loaded: boolean;
  isEditVll: boolean = false;
  isRender: boolean = true; //cho phép binding khi save thành công.
  isChangeColor: boolean = false;
  constructor(
    private detectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private bpSv: CodxBpService,
    private api: ApiHttpService,
    private authstore: AuthStore,
    private notiSv: NotificationsService
  ) {
    this.user = this.authstore.get();
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // this.loadDataVll();
  }

  ngAfterViewInit(): void {
    if (this.dataCurrent) {
      this.loadData(this.dataCurrent);
    }
  }

  //#region loadData
  async loadData(data) {
    this.lstDatasVlls = [];
    this.isRender = true;
    this.isChangeColor = false;
    this.crrVll = null;
    if (data) {
      switch (data?.controlType) {
        case 'ValueList':
          this.loadDataVll();
          if (data?.refValue != null && data?.refValue?.trim() != '') {
            this.api
              .execSv<any>(
                this.serviceTemp,
                this.assemblyNameTemp,
                this.classNameTemp,
                'GetAsync',
                [data?.refValue]
              )
              .subscribe((res) => {
                if (res) {
                  this.crrVll = res;
                  if (this.crrVll?.defaultValues) {
                    let values = this.crrVll?.defaultValues?.split(';');
                    values.forEach((ele, i) => {
                      this.lstDatasVlls.push({
                        value: i.toString(),
                        textValue: ele,
                        icon: '',
                        color: '',
                        backgroundColor: '',
                      });
                    });
                    if (this.crrVll?.iconSet) {
                      let icon = this.crrVll?.iconSet?.split(';');
                      icon.forEach((ele, i) => {
                        this.lstDatasVlls[i].icon = ele;
                      });
                    }
                    if (this.crrVll?.colorSet) {
                      let backgroundColor = this.crrVll?.colorSet?.split(';');
                      backgroundColor.forEach((ele, i) => {
                        this.lstDatasVlls[i].backgroundColor = ele;
                      });
                    }
                    if (this.crrVll?.textColorSet) {
                      let textColorSet = this.crrVll?.textColorSet?.split(';');
                      textColorSet.forEach((ele, i) => {
                        this.lstDatasVlls[i].color = ele;
                      });
                    }
                  }
                }
              });
          } else {
            if (this.maxNumber > 0) {
              this.crrVll = new tempVllBP();
              this.crrVll.language = this.user.language;
              this.crrVll.createdBy = this.user.userID;
              this.crrVll.listType = '1'; //luu kieu nao de khanh tinh sau 2
              this.crrVll.version = 'x00.01';

              if (!this.processNo) {
                this.processNo = await firstValueFrom(
                  this.bpSv.genAutoNumber('BPT1', 'BP_Processes', 'ProcessNo')
                );
              }
              this.crrVll.listName =
                'BPF' + this.processNo + '-' + this.maxNumber;
            } else await this.getDefaultVll(500);
          }
          break;
        case 'Datetime':
          this.isTime = data?.dataType == 'F' ? true : false;
          break;
        case 'YesNo':
          break;
        default:
          break;
      }
    }
  }

  async loadDataVll() {
    this.loaded = false;
    this.processNo = await firstValueFrom(
      this.bpSv.genAutoNumber('BPT1', 'BP_Processes', 'ProcessNo')
    );

    this.requestTemp.entityName = 'SYS_ValueList';
    this.requestTemp.predicate = 'Language=@0 && ListName.StartsWith(@1)';
    this.requestTemp.dataValue = this.user.language + ';BPF' + this.processNo;
    // this.requestTemp.predicate = 'Language=@0 ';
    // this.requestTemp.dataValue = this.user.language;
    this.requestTemp.pageLoading = false; //load all

    this.fetch().subscribe((item) => {
      this.listVll = item;

      this.maxNumber = this.maxLength();
      this.loaded = true;
      this.detectorRef.markForCheck();
    });
  }

  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.serviceTemp,
        this.assemblyNameTemp,
        this.classNameTemp,
        this.methodTemp,
        this.requestTemp
      )
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response && response[0] ? response[0] : [];
        })
      );
  }

  maxLength() {
    if (this.listVll?.length > 0) {
      let maxLength = this.listVll.sort((a, b) => {
        let numA =
          a.value.lastIndexOf('-') != -1
            ? a.value.substring(a.value.lastIndexOf('-') + 1)
            : 0;
        let numB =
          b.value.lastIndexOf('-') != -1
            ? b.value.substring(b.value.lastIndexOf('-') + 1)
            : 0;
        return Number.parseInt(numA) - Number.parseInt(numB);
      });

      let max = maxLength[maxLength.length - 1];
      let maxNum =
        max.value.lastIndexOf('-') != -1
          ? Number.parseInt(max.value.substring(max.value.lastIndexOf('-') + 1))
          : 0;
      return typeof maxNum == 'number' ? maxNum + 1 : this.listVll.length;
    } else return 0;
  }
  async getDefaultVll(timeOut = 500) {
    setTimeout(async () => {
      if (!this.crrVll) {
        this.crrVll = new tempVllDP();
        this.crrVll.language = this.user.language;
        this.crrVll.createdBy = this.user.userID;
        this.crrVll.listType = '1'; //luu kieu nao de khanh tinh sau 2
        this.crrVll.version = 'x00.01';
      }
      if (this.loaded) {
        if (!this.processNo)
          this.processNo = await firstValueFrom(
            this.bpSv.genAutoNumber('DP0204', 'DP_Processes', 'ProcessNo')
          );
        this.crrVll.listName = 'BPF' + this.processNo + '-' + this.maxNumber;
      } else {
        timeOut += 500;
        this.getDefaultVll(timeOut);
      }
    }, timeOut);
  }
  //#endregion

  //#region event
  valueDateChange(e) {
    if (e) {
      this.dataCurrent[e?.field] = e?.data?.fromDate || null;
      if (e?.field == 'defaultValue')
        this.dataCurrent['dataFormat'] = e?.data?.fromDate ?? null;
      if (this.isRender) this.dataValueEmit.emit({ data: this.dataCurrent });
      this.detectorRef.detectChanges();
    }
  }

  valueRankChange(e) {
    if (e) {
      if (e?.field == 'minValue' || e?.field == 'maxValue') {
        this.dataCurrent.rank[e?.field] = e?.data;
      } else {
        if (this.dataCurrent?.rank?.type != '1') {
          this.dataCurrent.rank[e?.field] = e?.data;
        }
      }
      if (this.isRender) this.dataValueEmit.emit({ data: this.dataCurrent });
    }
    this.detectorRef.detectChanges();
  }

  valueChange(e) {
    if (this.dataCurrent[e?.field] != e?.data) {
      this.dataCurrent[e?.field] = e?.data;
      switch (e?.field) {
        case 'title':
          this.dataCurrent['fieldName'] = this.bpSv.createAutoNumber(e?.data, this.lstFields, 'fieldName');
          break;
        case 'defaultValue':
          this.dataCurrent['dataFormat'] = e?.data;
          break;
        case 'isTime':
          this.isTime = e?.data;
          this.dataCurrent['dataType'] = this.isTime ? 'F' : 'd';
          break;
        case 'icon':
        case 'color':
        case 'backgroundColor':
          if (this.indexCurrentvll != -1) {
            this.lstDatasVlls[this.indexCurrentvll][e?.field] = e?.data;
          } else {
            this.indexCurrentvll = this.lstDatasVlls.length;
            let datas = { textValue: '' };
            datas[e?.field] = e?.data;
            datas['value'] = this.indexCurrentvll;
            this.lstDatasVlls.push(datas);
          }
          if (e?.field == 'icon') {
            if (this.dataCurrent.refValue) {
              this.saveVll('edit');
            } else {
              this.saveVll('add');
            }
          } else {
            this.isChangeColor = true;
          }

          break;
        case 'multiselect':
          if (this.dataCurrent?.controlType == 'ValueList') {
            if (this.dataCurrent.refValue) {
              this.saveVll('edit');
            } else {
              this.saveVll('add');
            }
          }
          break;
        case 'Combobox':
          break;
      }

      if (
        e?.field != 'icon' &&
        e?.field != 'color' &&
        e?.field != 'backgroundColor'
      ) {
        if (this.isRender) this.dataValueEmit.emit({ data: this.dataCurrent });
      }
    }

    this.detectorRef.markForCheck();
  }

  changeRadio(e, type) {
    if (e.component.checked === true) {
      switch (e?.field) {
        case 'dropDown':
          this.dataCurrent['refType'] =
            this.dataCurrent.controlType == 'Combobox' ? '3' : '2';
          break;
        case 'checkBox':
          this.dataCurrent['refType'] = '2C';
          break;
        case 'int':
          this.dataCurrent['dataType'] = 'i';
          break;
        case 'float':
          this.dataCurrent['dataType'] = 'f';
          break;
        case 'percent':
          this.dataCurrent['dataType'] = 'p';
          break;
        case 'switch':
          this.dataCurrent['dataType'] = 's';
          break;
        case 'popup':
          this.dataCurrent['dataType'] = this.dataCurrent.controlType == 'Combobox' ? '3P' : 'P';
          break;
        case 'rankNumber':
          this.dataCurrent.rank.type = '1';
          break;
        case 'rankIcon':
          this.dataCurrent.rank.type = '2';
          break;
      }
    }
    this.dataValueEmit.emit({ data: this.dataCurrent });
    this.detectorRef.detectChanges();
  }

  setValueRadio(type) {
    let bool = false;
    switch (type) {
      case 'dropDown':
        bool = this.dataCurrent['dataType'] == 'd'; //dropDown
        break;
      case 'checkBox':
        bool = this.dataCurrent['dataType'] == 'c'; //dropDown
        break;
      case 'int':
        bool = this.dataCurrent['dataType'] == 'i'; //dropDown
        break;
      case 'float':
        bool = this.dataCurrent['dataType'] == 'f'; //dropDown
        break;
      case 'percent':
        bool = this.dataCurrent['dataType'] == 'p'; //dropDown
        break;
      case 'switch':
        bool = this.dataCurrent['dataType'] == 's'; //dropDown
        break;
      case 'popup':
        bool = this.dataCurrent['dataType'] == 'po'; //dropDown
        break;
      case 'rankNumber':
        bool = this.dataCurrent['dataType'] == 'rn'; //dropDown
        break;
      case 'rankIcon':
        bool = this.dataCurrent['dataType'] == 'ri'; //dropDown
        break;
    }
    return bool;
  }
  //#endregion

  //#region remove field
  removeField(data) {
    if (data?.controlType == 'ValueList') {
      this.dataCurrent = data;
      this.deleteVll(false);
    }
    this.dataValueEmit.emit({ data: data, type: 'delete' });
  }
  //#endregion

  //#region setting list vll
  //save vll
  async saveVll(action = 'add') {
    if(this.crrVll?.listName == null || this.crrVll?.listName?.trim() == ''){
      this.isRender = false;

    }
    if (this.lstDatasVlls == null || this.lstDatasVlls?.length == 0) {
      this.isRender = false;
      return;
    }

    var checkValidate = this.lstDatasVlls.some(
      (x) =>
        x.value == null ||
        x.value?.trim == '' ||
        x.textValue == null ||
        x.textValue?.trim() == ''
    );
    if (checkValidate) {
      this.isRender = false;
      return;
    }
    let vl = [];
    let textColorSet = [];
    let colorSet = [];
    let iconSet = [];
    if (this.crrVll.listType == '1') {
      vl = this.lstDatasVlls.map((x) => {
        return x.textValue;
      });
      iconSet = this.lstDatasVlls.map((x) => {
        return x.icon ?? '';
      });
      textColorSet = this.lstDatasVlls.map((x) => {
        return x.color ?? '';
      });
      colorSet = this.lstDatasVlls.map((x) => {
        return x.backgroundColor ?? '';
      });
    } else {
      this.lstDatasVlls.forEach((x) => {
        vl.push(x.value);
        vl.push(x.textValue);
        iconSet.push(x.value);
        iconSet.push(x.icon ?? '');
        textColorSet.push(x.value);
        textColorSet.push(x.color ?? '');
        colorSet.push(x.value);
        colorSet.push(x.backgroundColor ?? '');
      });
    }
    this.crrVll.defaultValues = this.crrVll.customValues = vl.join(';');
    this.crrVll.textColorSet = textColorSet.join(';');
    this.crrVll.iconSet = iconSet.join(';');
    this.crrVll.colorSet = colorSet.join(';');
    this.crrVll.multiSelect = this.dataCurrent.multiselect ?? false;
    let menthol =
      action == 'edit'
        ? 'EditValuelistCustomsAsync'
        : 'AddValuelistCustomsAsync';

    let res = await firstValueFrom(
      this.api.execSv('SYS', 'SYS', 'ValueListBusiness', menthol, this.crrVll)
    );
    if (res) {
      this.isRender = true;
      this.dataCurrent.refValue = this.crrVll.listName;
    } else {
      if (action == 'add') {
        this.dataCurrent.refValue = null;
      }
      this.isRender = false;
      return;
    }
  }

  async deleteVll(showNoti = true) {
    let res = await firstValueFrom(
      this.api.execSv(
        'SYS',
        'SYS',
        'ValueListBusiness',
        'DeletedValuelistCustomsAsync',
        this.crrVll.listName
      )
    );
    if (res) {
      this.crrVll.defaultValues = null;
      this.crrVll.textColorSet = null;
      this.crrVll.iconSet = null;
      this.crrVll.colorSet = null;
      this.dataCurrent.refValue = null;
      showNoti && this.notiSv.notifyCode('SYS008');
    } else {
      showNoti && this.notiSv.notifyCode('SYS022');
      return;
    }
  }

  closePopover() {
    if (this.isChangeColor) {
      if (this.dataCurrent.refValue) {
        this.saveVll('edit');
      } else {
        this.saveVll('add');
      }
      this.isChangeColor = false;
    }
  }

  onAddTextValue(e) {
    if (!e.value || e.value.trim() == '') return;

    let dataValue = {
      textValue: e.value,
      value: this.lstDatasVlls.length,
    };
    this.indexCurrentvll = this.lstDatasVlls.length;
    this.lstDatasVlls.push(dataValue);
    if (this.dataCurrent.refValue) {
      this.saveVll('edit');
    } else {
      this.saveVll('add');
    }
    e.value = '';
    e.focus();
    this.detectorRef.markForCheck();
  }

  onEditTextValue(e, i) {
    if (!e.value || e.value.trim() == '') return;
    this.lstDatasVlls[i]['textValue'] = e.value;
    this.lstDatasVlls[i]['value'] = i;
    if (this.dataCurrent.refValue) {
      this.saveVll('edit');
    } else {
      this.saveVll('add');
    }
    let eleAdd = document.getElementById('textAddValue');
    if (eleAdd) {
      eleAdd.focus();
      eleAdd.inputMode = '';
    }
    this.indexCurrentvll = -1;

    // if (!this.viewComboxForm) this.viewComboxForm.refresh();
    this.detectorRef.markForCheck();
  }

  removeVll(i) {
    if (this.lstDatasVlls?.length > 0) {
      this.lstDatasVlls.splice(i, 1);
      if (this.lstDatasVlls.length == 0) {
        this.deleteVll();
      } else {
        this.saveVll('edit');
      }
    }
    this.detectorRef.markForCheck();
  }

  handelTextValue(i) {
    this.indexCurrentvll = i;
    this.detectorRef.markForCheck();
  }
  //#endregion
}
