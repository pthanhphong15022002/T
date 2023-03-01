import { DP_Processes } from './../../models/models';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { CallFuncService, DialogData, DialogModel, DialogRef } from 'codx-core';
import { TabModel } from '../../models/models';
import { DomSanitizer } from '@angular/platform-browser';
import { CodxDpService } from '../../codx-dp.service';

@Component({
  selector: 'lib-popup-views-details-process',
  templateUrl: './popup-views-details-process.component.html',
  styleUrls: ['./popup-views-details-process.component.scss'],
})
export class PopupViewsDetailsProcessComponent implements OnInit {
  dialog: DialogRef;
  name = 'Mission';
  isCreate = false;
  process = new DP_Processes();
  dialogGuide: DialogRef;
  headerText ='Hướng dẫn các bước thực hiện' ;
  openPop =false ;
  stepNames = []
  @ViewChild('popupGuide') popupGuide;
  tabControl: TabModel[] = [
    { name: 'Mission', textDefault: 'Nhiệm vụ', isActive: true },
    { name: 'Dashboard', textDefault: 'Dashboard', isActive: false },
  ];
  // value
  vllApplyFor = 'DP002';
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
    private callFunc: CallFuncService,
    private dpService: CodxDpService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.process = dt?.data?.data;
    this.isCreate = dt.data.isCreate;
    this.dpService
      .updateHistoryViewProcessesAsync(this.process.recID)
      .subscribe();
  }

  ngOnInit(): void {}

  clickMenu(item) {
    this.name = item.name;
    this.tabControl.forEach((obj) => {
      if (!obj.isActive && obj.name == this.name) {
        obj.isActive = true;
      } else obj.isActive = false;
    });
    this.changeDetectorRef.detectChanges();
  }
  showGuide(p) {
    p.close();
    let option = new DialogModel();
    option.zIndex = 1001;
    if(this.openPop)return
    this.openPop = true ;
    this.dpService.getGuide(this.process.recID).subscribe(res=>{
      this.openPop = false ;
      if(res && res.length >0){
        this.stepNames = res
        this.dialogGuide = this.callFunc.openForm(
          this.popupGuide,
          '',
          500,
          150,
          '',
          null,
          '',
          option
        );
      }     
    })
 
  }
}
