import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiHttpService, CallFuncService, DataRequest, DialogData, DialogRef } from 'codx-core';
import { CodxExportAddComponent } from './codx-export-add/codx-export-add.component';

@Component({
  selector: 'codx-export',
  templateUrl: './codx-export.component.html',
  styleUrls: ['./codx-export.component.scss'],
})
export class CodxExportComponent implements OnInit, OnChanges
{
  dataEx: any;
  @Input() openMore: boolean = false;
  dialog: any;
  formGroup?: FormGroup;
  lblExtend: string = '';
  @Output() setDefaultValue = new EventEmitter();
  constructor(
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
  }
  ngOnInit(): void {
    this.load();
  }
  ngOnChanges(changes: SimpleChanges) {}
  load()
  {
    var option = new DataRequest();
    option.page=0;
    option.pageSize=10;
    option.entityName = 'AD_ExcelTemplates';
    option.funcID = "ODT3";
    this.api.execSv<any>('SYS','AD', 'ExcelTemplatesBusiness', 'GetByEntityAsync', option).subscribe(item=>
    {
      if(item[0])
        this.dataEx = item[0]
      })
  }
  openForm()
  {
    this.callfunc.openForm(CodxExportAddComponent,null,null,800,null,{headerText: "Thêm Excel Template"})
    .closed.subscribe(item=>
    {
      if(item.event) this.load
    })
  }
}
