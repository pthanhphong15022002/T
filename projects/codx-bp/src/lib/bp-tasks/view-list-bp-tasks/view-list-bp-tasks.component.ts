import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthService,
  CallFuncService,
  DialogModel,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Subject, isObservable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CodxBpService } from '../../codx-bp.service';

@Component({
  selector: 'lib-view-list-bp-tasks',
  templateUrl: './view-list-bp-tasks.component.html',
  styleUrls: ['./view-list-bp-tasks.component.css'],
})
export class ViewListBpTasksComponent implements OnInit {
  @ViewChild('tmpListItem') tmpListItem: TemplateRef<any>;

  @Input() dataSelected: any;
  @Input() formModel: any;
  @Output() dbClickEvent = new EventEmitter<any>();
  info: any;
  instance: any;
  process: any;
  sumDuration = 0;
  lstFile = [];
  countData = 0;
  user: any;
  constructor(
    private shareService: CodxShareService,
    private api: ApiHttpService,
    private auth: AuthService,
    private callFc: CallFuncService,
    private bpSv: CodxBpService
  ) {}
  ngOnInit(): void {
    this.user = this.auth.userValue;
    this.getInfo();
    this.getProcessAndInstances();
    this.getTimeDurationdAndInterval();
  }
  getInfo() {
    let paras = [this.dataSelected.createdBy];
    let keyRoot = 'UserInfo' + this.dataSelected.createdBy;
    let info = this.shareService.loadDataCache(
      paras,
      keyRoot,
      'SYS',
      'AD',
      'UsersBusiness',
      'GetOneUserByUserIDAsync'
    );
    if (isObservable(info)) {
      info.subscribe((item) => {
        this.info = item;
      });
    } else this.info = info;
  }

  getProcessAndInstances() {
    this.api
      .execSv<any>(
        'BP',
        'ERM.Business.BP',
        'ProcessTasksBusiness',
        'GetProcessAndInstanceAsync',
        this.dataSelected.instanceID
      )
      .subscribe((res) => {
        if (res && res?.length > 0) {
          this.instance = res[0];
          console.log('intance: ', this.instance);
          if (this.instance.documentControl?.length > 0) {
            let documentControl = this.instance.documentControl;
            let lstIDs = [];
            documentControl.forEach((element) => {
              if (element.files?.length > 0) {
                let files = element.files.filter(
                  (x) => x.type == '1' || x.type == '3'
                );
                this.countData += files?.length ?? 0;
              }
            });
          }
          this.process = res[1];
        }
      });
  }

  getTimeDurationdAndInterval() {
    let sumDuration = 0;
    if (this.dataSelected.duration == null) {
      this.dataSelected.duration = 0;
    }

    if (
      this.dataSelected.interval == null ||
      this.dataSelected.interval?.trim() == ''
    ) {
      this.dataSelected.interval = '0';
    }
    this.sumDuration = sumDuration;
  }

  openPopup() {
    if (this.tmpListItem) {
      // this.api.execSv<any>('BP','ERM.Business.BP','ProcessInstancesBusiness','GetItemsByInstanceIDAsync', this.dataSelected.instanceID).subscribe((res) => {
      //   if(res){
      if (this.instance.documentControl?.length > 0) {
        let documentControl = this.instance.documentControl;
        let lstIDs = [];
        documentControl.forEach((element) => {
          if (element.files?.length > 0) {
            let files = element.files.filter(
              (x) => x.type == '1' || x.type == '3'
            );
            if (files?.length > 0) {
              let ids = files.map((x) => x.fileID);
              lstIDs = [...lstIDs, ...ids];
            }
          }
        });
        if (lstIDs?.length > 0) {
          this.bpSv.getFilesByListIDs(lstIDs).subscribe((files) => {
            if (files && files?.length > 0) {
              this.lstFile = files;
              let option = new DialogModel();
              option.zIndex = 100;
              let popup = this.callFc.openForm(
                this.tmpListItem,
                '',
                400,
                500,
                '',
                null,
                '',
                option
              );
              popup.closed.subscribe((res: any) => {
                if (res) {
                  // this.getDataFileAsync(this.dataSelected.recID);
                }
              });
            }
          });
        }
      }
    }
  }

  getDataFileAsync(pObjectIDs: any) {
    if (pObjectIDs?.length > 0) {
      this.api
        .execSv(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'GetFilesByListIDsAsync',
          pObjectIDs
        )
        .subscribe((res: any) => {
          if (res.length > 0) {
            this.lstFile = res;
          }
        });
    }
  }

  dbClick(data) {
    this.dbClickEvent.emit({
      data: data,
      process: this.process,
      dataIns: this.instance,
    });
  }

  popoverDetail: any;
  popupOld: any;
  popoverList: any;
  fieldPopover: any;
  isPopoverOpen = false;
  PopoverDetail(e, p: any, emp, field: string) {
    this.isPopoverOpen = true;
    let parent = e?.currentTarget?.clientHeight;
    let child = e?.currentTarget?.scrollHeight;
    const isOpen = p.isOpen();
    if (this.popupOld?.popoverClass !== p?.popoverClass) {
      this.popupOld?.close();
    }
    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp[field] != null && emp[field]?.trim() != '') {
        if (parent < child) {
          p.open();
        }
      }
    } else {
      p.close();
    }
    this.popupOld = p;
    this.fieldPopover = field;
  }

  popoverClosed(p) {
    p.close();

    this.isPopoverOpen = false;
  }

  closePopover() {
    this.popupOld?.close();
  }

  checkHover(id) {
    var subject = new Subject<boolean>();
    setTimeout(() => {
      let isCollapsed = false;
      let element = document.getElementById(id);
      if (element) {
        if (element.offsetHeight > 40) {
          isCollapsed = true;
        }
      }
      subject.next(isCollapsed);
    }, 100);

    return subject.asObservable();
  }
}
