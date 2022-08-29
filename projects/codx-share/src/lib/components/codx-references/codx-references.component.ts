import { Component, Input, OnInit, Optional } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';

@Component({
  selector: 'codx-references',
  templateUrl: './codx-references.component.html',
  styleUrls: ['./codx-references.component.css'],
})
export class CodxReferencesComponent implements OnInit {
  @Input() formModel?: FormModel;
  @Input() data : any;
  @Input() vllStatus = 'TMT004';
  @Input() vllRefType = 'TM018';
  dataVll: any;

  constructor(private cache: CacheService) {
    this.cache.valueList(this.vllRefType).subscribe((res) => {
      if (res) this.dataVll = res;
    });
  }

  ngOnInit(): void {}
  ngAfterViewInit(): void {}
}
