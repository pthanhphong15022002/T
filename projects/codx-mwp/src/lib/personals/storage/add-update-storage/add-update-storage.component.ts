import { FormGroup, FormControl } from '@angular/forms';
import { Storages } from './../../../model/Storages.model';
import { ActivatedRoute } from '@angular/router';
import { ImageViewerComponent, AuthStore, CodxService, ApiHttpService, DialogRef, DialogData, NotificationsService } from 'codx-core';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ChangeDetectorRef, Optional } from '@angular/core';

@Component({
  selector: 'app-add-update-storage',
  templateUrl: './add-update-storage.component.html',
  styleUrls: ['./add-update-storage.component.scss']
})
export class AddUpdateStorageComponent implements OnInit {

  title: any;
  memo: any;
  objectID: any;
  lstStorage: any = [];
  details: any = [];
  formAddStorage: FormGroup;
  dialog: any;
  readOnly = false;
  formType = '';

  @Input() dataAdd = new Storages();
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Output() loadData = new EventEmitter();

  constructor(private authStore: AuthStore,
    private changedt: ChangeDetectorRef,
    private route: ActivatedRoute,
    private codxService: CodxService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef) {
    this.dialog = dialog;
    console.log("check form add dialog", this.dialog)
    console.log("check form add dt ", dt)
    this.formType = dt?.data[1];
    this.lstStorage = dt?.data[0];

  }

  ngOnInit(): void {
    this.initFormGroup();
  }

  initFormGroup() {
    this.formAddStorage = new FormGroup({
      title: new FormControl(''),
      memo: new FormControl(''),
    });
    this.changedt.detectChanges();
  }

  clearForm() {
    this.formAddStorage.controls['title'].setValue(null);
    this.formAddStorage.controls['memo'].setValue(null);

    this.changedt.detectChanges();
  }

  valueChange(e) {
    if (e) {
      var field = e.field;
      if (field == "title") {
        this.title = e.data;
      } else if (field == "memo") {
        this.memo = e.data.value;
      }
    }
  }

  addStorage() {
    this.dataAdd.storageType = "WP_Comments";
    this.dataAdd.title = this.title;
    this.dataAdd.memo = this.memo;

    this.details = [{ recID: null, refID: '62908918ad16643a2ff34a43', memo: null, createdOn: '2022-05-25T07:30:44.086+00:00', createdBy: 'ADMIN' },
    { recID: null, refID: '62948c587969fe9d8b01d45b', memo: null, createdOn: '2022-05-25T07:30:44.086+00:00', createdBy: 'ADMIN' },
    { recID: null, refID: '62948c627969fe9d8b01d464', memo: null, createdOn: '2022-05-25T07:30:44.086+00:00', createdBy: 'ADMIN' },];
    this.dataAdd.details = this.details;


    this.api.exec<any>(
      'ERM.Business.WP',
      'StoragesBusiness',
      'CreateStorageAsync',
      this.dataAdd
    ).subscribe((res) => {
      if (res) {
        var dt = res;
        this.objectID = dt.recID;
        this.imageUpload
          .updateFileDirectReload(this.objectID)
          .subscribe((result) => {
            if (result) {
              this.loadData.emit();
              this.lstStorage = dt.concat(this.dialog.dataService.data);
              // this.dialog.dataService.setDataSelected(dt);
              // this.dialog.dataService.afterSave.next(dt);
              this.changedt.detectChanges();
              this.notiService.notifyCode('E0680');
            }
          });
      }
    })
  }
}
