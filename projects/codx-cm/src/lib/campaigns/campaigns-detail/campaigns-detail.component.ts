import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CRUDService, CodxService } from 'codx-core';

@Component({
  selector: 'codx-campaigns-detail',
  templateUrl: './campaigns-detail.component.html',
  styleUrls: ['./campaigns-detail.component.scss'],
})
export class CampaignsDetailComponent implements OnInit {
  @ViewChild('description', { read: ElementRef })
  description: ElementRef<HTMLElement>;

  @Input() dataSelected: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;
  @Input() gridViewSetup: any;
  @Input() isDoubleClick: boolean = false;
  @Output() clickMoreFunc = new EventEmitter<any>();

  id: any;
  loaded: boolean;

  isCollapsed: boolean = false;
  isCollapsable: boolean = false;
  isShow = false;
  overflowed = false;
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
  asideMode: string;

  constructor(
    private detectorRef: ChangeDetectorRef,
    private elementRef: ElementRef,
    private codxService: CodxService
  ) {
    this.asideMode = codxService.asideMode;

  }
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
        this.isCollapsed = false;
        this.overflowed = false;
        this.loaded = true;
        setTimeout(() => {
          const element: HTMLElement = this.description?.nativeElement;
          this.overflowed = element?.scrollHeight > element?.clientHeight;
        }, 0);
      }
    }
  }

  ngAfterViewInit(): void {}

  seeMore(id) {
    let element = document.getElementById('elementNote');
    if (element) {
      let height = element.offsetHeight
        ? JSON.parse(JSON.stringify(element.offsetHeight))
        : 0;
      if (
        this.dataSelected?.description == null ||
        this.dataSelected.description?.trim() == ''
      ) {
        height = 40;
      }
      if (height > 40) {
        this.isCollapsed = true;
        this.isCollapsable = true;
      }
      element.focus();
    }

    this.detectorRef.detectChanges();
  }

  clickMF(e, data) {
    this.clickMoreFunc.emit({ e: e, data: data });
  }

  //#region event element HTML
  clickShowTab(isShow) {
    this.isShow = isShow;
    this.detectorRef.detectChanges();
  }

  //#endregion
}
