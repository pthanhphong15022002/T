import { auto } from '@popperjs/core';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ComboBoxComponent,
  FilteringEventArgs,
} from '@syncfusion/ej2-angular-dropdowns';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';

@Component({
  selector: 'codx-combobox-select',
  templateUrl: './codx-combobox.component.html',
  styleUrls: ['./codx-combobox.component.scss'],
})
export class CodxComboboxComponent implements OnInit {
  @Input() dataSource = [];
  @Input() crrValue = '';
  @Input() height = '220px';
  @Input() width = '100%';
  @Input() placeholder = '';
  @Output() valueChange = new EventEmitter();
  
  fields = { text: 'name', value: 'key' };

  ngOnInit(): void {}

  onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    let query: Query = new Query();
    query =
      e.text !== '' ? query.where('Name', 'startswith', e.text, true) : query;
    e.updateData(this.dataSource, query);
  };

  onChange(event){
    console.log('---',event);
    this.valueChange.emit(event);
  }
}
