import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DialogModel } from "codx-core";
import { CodxShareService } from "projects/codx-share/src/public-api";
import { CodxBpService } from "../../codx-bp.service";
import { PopupAddAutoNumberComponent } from "projects/codx-es/src/lib/setting/category/popup-add-auto-number/popup-add-auto-number.component";

@Component({ template: '' })
export abstract class BasePropertyComponent
{
    user:any;
    @Input() isBack = false;
    @Input() data: any;
    @Input() dataTable: any;
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
      public cache: CacheService
    )
    {
      this.user = this.authstore.get();
    }

    changeValue(e:any)
    {
      this.data[e?.field] = e?.data;
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

    valueChangeData(e:any)
    {
      this.dataChange.emit(e);
    }
    
    valueChangeTableEmit(e:any)
    {
      this.dataChangeTableEmit.emit(e);
    }
}