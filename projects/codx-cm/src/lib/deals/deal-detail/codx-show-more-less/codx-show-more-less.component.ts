import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormModel, DataRequest, ApiHttpService, CallFuncService, NotificationsService, CacheService } from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';

@Component({
  selector: 'codx-show-more-less',
  templateUrl: './codx-show-more-less.component.html',
  styleUrls: ['./codx-show-more-less.component.css']
})
export class CodxShowMoreLessComponent implements OnInit {
  @ViewChild('elementNote', { read: ElementRef })
  elementNote: ElementRef<HTMLElement>;


  @Input() value: any;
  @Input() formModel: any;
 @Input() text: any;

  isCollapsed: boolean = false;
  isCollapsable: boolean = false;
  isShow:boolean = false;
  overflowed:boolean = false;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callFc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private codxCmService: CodxCmService,
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      this.seeMore();
    }, 0);
  }
  async ngOnInit() {

  }

  ngAfterViewInit(): void {
    const element: HTMLElement = this.elementNote?.nativeElement;
    this.overflowed = element?.scrollHeight > element?.clientHeight;
    this.changeDetectorRef.detectChanges();
  }

  seeMore() {
    let element = document.getElementById('elementNote');
    if (element) {
      let height = element.offsetHeight
        ? JSON.parse(JSON.stringify(element.offsetHeight))
        : 0;
      if (
        this.value == null ||
        this.value?.trim() == ''
      ) {
        height = 40;
      }
      if (height > 40) {
        this.isCollapsed = true;
        this.isCollapsable = true;
      }
      element.focus();
    }

    this.changeDetectorRef.detectChanges();
  }


}
