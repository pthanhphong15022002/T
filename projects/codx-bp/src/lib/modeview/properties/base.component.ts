import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({ template: '' })
export abstract class BasePropertyComponent
{
    @Input() data: any;
    @Output() dataChange = new EventEmitter<any>();

    changeValue(e:any)
    {
      this.data[e?.field] = e?.data;
      this.dataChange.emit(this.data);
    }
}