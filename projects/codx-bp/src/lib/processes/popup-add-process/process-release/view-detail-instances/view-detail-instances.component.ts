import { ChangeDetectorRef, Component, Input, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-view-detail-instances',
  templateUrl: './view-detail-instances.component.html',
  styleUrls: ['./view-detail-instances.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ViewDetailInstancesComponent {
  @Input() dataSelected: any;
  @Input() formModel: any;
  @Input() asideMode: string ;
  @Input() lstSteps = [];
  process:any;
  loaded: boolean;
  id: any;
  isShow = false;
  info: any;
  progressIns = 0;
  constructor(private changeDetectorRef: ChangeDetectorRef, private shareService: CodxShareService , private api: ApiHttpService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelected']) {
      if (
        changes['dataSelected'].currentValue != null &&
        changes['dataSelected'].currentValue?.recID
      ) {
        if (changes['dataSelected'].currentValue?.recID == this.id) return;
        this.loaded = false;
        this.id = changes['dataSelected'].currentValue?.recID;
        this.dataSelected = JSON.parse(
          JSON.stringify(changes['dataSelected'].currentValue)
        );
        this.getInfo();
        this.getProcess();
        this.loaded = true;
        if(this.dataSelected?.countTasks > 0){
          this.progressIns = this.dataSelected?.completedTasks ? this.dataSelected?.completedTasks / this.dataSelected?.countTasks : 0;
        }

      }
    }
  }

  getProcess() {
    this.api
      .execSv('BP', 'BP', 'ProcessesBusiness', 'GetAsync', this.dataSelected.processID)
      .subscribe((item) => {
        if (item) {
          this.process = item;
        }
      });
  }

  clickShowTab(isShow) {
    this.isShow = isShow;
    this.changeDetectorRef.detectChanges();
  }

  getInfo()
  {
    let paras = [this.dataSelected.createdBy];
    let keyRoot = 'UserInfo' + this.dataSelected.createdBy;
    let info = this.shareService.loadDataCache(paras,keyRoot,"SYS","AD",'UsersBusiness','GetOneUserByUserIDAsync');
    if(isObservable(info))
    {
      info.subscribe(item=>{
        this.info = item;
      })
    }
    else this.info = info;

  }

}
