import { Component, Input, QueryList, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService } from 'codx-core';
export class GridModels {
  pageSize: number;
  entityName: string;
  entityPermission: string;
  formName: string;
  gridViewName: string;
  funcID: string;
  dataValues: string;
  predicates: string;
}
@Component({
  selector: 'codx-instance-dashboard',
  templateUrl: './instance-dashboard.component.html',
  styleUrls: ['./instance-dashboard.component.css'],
})
export class InstanceDashboardComponent {
  @ViewChild('templateDetail') templates: QueryList<any>;
  isEditMode = true;
  datas: any;
  panels: any;
  @Input() vllStatus: any;
  arrVllStatus = [];
  constructor(private api: ApiHttpService, private cache: CacheService) {
    this.cache.valueList(this.vllStatus).subscribe((res) => {
      if (res) this.arrVllStatus = res;
    });
    this.setting();
  }

  onInit(): void {}

  setting() {
    this.panels = JSON.parse(
      '[{"id":"0.1636284528927885_layout","row":0,"col":0,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.5801149283702021_layout","row":0,"col":8,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.6937258303982936_layout","row":4,"col":0,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.5667390469747078_layout","row":4,"col":8,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.4199281088325755_layout","row":0,"col":16,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Tỷ lệ công việc được giao"},{"id":"0.4592017601751599_layout","row":0,"col":32,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Theo nguồn công việc"},{"id":"0.14683256767762543_layout","row":16,"col":16,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.36639064171709834_layout","row":16,"col":24,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.06496875406606994_layout","row":8,"col":16,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null},{"id":"0.21519762020962552_layout","row":8,"col":0,"sizeX":16,"sizeY":12,"minSizeX":16,"minSizeY":12,"maxSizeX":null,"maxSizeY":null,"header":"Tỷ lệ hoàn thành công việc"},{"id":"0.3516224838830073_layout","row":20,"col":0,"sizeX":32,"sizeY":12,"minSizeX":32,"minSizeY":12,"maxSizeX":null,"maxSizeY":null,"header":"Thống kê công việc hoàn thành và số giờ thực hiện"},{"id":"0.36601875176456145_layout","row":8,"col":32,"sizeX":16,"sizeY":24,"minSizeX":16,"minSizeY":24,"maxSizeX":null,"maxSizeY":null,"header":"Tỷ lệ công việc theo nhóm"}]'
    );
    this.datas = JSON.parse(
      '[{"panelId":"0.1636284528927885_layout","data":"1"},{"panelId":"0.5801149283702021_layout","data":"2"},{"panelId":"0.6937258303982936_layout","data":"3"},{"panelId":"0.5667390469747078_layout","data":"4"},{"panelId":"0.4199281088325755_layout","data":"5"},{"panelId":"0.4592017601751599_layout","data":"6"},{"panelId":"0.21519762020962552_layout","data":"7"},{"panelId":"0.06496875406606994_layout","data":"8"},{"panelId":"0.14683256767762543_layout","data":"9"},{"panelId":"0.36639064171709834_layout","data":"10"},{"panelId":"0.36601875176456145_layout","data":"11"},{"panelId":"0.3516224838830073_layout","data":"12"}]'
    );
  }

  getNameStatus(status) {
    return this.arrVllStatus.filter((x) => x.value == status)[0]?.text;
  }
}
