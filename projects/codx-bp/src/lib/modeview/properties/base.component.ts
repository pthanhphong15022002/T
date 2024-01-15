import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { CodxShareService } from "projects/codx-share/src/public-api";

@Component({ template: '' })
export abstract class BasePropertyComponent
{
    @Input() isBack = false;
    @Input() data: any;
    @Output() dataChange = new EventEmitter<any>();
    @Output() back = new EventEmitter<any>();
    constructor(
      public shareService: CodxShareService,
      public ref: ChangeDetectorRef
    )
    {

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