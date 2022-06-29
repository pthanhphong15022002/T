import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'codx-export',
  templateUrl: './codx-export.component.html',
  styleUrls: ['./codx-export.component.scss'],
})
export class CodxExportComponent implements OnInit, OnChanges
{
  @Input() headerText?: string;
  @Input() subHeaderText?: string;

  @Input() subHeader?: TemplateRef<any>;
  @Input() body?: TemplateRef<any>;
  @Input() footer?: TemplateRef<any>;

  @Input() data?: any = {};

  @Input() openMore: boolean = false;
  @Input() dialog: any;
  formGroup?: FormGroup;
  lblExtend: string = '';
  @Output() setDefaultValue = new EventEmitter();
  constructor() {
  }
  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges) {}
 
}
