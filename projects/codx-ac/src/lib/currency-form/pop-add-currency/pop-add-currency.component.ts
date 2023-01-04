import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Optional, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiHttpService, AuthStore, CacheService, DialogData, DialogRef, FormModel, ImageViewerComponent, LayoutAddComponent, NotificationsService, UIComponent } from 'codx-core';
import { CodxAdService } from 'projects/codx-ad/src/public-api';

@Component({
  selector: 'lib-pop-add-currency',
  templateUrl: './pop-add-currency.component.html',
  styleUrls: ['./pop-add-currency.component.css']
})
export class PopAddCurrencyComponent {
  @ViewChild('form') form: LayoutAddComponent;
  @ViewChild('imageUpload') imageUpload?: ImageViewerComponent;
  @Output() loadData = new EventEmitter();
  @ViewChild('firstComment') firstComment: TemplateRef<any>;
  title = '';
  dialog!: DialogRef;
  dialogRole: DialogRef;
  data: any;
  constructor(
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) { 
    this.dialog = dialog;
    this.title = dt.data?.headerText;
    }
  ngOnInit(): void {
   
  }

  ngAfterViewInit() {

  }
}