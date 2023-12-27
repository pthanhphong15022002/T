import { OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ApiHttpService, CacheService, FormModel } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxTasksService } from '../codx-tasks.service';

@Component({
  selector: 'codx-references',
  templateUrl: './codx-references.component.html',
  styleUrls: ['./codx-references.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxReferencesComponent implements OnInit, OnChanges {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @Input() funcID?: string; // khởi tạo để test,, sau có thể xóa
  @Input() dataReferences: any[];
  @Input() isLoadedDataRef = true; //bằng true : đã có data REf gửi vào , False nếu tự load
  @Input() vllRefType = 'TM018';
  @Input() formModel?: FormModel;
  @Input() zIndex: number = 0;
  @Input() openViewPopup = true; // truyền ko cho click

  //refType và RefID của object để temp tự load Data  với isLoadedDataRef = false
  @Input() objectID = '';
  @Input() refType = '';
  @Input() refID = '';
  message: string = '';
  REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  lstFile: any[] = [];
  loaded: boolean;
  dataCrrChange: any;
  crrObjectID: any;

  constructor(
    private cache: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private codxTaskService: CodxTasksService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    this.loaded = false;
    if (this.isLoadedDataRef) {
      if (changes['dataReferences']) {
        this.loaded = true;
        this.changeDetectorRef.detectChanges();
      }
    } else {
      if (this.crrObjectID != this.objectID) {
        this.crrObjectID = this.objectID;
        this.loadDataRef();
      }
    }
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

  //Load data Ref
  loadDataRef() {
    this.codxTaskService.getReference(
      this.refType,
      this.refID,
      this.getRef.bind(this)
    );
  }

  getRef(dataRef) {
    this.dataReferences = dataRef;
    this.loaded = true;
    this.changeDetectorRef.detectChanges();
  }
}
