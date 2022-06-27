import { FormGroup, FormControl } from '@angular/forms';
import { Storages } from './../../../model/Storages.model';
import { ActivatedRoute } from '@angular/router';
import { ImageViewerComponent, AuthStore, CodxService, ApiHttpService } from 'codx-core';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-add-storage',
  templateUrl: './add-storage.component.html',
  styleUrls: ['./add-storage.component.scss']
})
export class AddStorageComponent implements OnInit {

  title: any;
  memo: any;
  objectID: any;
  lstStorage: any = [];
  details: any = [];
  formAddStorage: FormGroup;
  
  @Input() dataAdd = new Storages();
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Output() loadData = new EventEmitter();
  
  constructor(private authStore: AuthStore,
    private changedt: ChangeDetectorRef,
    private route: ActivatedRoute,
    private codxService: CodxService,
    private api: ApiHttpService,) { }

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

    this.details = [{recID: null, refID: '62908918ad16643a2ff34a43', memo: null, createdOn: '2022-05-25T07:30:44.086+00:00', createdBy: 'ADMIN'},
    {recID: null, refID: '62948c587969fe9d8b01d45b', memo: null, createdOn: '2022-05-25T07:30:44.086+00:00', createdBy: 'ADMIN'},
    {recID: null, refID: '62948c627969fe9d8b01d464', memo: null, createdOn: '2022-05-25T07:30:44.086+00:00', createdBy: 'ADMIN'},];
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
              this.lstStorage.addHandler(dt, true, 'recID');
              this.changedt.detectChanges();
            }
          });
      }
    })
  }
}
