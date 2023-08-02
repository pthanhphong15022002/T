import {
  CodxListviewComponent,
  UIComponent,
  DialogModel,
  CRUDService,
  DialogRef,
  DialogData,
  AuthStore,
} from 'codx-core';

import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  Input,
  Injector,
  Optional,
} from '@angular/core';
import { Notes } from '@shared/models/notes.model';
import { NoteService } from 'projects/codx-share/src/lib/components/calendar-notes/note.service';
import { AddNoteComponent } from 'projects/codx-share/src/lib/components/calendar-notes/add-note/add-note.component';
import { SaveNoteComponent } from 'projects/codx-share/src/lib/components/calendar-notes/add-note/save-note/save-note.component';
import { UpdateNotePinComponent } from 'projects/codx-share/src/lib/components/calendar-notes/update-note-pin/update-note-pin.component';
@Component({
  selector: 'app-note-slider',
  templateUrl: './note-slider.component.html',
  styleUrls: ['./note-slider.component.scss'],
})
export class NoteSliderComponent extends UIComponent implements OnInit {
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
  typeList = 'note-drawer';
  header = 'Ghi chú';
  dialog: DialogRef;
  predicate = 'CreatedBy=@0';
  dataValue = '';
  editMF: any;
  deleteMF: any;
  pinMF: any;
  saveMF: any;
  dtService: CRUDService;
  dataUpdate: any;
  user: any;
  daySelected: any;
  checkSortASC = false;
  functionList: any;

  @ViewChild('listview') lstView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private noteService: NoteService,
    private authStore: AuthStore,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    super(injector);
    this.user = this.authStore.get();
    this.dialog = dialog;
    //chưa biết Nguyên viết gì ??
    var dataSv = new CRUDService(injector);
    dataSv.request.pageSize = 10;
    dataSv.idField = 'recID';
    this.dtService = dataSv;
  }

  onInit(): void {
    if(this.user)
    {
      this.dataValue = this.user.userID;
    }
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
    this.cache.functionList('WPT08').subscribe((res) => {
      if (res) this.functionList = res;
    });
    
    this.loadData();
    this.getMaxPinNote();
  }

  ngAfterViewInit() {
    let myInterval = setInterval(() => {
      if (this.lstView) {
        this.lstView.dataService.requestEnd = (t, data) => {
          if (t == 'loaded') {
            this.data = data;
            if (this.data && this.data.length > 0) {
              clearInterval(myInterval);
            }
            if (this.data?.length != 0) {
              this.data.forEach((res) => {
                if (res?.isPin == true || res?.isPin == '1') {
                  this.countNotePin += 1;
                }
              });
            }
            (this.lstView.dataService as CRUDService).page = 5;
          }
        };
      }
    }, 200);
    setTimeout(() => {
      clearInterval(myInterval);
    }, 10000);
  }

  loadData() {
    this.noteService.data.subscribe((res) => {
      if (res) {
        var data = res[0]?.data;
        var type = res[0]?.type;
        if (this.lstView) {
          if (
            type == 'add-currentDate' ||
            type == 'add-otherDate' ||
            type == 'add-note-drawer'
          ) {
            (this.lstView.dataService as CRUDService)
              .add(data)
              .subscribe((res) => {
                this.sortDataByDESC('drawer');
              });
          } else if (type == 'delete') {
            (this.lstView.dataService as CRUDService).remove(data).subscribe();
            var today: any = document.querySelector(
              ".e-footer-container button[aria-label='Today']"
            );
            if (today) {
              today.click();
            }
          } else {
            (this.lstView.dataService as CRUDService)
              .update(data)
              .subscribe((res) => {
                this.sortDataByDESC('drawer');
              });
            this.countNotePin = 0;
            this.lstView.dataService.data.forEach((res) => {
              if (res.isPin == true || res.isPin == '1') {
                this.countNotePin++;
              }
            });
          }
          this.changeDetectorRef.detectChanges();
        }
      }
    });
  }

  sortDataByDESC(type = null) {
    if (this.lstView)
      this.lstView.dataService.data = this.lstView.dataService.data.sort(
        function (a, b) {
          var dateA = new Date(
            type == null ? a.createdOn : a.modifiedOn
          ).getTime();
          var dateB = new Date(
            type == null ? b.createdOn : b.modifiedOn
          ).getTime();
          return Number(b.isPin) - Number(a.isPin) || dateB - dateA;
        }
      );
    this.lstView.listView.refresh();
    this.checkSortASC = false;
  }

  sortDataByASC(type = null) {
    if (this.lstView)
      this.lstView.dataService.data = this.lstView.dataService.data.sort(
        function (a, b) {
          var dateA = new Date(
            type == null ? a.createdOn : a.modifiedOn
          ).getTime();
          var dateB = new Date(
            type == null ? b.createdOn : b.modifiedOn
          ).getTime();
          return Number(b.isPin) - Number(a.isPin) || dateA - dateB;
        }
      );
    this.lstView.listView.refresh();
    this.checkSortASC = true;
  }

  getMaxPinNote() {
    this.api
      .exec<any>(
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetOneFieldByCalendarNote',
        'WPCalendars'
      )
      .subscribe((res) => {
        if (res[0]) {
          var dataValue = res[0].dataValue;
          var json = JSON.parse(dataValue);
          this.maxPinNotes = parseInt(json.MaxPinNotes, 10);
        }
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

  openFormUpdateNote(data) {
    var obj = {
      data: this.lstView.dataService.data,
      dataUpdate: data,
      formType: 'edit',
      maxPinNotes: this.maxPinNotes,
      component: 'note-drawer',
      countNotePin: this.countNotePin,
    };
    this.callfc.openForm(
      AddNoteComponent,
      'Cập nhật ghi chú',
      700,
      500,
      '',
      obj
    );

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
        maxPinNotes: this.maxPinNotes,
        component: 'note-drawer',
        formType: 'edit',
      };
      this.callfc.openForm(
        UpdateNotePinComponent,
        'Cập nhật ghi chú đã ghim',
        500,
        600,
        '',
        obj
      );
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
      maxPinNotes: this.maxPinNotes,
    };
    let option = new DialogModel();
    option.DataService = this.lstView.dataService as CRUDService;
    option.FormModel = this.lstView.formModel;
    this.callfc.openForm(
      AddNoteComponent,
      'Thêm mới ghi chú',
      700,
      500,
      '',
      obj,
      '',
      option
    );
  }

  onEditIsPin(data: Notes) {
    var isPin = !data.isPin;
    data.isPin = isPin;
    data.isNote = true;
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        data?.recID,
        data,
      ])
      .subscribe((res) => {
        if (res) {
          let dtNew = res;
          dtNew['transType'] = 'WP_Notes';
          dtNew['memo'] = res.memo;
          dtNew['transID'] = res.recID;
          dtNew['calendarDate'] = res.createdOn;
          var object = [{ data: dtNew, type: 'edit-note-drawer' }];
          this.noteService.data.next(object);
          this.changeDetectorRef.detectChanges();
        }
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
          let dtNew = res;
          dtNew['transType'] = 'WP_Notes';
          dtNew['memo'] = res.memo;
          dtNew['transID'] = res.recID;
          dtNew['calendarDate'] = res.createdOn;
          if (item.isPin) this.countNotePin--;
          var object = [{ data: dtNew, type: 'delete' }];
          this.noteService.data.next(object);
        }
      });
  }

  openFormNoteBooks(item) {
    // thiểu moreFC để dịch lang
    var obj = {
      itemUpdate: item,
      headerText: 'Sổ tay',
    };
    this.callfc.openForm(SaveNoteComponent, '', 900, 650, '', obj);
  }

  onSearch(e) {
    if (this.lstView) this.lstView.dataService.search(e);
    this.detectorRef.detectChanges();
  }

  valueChangeCB(e, note, index) {
    for (let i = 0; i < note.checkList.length; i++) {
      if (index == i) note.checkList[i].status = e.data;
    }
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        note?.recID,
        note,
      ])
      .subscribe();
  }
}
