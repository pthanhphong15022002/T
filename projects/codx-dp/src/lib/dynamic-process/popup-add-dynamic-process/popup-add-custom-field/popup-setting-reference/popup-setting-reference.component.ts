import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';

@Component({
  selector: 'lib-popup-setting-reference',
  templateUrl: './popup-setting-reference.component.html',
  styleUrls: ['./popup-setting-reference.component.css'],
})
export class PopupSettingReferenceComponent implements OnInit, AfterViewInit {
  @ViewChild('form') form: CodxFormComponent;

  dialog: DialogRef;
  grvSetup: any;
  user: any;
  titleAction = '';
  data: any;

  constructor(
    private changdef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.grvSetup = dt?.data?.grvSetup;
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {}
}
