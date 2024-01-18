import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { ApiHttpService, AuthStore, CallFuncService } from "codx-core";
import { CodxShareService } from "projects/codx-share/src/public-api";
import { CodxBpService } from "../../codx-bp.service";

@Component({ template: '' })
export abstract class BasePropertyComponent
{
    user:any;
    @Input() isBack = false;
    @Input() data: any;
    @Output() dataChange = new EventEmitter<any>();
    @Output() back = new EventEmitter<any>();
    constructor(
      private authstore: AuthStore,
      public api: ApiHttpService,
      public shareService: CodxShareService,
      public ref: ChangeDetectorRef,
      public bpService: CodxBpService,
      public callFuc: CallFuncService
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
      this.back.emit(true);
    }
}