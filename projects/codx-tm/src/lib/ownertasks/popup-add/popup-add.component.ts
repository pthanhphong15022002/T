import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'app-test-add',
  templateUrl: './popup-add.component.html',
  styleUrls: ['./popup-add.component.scss'],
})
export class PopupAddComponent implements OnInit {
  data: any = {};
  dialog: any;
  constructor(
    private api: ApiHttpService,
    private change: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    //this.dialog.dataService.apiSave = (t, data) = this.api.execSv<any>('TM', 'TM', 'TaskBusiness', 'TestApiBool', this.data);
    this.dialog.dataService.apiUpdate = this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'TestApiBool',
      this.data
    );
  }

  valueChange(evt: any) {
    this.data[evt.field] = evt.data;
  }
  saveForm() {
    this.dialog.dataService.save().subscribe();
  }
  save2() {
    this.api
      .execSv<any>('TM', 'TM', 'TaskBusiness', 'TestApiSave')
      .subscribe((res) => {
        this.dialog.dataService.add(res, 0, true).subscribe();
        this.change.detectChanges();
      });
  }
}
