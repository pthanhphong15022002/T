import { ChangeDetectorRef, Component, Injector } from '@angular/core';
import { CodxDMService } from '../codx-dm.service';
import { NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-searching',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.css']
})
export class SearchingComponent {
  funcID = "DMT09";
  service = "DM"
  entityName = "DM_FileInfo"
  dataFile:any;
  visible= false;
  constructor(
    public dmSV: CodxDMService,
    private notificationsService : NotificationsService,
    private changeDetectorRef: ChangeDetectorRef
   
  ) {
    
  }
  onSelected(e:any)
  {}

  dbView(data: any) {
    debugger
    if (data.recID && data.fileName != null) {
      if (!data.read) {
        this.notificationsService.notifyCode('DM059');
        return null;
      }
      this.viewFile(data);
    }
    this.dmSV.openItem(data);
  }
  viewFile(e: any) {
    this.dataFile = e;
    this.visible = true;
  }
  
  dialogClosed() {
    this.visible = false;
    this.changeDetectorRef.detectChanges();
  }
}
