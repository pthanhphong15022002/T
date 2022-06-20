import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiHttpService, CacheService, NotificationsService } from 'codx-core';
import { CodxEpService, ModelPage } from '../../../codx-ep.service';

@Component({
  selector: 'driver-resource-editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.scss'],
})
export class DialogDriverResourceComponent implements OnInit {
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data = {};
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @ViewChild('popupDevice', { static: true }) popupDevice;

  devices: any;
  modelPage: ModelPage;
  cacheGridViewSetup: any;

  dialogDriver: FormGroup;
  constructor(
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private notificationsService: NotificationsService,
    private cr: ChangeDetectorRef,
    private bookingService: CodxEpService
  ) {}


  isAfterRender = false;
  vllDevices = [];
  ngOnInit(): void {
    this.initForm();

    this.cacheSv.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
    });

    this.bookingService.getComboboxName('Rooms', 'grvRooms').then((res) => {
      console.log(res);
      this.cacheGridViewSetup = res;
    });
  }
  public setdata(data: any) {
    this.isAdd = false;
    if (data?.id == 'add') {
      this.isAdd = true;
      this.initForm();
    } else {
      this.dialogDriver.patchValue(data);
    }
  }
  initForm() {
    this.cacheSv
      .gridViewSetup('Resources', 'EP_Resources')
      .subscribe((item) => {
        this.editResources = item;
      });

    this.bookingService
      .getFormGroup('Resources', 'grvResources')
      .then((item) => {
        this.dialogDriver = item;
        this.isAfterRender = true;
      });
    // this.editform.patchValue({ ranking: '1', category: '1', companyID: '1' });
  }

  addNew() {}
  edit() {}
  save() {
    if (this.dialogDriver.invalid == true) {
      console.log(this.dialogDriver);
      return;
    }

    this.dialogDriver.value.linkType = '0';
    if (this.dialogDriver.value.linkID == null)
      this.dialogDriver.value.linkID = 0;
    this.dialogDriver.value.resourceType = '3';
    console.log(this.dialogDriver);
    this.api
      .callSv(
        'EP',
        'ERM.Business.EP',
        'ResourcesBusiness',
        'AddEditItemAsync',
        [this.dialogDriver.value, this.isAdd]
      )
      .subscribe((res) => {
        this.notificationsService.notify('Successfully!');
        this.onDone.emit(res);
        this.closeFormEdit();
      });
  }

  valueChange(event: any) {
    console.log('valueChange', event);
    if (event?.field != null) {
      this.dialogDriver.patchValue({ [event['field']]: event.data });
    }
  }

  ngOnChange(): void {}

  closeFormEdit() {
    this.initForm();
    this.closeEdit.emit();
  }
}
