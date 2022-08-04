import { Component, Input, OnInit, Injector, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CodxListviewComponent, CRUDService, DialogModel, DialogRef, UIComponent } from 'codx-core';
import { PopupAddUpdate } from '../popup-add-update/popup-add-update.component';

@Component({
  selector: 'app-detail-list',
  templateUrl: './detail-list.component.html',
  styleUrls: ['./detail-list.component.scss'],
})
export class DetailListComponent
  extends UIComponent
  implements OnInit
{
  views = [];
  dtService: CRUDService;
  editMF: any;
  deleteMF: any;
  pinMF: any;
  saveMF: any;
  dialog!: DialogRef;

  @Input() formModel: any = [];
  @Input() dataValue = '';
  @Input() predicate = '';
  @Input() parentID = '';

  @ViewChild('listview') listview: CodxListviewComponent;

  constructor(private injector: Injector, private route: ActivatedRoute) {
    super(injector);
    var dataSv = new CRUDService(injector);
    dataSv.request.pageSize = 10;
    this.dtService = dataSv;
    this.cache
    .moreFunction('PersonalNotes', 'grvPersonalNotes')
    .subscribe((res) => {
      if (res) {
        this.editMF = res[2];
        this.deleteMF = res[3];
        this.pinMF = res[0];
        this.saveMF = res[1];
      }
    });
  }

  onInit() {
  }

  ngAfterViewInit() {
  }

  edit(data) {
    var obj = [{
      data: data,
      type: 'edit',
      parentID: this.parentID,
    }]

    if (data) {
      this.listview.dataService.dataSelected = data;
    }

    (this.listview.dataService as CRUDService).edit(this.listview.dataService.dataSelected).subscribe((res: any) => {
      let option = new DialogModel();
      option.DataService = this.listview?.dataService;
      option.FormModel = this.listview?.formModel;
      this.dialog = this.callfc.openForm(PopupAddUpdate,
        'Thêm mới ghi chú', 1438, 775, '', obj, '', option
      );
    });
  }

  delete(data) {
    this.api
      .exec<any>(
        'ERM.Business.WP',
        'NotesBusiness',
        'DeleteNoteAsync',
        data.recID
      )
      .subscribe((res) => {
        if (res) {
          (this.listview.dataService as CRUDService).remove(res).subscribe();
          this.detectorRef.detectChanges();
        }
      });
  }
}
