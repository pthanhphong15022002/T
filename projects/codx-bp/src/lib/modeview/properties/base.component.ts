import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CodxShareService } from "projects/codx-share/src/public-api";

@Component({ template: '' })
export abstract class BasePropertyComponent 
{
    @Input() data: any;
    @Output() dataChange = new EventEmitter<any>();

    constructor(
      public shareService: CodxShareService
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
}