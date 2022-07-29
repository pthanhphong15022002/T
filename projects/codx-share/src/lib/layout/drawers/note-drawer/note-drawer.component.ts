import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CallFuncService, ApiHttpService, CodxListviewComponent, UIComponent, DialogModel, CRUDService, DialogRef, DialogData, CacheService, DataService } from 'codx-core';
import { AddNoteComponent } from '@pages/home/add-note/add-note.component';

import { Component, OnInit, ViewChild, ChangeDetectorRef, Input, Injector, Optional } from '@angular/core';
import { Notes } from '@shared/models/notes.model';
import { AddUpdateNoteBookComponent } from 'projects/codx-mwp/src/lib/personals/note-books/add-update-note-book/add-update-note-book.component';
import { UpdateNotePinComponent } from '@pages/home/update-note-pin/update-note-pin.component';
import { SaveNoteComponent } from '@pages/home/add-note/save-note/save-note.component';
import { MoreFunctionNote } from '@shared/models/moreFunctionNote.model';
import { NoteServices } from 'projects/codx-wp/src/lib/services/note.services';

@Component({
  selector: 'app-note-drawer',
  templateUrl: './note-drawer.component.html',
  styleUrls: ['./note-drawer.component.scss'],
})
export class NoteDrawerComponent extends UIComponent implements OnInit {

  @Input() dataAdd = new Notes();

  data: any;
  message: any;
  listNote: any[] = [];
  type: any;
  itemUpdate: any;
  recID: any;
  countNotePin = 0;
  maxPinNotes: any;
  checkUpdateNotePin = false;
  typeList = "note-drawer";
  header = 'Ghi chú';
  dialog: DialogRef;
  predicate = '';
  dataValue = '';
  editMF: any;
  deleteMF: any;
  pinMF: any;
  saveMF: any; 
  dtService: CRUDService;
  dataUpdate: any;

  @ViewChild('listview') lstView: CodxListviewComponent;

  constructor(private injector: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private noteService: NoteServices,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData,
  ) {
    super(injector);
    this.dialog = dialog;
    this.cache.moreFunction('PersonalNotes', 'grvPersonalNotes').subscribe((res) => {
      if (res) {
        this.editMF = res[2];
        this.deleteMF = res[3];
        this.pinMF = res[0];
        this.saveMF = res[1];
      }
    })
    var dataSv = new CRUDService(injector);
    dataSv.request.pageSize = 10;
    this.dtService = dataSv;
  }

  onInit(): void {
    this.noteService.data.subscribe((res) => {
      if (res) {
        var data = res[0]?.data;
        var type = res[0]?.type;
        if (this.lstView) {
          if (type == 'add-currentDate' || type == 'add-otherDate') {
            (this.lstView.dataService as CRUDService).add(data).subscribe();
          } else if (type == 'delete') {
            (this.lstView.dataService as CRUDService).remove(data).subscribe();
            var today: any = document.querySelector(
              ".e-footer-container button[aria-label='Today']"
            );
            if (today) {
              today.click();
            }
          } else {
            (this.lstView.dataService as CRUDService).update(data).subscribe((res)=>{
          
              var dt = this.lstView?.dataService.data;
              dt.sort(function(a, b) {
                return Number(b.isPin) - Number(a.isPin);
            });
              dt = [...dt, ...[]];
            });
          }
          this.changeDetectorRef.detectChanges();
        }
      }
    })
    this.getMaxPinNote();
  }

  ngAfterViewInit() {
    this.lstView.dataService.requestEnd = (t, data) => {
      if (t == 'loaded') {
        this.data = data;
        if (this.data?.length != 0) {
          this.data.forEach((res) => {
            if (res?.isPin == true || res?.isPin == '1') {
              this.countNotePin += 1;
            }
          })
        }
        (this.lstView.dataService as CRUDService).page = 5;
      }
    }
  }

  getMaxPinNote() {
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'GetParamAsync')
      .subscribe((res) => {
        this.maxPinNotes = res[0].msgBodyData[0].fieldValue;
      });
  }

  valueChange(e, recID = null, item = null) {
    if (e) {
      var field = e.field;
      if (field == 'textarea') this.message = e.data.checked.checked;
      else if (item) {
        this.message = '';
        item[field] = e.data.checked;
      }
    }
  }

  onCountNotePin() {
    // let i = 0;
    // let ip = 0;
    // let np = 0;
    // for (i; i < dt.length; i++) {
    //   if (dt[i].isPin == true) {
    //     ip++;
    //   } else if (dt[i].isPin == false) {
    //     np++;
    //   }
    // }
    // this.countIsPin = ip;
    // this.countNotPin = np;
  }

  openFormUpdateNote(data) {
    var obj = {
      data: this.lstView.dataService.data,
      dataUpdate: data,
      formType: 'edit',
      maxPinNotes: this.maxPinNotes,
      component: 'note-drawer',
    };
    this.callfc.openForm(
      AddNoteComponent,
      'Cập nhật ghi chú',
      600,
      450,
      '',
      obj
    )

    this.itemUpdate = data;
    this.listNote = this.itemUpdate.checkList;
    this.type = data.noteType;
    this.recID = data?.recID;
  }

  checkNumberNotePin(data) {
    if (data?.isPin == '1' || data?.isPin == true) {
      this.countNotePin -= 1;
      this.checkUpdateNotePin = false;
    } else if (data?.isPin == '0' || data?.isPin == false) {
      if (this.countNotePin + 1 <= this.maxPinNotes) {
        this.countNotePin += 1;
        this.checkUpdateNotePin = false;
      } else {
        this.checkUpdateNotePin = true;
      }
    }
    this.openFormUpdateIsPin(data, this.checkUpdateNotePin);
  }

  openFormUpdateIsPin(data, checkUpdateNotePin) {
    if (checkUpdateNotePin == true) {
      var obj = {
        data: this.lstView.dataService.data,
        itemUpdate: data,
      }
      this.callfc.openForm(UpdateNotePinComponent, "Cập nhật ghi chú đã ghim", 500, 600, "", obj);
    } else {
      this.onEditIsPin(data);
    }
  }

  openFormAddNote() {
    var obj = {
      data: this.lstView.dataService.data,
      typeLst: this.typeList,
      formType: 'add',
      component: 'note-drawer',
    };
    let option = new DialogModel();
    option.DataService = this.lstView.dataService as CRUDService;
    option.FormModel = this.lstView.formModel;
    this.callfc
      .openForm(AddNoteComponent, 'Thêm mới ghi chú', 600, 450, '', obj, '', option);
  }

  onEditIsPin(data: Notes) {
    var isPin = !data.isPin;
    data.isPin = isPin;
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        data?.recID,
        data
      ])
      .subscribe((res) => {
        this.dataValue = '';
       // this.lstView?.dataService.setPredicate(this.predicate, [this.dataValue]).subscribe();
        var object = [{ data: data, type: 'edit' }]
        this.noteService.data.next(object);
        this.changeDetectorRef.detectChanges();
      });
  }

  onDeleteNote(item) {
    this.api
      .exec<any>(
        'ERM.Business.WP',
        'NotesBusiness',
        'DeleteNoteAsync',
        item?.recID
      )
      .subscribe((res) => {
        if (res) {
          var object = [{ data: res, type: 'delete' }]
          this.noteService.data.next(object);
        }
      });
  }

  openFormNoteBooks(item) {
    var obj = {
      itemUpdate: item,
    };
    this.callfc.openForm(SaveNoteComponent, 'Cập nhật ghi chú', 900, 650, '', obj);
  }

  getMoreF(item) {
    this.dataUpdate = item;
  }
}
