import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxEsService } from 'projects/codx-es/src/public-api';

@Component({
  selector: 'approval-stationery',
  templateUrl: 'approval-stationery.component.html',
  styleUrls: ['approval-stationery.component.scss'],
})
export class ApprovalStationeryComponent extends UIComponent {
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  views: Array<ViewModel> | any = [];
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  entity = 'EP_BookingStationery';
  className = 'BookingsBusiness';
  method = 'GetAsync';
  idField = 'recID';
  taskViewStt;
  jobs;
  itemDetail;
  preStepNo;
  button;

  constructor(private injector: Injector, private esService: CodxEsService) {
    super(injector);

    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.template,
          //panelLeftRef: this.panelLeft,
          panelRightRef: this.panelRight,
          contextMenu: '',
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  click(event) {}

  clickMF(event, data) {}

  changeItemDetail(event) {}

  closeAddForm(event) {}

  getDetailSignFile(id: any) {
    this.esService
      .getDetailSignFile(this.itemDetail?.recID)
      .subscribe((res) => {
        if (res) {
          this.itemDetail = res;
          this.detectorRef.detectChanges();
        }
      });
  }
}
