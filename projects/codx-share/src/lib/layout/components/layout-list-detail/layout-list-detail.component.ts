import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  CacheService,
  CodxFormComponent,
  DialogRef,
  FormModel,
} from 'codx-core';

@Component({
  selector: 'layout-list-detail',
  templateUrl: './layout-list-detail.component.html',
  styleUrls: ['./layout-list-detail.component.css'],
})
export class LayoutListDetailComponent implements OnInit {
  @Input() formModel?: FormModel;
  @Input() title: string = '';
  @Input() data: any = {};
  @Input() showFooter: boolean = true;
  @Input() openMore: boolean = false;
  @Input() dialog?: DialogRef;
  @Input() subHeaderText?: string;
  @Input() leftTemlate?: TemplateRef<any>;
  @Input() RightTemlate?: TemplateRef<any>;
  @Input() subHeader?: TemplateRef<any>;
  @Input() subTab?: TemplateRef<any>;
  @Input() body?: TemplateRef<any>;
  @Input() footer?: TemplateRef<any>;
  @Input() isSider: boolean = true;
  @Input() destroyOnHide: boolean = false;
  @ViewChild('form') form!: CodxFormComponent;
  @Output() buttonClick = new EventEmitter();
  @Output() setTitle = new EventEmitter();
  @Output() dataChange = new EventEmitter<any>();
  width = '750px';
  funcID: any = '';
  showUpload = this;
  formGroup?: FormGroup;
  constructor(
    private cache: CacheService,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.funcID = this.formModel?.funcID;
    if (!this.funcID) this.funcID = this.route.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.title = res.customName;
        //this.changeDetectorRef.detectChanges();
        this.setTitle.emit(this.title);
      }
    });
  }

  ngAfterViewInit() {
    this.formModel = this.form.formModel;
    this.formGroup = this.form.formGroup;
  }
}
