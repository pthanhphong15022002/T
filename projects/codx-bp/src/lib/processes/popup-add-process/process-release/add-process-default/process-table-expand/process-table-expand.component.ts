import { Component, Optional, QueryList, ViewChildren } from '@angular/core';
import { AlertConfirmInputConfig, CodxGridviewV2Component, DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-process-table-expand',
  templateUrl: './process-table-expand.component.html',
  styleUrls: ['./process-table-expand.component.css']
})
export class ProcessTableExpandComponent {
  @ViewChildren('gridView') gridView: QueryList<CodxGridviewV2Component>;
  
  indexTable = 0;
  headerText:any;
  columnsGrid:any;
  dataSource:any;
  editSettings:any;
  hasIndexNo:any;
  dialog:any;

  constructor(
    private notifySvr: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  )
  {
    this.dialog = dialog;
    this.headerText = dt?.data?.headerText,
    this.columnsGrid = dt?.data?.columnsGrid,
    this.dataSource = dt?.data?.dataSource,
    this.editSettings = dt?.data?.editSettings,
    this.indexTable = dt?.data?.indexTable || 0;
    this.hasIndexNo = dt?.data?.hasIndexNo || false;
  }

  addRow() {
    var grid = this.gridView.find((_, i) => i == this.indexTable);
    var data = {
      delete : true
    };
    //if(!grid.dataSource) grid.dataSource = [];
    grid.addRow(data, grid.dataSource.length);
    //grid.refresh();
  }

  clickMFGrid(e: any) {
    let funcID = e?.event?.functionID;
    switch (funcID) {
      //Xóa
      case 'SYS02': {
        var config = new AlertConfirmInputConfig();
        config.type = 'YesNo';
        this.notifySvr
          .alert('Thông báo', 'Bạn có chắc chắn muốn xóa?', config)
          .closed.subscribe((x) => {
            if (x.event.status == 'Y')
              this.deleteRow(
                e?.data,
                this.indexTable,
                this.hasIndexNo
              );
          });
        break;
      }
    }
  }
  
  deleteRow(data: any, index = 0, hasIndexNo = false) {
    this.dataSource.splice(data.index, 1);
    if (hasIndexNo) {
      let i = 1;
      this.dataSource.forEach((elm) => {
        elm.indexNo = i;
        i++;
      });
    }
    var grid = this.gridView.find((_, i) => i == index);
    grid.refresh();
  }

  onSave()
  {
    this.dialog.close(this.dataSource)
  }
}
