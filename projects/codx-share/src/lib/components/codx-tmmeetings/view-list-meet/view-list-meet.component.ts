import { ChangeDetectorRef, ViewChild } from '@angular/core';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  FormModel,
  CallFuncService,
  ViewsComponent,
  Util,
} from 'codx-core';
import { ActivatedRoute } from '@angular/router';
import { CO_Permissions } from '../models/CO_Meetings.model';

@Component({
  selector: 'share-view-list-meet',
  templateUrl: './view-list-meet.component.html',
  styleUrls: ['./view-list-meet.component.scss'],
})
export class ViewListMeetComponent implements OnInit {
  @Input() data?: any;
  @Input() formModel?: FormModel;
  @Input() user?: any;
  @Output() changeMF = new EventEmitter<any>();
  @Output() clickMoreFunction = new EventEmitter<any>();
  @Output() viewDetail = new EventEmitter<any>();
  @ViewChild('view') view!: ViewsComponent;

  month: any;
  day: any;
  startTime: any;
  endTime: any;
  permissions: CO_Permissions[] = [];
  objectID: any;
  popoverCrr: any;
  countResource = 0;
  dialog: any;
  funcID: any;
  widthWin: any;
  heightWin: any;
  constructor(
    private activedRouter: ActivatedRoute,
    private callFc: CallFuncService,
    private detectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
  }

  ngOnInit(): void {
    console.log(this.data);
    this.getDate();
    this.getResourceID();
  }

  clickMF(e: any, dt?: any) {
    this.clickMoreFunction.emit({ e: e, data: dt });
  }
  changeDataMF(e: any, data: any) {
    this.changeMF.emit({e: e, data: data});
  }
  getResourceID() {
    this.permissions = this.data.permissions;
    var id = '';
    this.permissions.forEach((e) => {
      id += e.objectID + ';';
    });
    if (id != '') {
      this.objectID = id.substring(0, id.length - 1);
    }
  }

  getDate() {
    if (this.data.startDate) {
      var date = new Date(this.data.startDate);
      this.month = this.addZero(date.getMonth() + 1);
      this.day = this.addZero(date.getDate());
      var endDate = new Date(this.data.endDate);
      let start =
        this.addZero(date.getHours()) + ':' + this.addZero(date.getMinutes());
      let end =
        this.addZero(endDate.getHours()) +
        ':' +
        this.addZero(endDate.getMinutes());

      this.startTime = start + ' - ' + end;
    }
  }

  addZero(i) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  }

  convertHtmlAgency(position: any) {
    var desc = '<div class="d-flex">';
    if (position)
      desc +=
        '<div class="d-flex align-items-center me-2"><span class=" text-dark-75 font-weight-bold icon-apartment1"></span><span class="">' +
        position +
        '</span></div>';

    return desc + '</div>';
  }

  popoverEmpList(p: any) {
    if (this.popoverCrr) {
      if (this.popoverCrr.isOpen()) this.popoverCrr.close();
      p.open();
      this.popoverCrr = p;
    }
  }

  searchName(e) {
    this.data.resources = this.data.resources.filter((val) =>
      val.resourceName.toLowerCase().includes(e.toLowerCase())
    );
  }
  dbClick(data) {
    this.viewDetail.emit(data);
  }


}
