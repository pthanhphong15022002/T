import { Component, EventEmitter, Input, Output, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, AuthService, CallFuncService, DialogModel } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';
import { environment } from 'src/environments/environment';

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
  constructor(private shareService: CodxShareService, private api: ApiHttpService, private auth: AuthService, private callFc: CallFuncService) {}
  ngOnInit(): void {
    this.user = this.auth.userValue;
    this.getInfo();
    this.getProcessAndInstances();
    this.getTimeDurationdAndInterval();
    this.getDataFileAsync(this.dataSelected.recID);
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

  getProcessAndInstances(){
    this.api.execSv<any>('BP','ERM.Business.BP','ProcessTasksBusiness','GetProcessAndInstanceAsync', this.dataSelected.instanceID).subscribe((res) => {
      if(res){
        this.instance = res[0];
        this.process = res[1];
      }
    })
  }

  getTimeDurationdAndInterval(){
    let sumDuration = 0;
    if(this.dataSelected.duration == null){
      this.dataSelected.duration = 0;
    }

    if(this.dataSelected.interval == null || this.dataSelected.interval?.trim() == ''){
      this.dataSelected.interval = '0';
    }
    this.sumDuration = sumDuration;
  }

  openPopup() {
    if (this.tmpListItem) {
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
  }

  getDataFileAsync(pObjectID: string) {
    if (pObjectID) {
      this.api
        .execSv(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'GetFilesByIbjectIDAsync',
          pObjectID
        )
        .subscribe((res: any) => {
          if (res.length > 0) {
            let files = res;
            files.map((e: any) => {
              if (e && e.referType == 'video') {
                e[
                  'srcVideo'
                ] = `${environment.apiUrl}/api/dm/filevideo/${e.recID}?access_token=${this.user.token}`;
              }
            });
            this.lstFile = res;
            this.countData = res.length;
          }
        });
    }
  }

  dbClick(data){
    this.dbClickEvent.emit({data: data});
  }
}
