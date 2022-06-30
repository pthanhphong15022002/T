import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'codx-export-add',
  templateUrl: './codx-export-add.component.html',
  styleUrls: ['./codx-export-add.component.scss'],
})
export class CodxExportAddComponent implements OnInit, OnChanges
{
  data: any;
  @Input() openMore: boolean = false;
  dialog: any;
  formGroup?: FormGroup;
  lblExtend: string = '';
  headerText: any;
  @Output() setDefaultValue = new EventEmitter();
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
    this.data = dt.data;
  }
  ngOnInit(): void {
    this.headerText = this.data?.headerText;
  }
  ngOnChanges(changes: SimpleChanges) {}
 
}
