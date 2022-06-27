import { Storages } from './../../../model/Storages.model';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, CodxService, ApiHttpService, ImageViewerComponent } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, Input, ViewChild, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-update-storage',
  templateUrl: './update-storage.component.html',
  styleUrls: ['./update-storage.component.scss']
})
export class UpdateStorageComponent implements OnInit {

  title: any;
  memo: any;
  objectID: any;
  lstStorage: any = [];
  data: any;
  details: any = [];
  formUpdateStorage: FormGroup;

  @Input() dataUpdate = new Storages();
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Output() loadData = new EventEmitter();

  constructor(private authStore: AuthStore,
    private changedt: ChangeDetectorRef,
    private route: ActivatedRoute,
    private codxService: CodxService,
    private api: ApiHttpService,) { }

  ngOnInit(): void {
  }

  clearForm() {
    this.formUpdateStorage.controls['title'].setValue(null);
    this.formUpdateStorage.controls['memo'].setValue(null);

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

  updateStorage(data) {
    if (this.title != null) {
      this.dataUpdate.title = this.title;
      this.dataUpdate.memo = data?.memo;
    } else if (this.memo != null) {
      this.dataUpdate.title = data?.title;
      this.dataUpdate.memo = this.memo;
    } else {
      this.dataUpdate.title = data?.title;
      this.dataUpdate.memo = data?.memo;
    }

    this.api.exec<any>(
      'ERM.Business.WP',
      'StoragesBusiness',
      'UpdateStorageAsync',
      [data?.recID, this.dataUpdate]
    ).subscribe((res) => {
      var dt = res;
      if (dt) {
        this.imageUpload
          .updateFileDirectReload(data?.recID)
          .subscribe((result) => {
            if (result) {
              this.loadData.emit();
              this.changedt.detectChanges();
            }
          });
        this.lstStorage.addHandler(dt, false, 'recID');
        this.changedt.detectChanges();
      }
    })
  }
}
