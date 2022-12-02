import { OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { AttachmentComponent } from '../attachment/attachment.component';

@Component({
  selector: 'codx-references',
  templateUrl: './codx-references.component.html',
  styleUrls: ['./codx-references.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxReferencesComponent implements OnInit, OnChanges {
  @Input() funcID?: string; // khởi tạo để test,, sau có thể xóa
  // @Input() entityName?: string// khởi tạo để test,, sau có thể xóa
  @Input() dataReferences: any[];
  @Input() vllRefType = 'TM018';
  @Input() formModel?: FormModel;
  @Input() zIndex : number = 0;
  @ViewChild('attachment') attachment: AttachmentComponent;
  message: string = '';
  REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  lstFile: any[] = [];
  //dataAvtar: any;

  constructor(private cache: CacheService, private dt: ChangeDetectorRef) {}
  ngOnChanges(changes: SimpleChanges): void {
    this.dt.detectChanges();
  }

  ngOnInit(): void {
    console.log('logggggg', this.dataReferences);
  }

  ngAfterViewInit(): void {}

  setStyles(color): any {
    let styles = {
      backgroundColor: color,
      color: 'white',
    };
    return styles;
  }
}
