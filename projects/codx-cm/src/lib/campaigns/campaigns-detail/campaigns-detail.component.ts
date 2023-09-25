import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CRUDService } from 'codx-core';

@Component({
  selector: 'codx-campaigns-detail',
  templateUrl: './campaigns-detail.component.html',
  styleUrls: ['./campaigns-detail.component.scss'],
})
export class CampaignsDetailComponent implements OnInit {
  @ViewChild('elementNote')
  elementNote: ElementRef<HTMLElement>;

  @Input() dataSelected: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;
  @Input() gridViewSetup: any;
  id: any;
  loaded: boolean;

  isCollapsed: boolean = false;
  isCollapsable: boolean = false;
  isShow = false;

  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true, template: null },
    {
      name: 'Comment',
      textDefault: 'Thảo luận',
      isActive: false,
      template: null,
    },
    {
      name: 'Attachment',
      textDefault: 'Đính kèm',
      isActive: false,
      template: null,
    },
    { name: 'Task', textDefault: 'Công việc', isActive: false, template: null },
  ];
  constructor(
    private detectorRef: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}
  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelected']) {
      if (
        changes['dataSelected'].currentValue != null &&
        changes['dataSelected'].currentValue?.recID
      ) {
        if (changes['dataSelected'].currentValue?.recID == this.id) return;
        this.loaded = false;
        this.id = changes['dataSelected'].currentValue?.recID;
        this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
        this.seeMore();
        this.loaded = true;
      }
    }
  }

  ngAfterViewInit(): void {
    this.detectorRef.detectChanges();
  }

  seeMore() {
    this.isCollapsed = false;
    this.isCollapsable = false;

    let element = document.getElementById('elementNote');
    if (element) {
      if (element.offsetHeight > 35) {
        this.isCollapsed = true;
        this.isCollapsable = true;
      }
    }

    this.detectorRef.detectChanges();
  }

  clickMF(e, data) {}

  //#region event element HTML
  clickShowTab(isShow) {
    this.isShow = isShow;
    this.detectorRef.detectChanges();
  }

  //#endregion
}
