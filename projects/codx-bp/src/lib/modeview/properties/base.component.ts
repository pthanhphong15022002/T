import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DialogModel } from "codx-core";
import { CodxShareService } from "projects/codx-share/src/public-api";
import { CodxBpService } from "../../codx-bp.service";
import { PopupAddAutoNumberComponent } from "projects/codx-es/src/lib/setting/category/popup-add-auto-number/popup-add-auto-number.component";
import { CodxDMService } from "projects/codx-dm/src/lib/codx-dm.service";
import { AddSettingConditionsComponent } from "../../processes/popup-add-process/form-steps-field-grid/add-default/add-task/add-setting-conditions/add-setting-conditions.component";

@Component({ template: '' })
export abstract class BasePropertyComponent
{
    user:any;
    @Input() isBack = false;
    @Input() data: any;
    @Input() dataTable: any;
    @Input() formModel: any;
    @Output() dataChange = new EventEmitter<any>();
    @Output() dataChangeTableEmit = new EventEmitter<any>();
    @Output() back = new EventEmitter<any>();
    constructor(
      public authstore: AuthStore,
      public api: ApiHttpService,
      public shareService: CodxShareService,
      public ref: ChangeDetectorRef,
      public bpService: CodxBpService,
      public callFuc: CallFuncService,
      public cache: CacheService,
      public dmSV: CodxDMService,
    )
    {
      this.user = this.authstore.get();
    }

    changeValue(e:any)
    {
      this.data[e?.field] = e?.data;
      this.dataChange.emit(this.data);
    }

    changeValueValidateControl(e:any)
    {
      if(!this.data.validateControl) this.data.validateControl = {};
      this.data.validateControl[e?.field] = e?.data;
      this.dataChange.emit(this.data);
    }

    deleteValue()
    {
      this.data.isDelete = true;
      this.dataChange.emit(this.data);
    }

    backDefault()
    {
      this.back.emit(this.data);
    }

    changeValueAutoNumber(e:any)
    {
      if(!this.data.autoNumber) this.data.autoNumber = {};
      this.data.autoNumber[e?.field] = e?.data;
      this.dataChange.emit(this.data);
    }
    
    changeValueVisibleControl(e:any)
    {
      if(!this.data.visibleControl) this.data.visibleControl = {};
      this.data.visibleControl[e?.field] = e?.data;
      this.dataChange.emit(this.data);
    }

    openAutoNumberForm()
    {
      this.cache
      .valueList('BP026')
      .subscribe((res) => {
        if (res && res.datas.length > 0) {
          let data = {
            autoNoCode: this.data?.autoNumber?.autoNumberNo,
            description: res.datas[0]?.text,
            disableAssignRule: true,
            autoAssignRule: "",
            referenceAutoNumer: 'BP026'
          };
          let option = new DialogModel();
          option.IsFull = true;
          let dialog = this.callFuc.openForm(
            PopupAddAutoNumberComponent,
            '',
            0,
            0,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res.event) {
              this.data.autoNumber.autoNumberNo = res.event?.autoNoCode;
              this.data.autoNumber.autoAssignRule = res.event?.autoAssignRule;
              this.dataChange.emit(this.data);
            }
          });
        }
      });
    }

    openVisibleControlForm()
    {
      let option = new DialogModel();
      option.FormModel = this.formModel;

      let data = [];
      this.dataTable.forEach(elm=>{
        if(elm.columnOrder < this.data.columnOrder) data = data.concat(elm.children)
        else if(elm.columnOrder == this.data.columnOrder)
        {
          elm.children.forEach(elm2=>{
            if(elm2.columnNo < this.data.columnNo)
            {
              data.push(elm2);
            }
          })
        }
      })

      let popupDialog = this.callFuc.openForm(
        AddSettingConditionsComponent,
        '',
        700,
        700,
        '',
        { extendInfo: data , dataStep: this.data.visibleControl},
        '',
        option
      );
      popupDialog.closed.subscribe((res) => {
        if (res?.event) {
          this.data.visibleControl.paraValues = res?.event?.paraValues
          this.dataChange.emit(this.data);
          // if (typeof index === 'number')
          //   this.data.settings.nextSteps[index] = res?.event;
          // else this.data.settings.nextSteps.push(res?.event);
          // this.dataChange.emit(this.data);
        }
      });  
    }

    valueChangeData(e:any)
    {
      this.dataChange.emit(e);
    }
    
    valueChangeTableEmit(e:any)
    {
      this.dataChangeTableEmit.emit(e);
    }
}