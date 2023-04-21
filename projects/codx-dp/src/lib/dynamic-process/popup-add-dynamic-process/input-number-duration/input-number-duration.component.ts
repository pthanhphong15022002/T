import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input, OnInit, SimpleChanges } from '@angular/core';
import { NotificationsService, UIComponent } from 'codx-core';

@Component({
  selector: 'codx-input-number-duration',
  templateUrl: './input-number-duration.component.html',
  styleUrls: ['./input-number-duration.component.scss']
})
export class InputNumberDurationComponent extends UIComponent
implements OnInit, AfterViewInit{
  @Input() field: any;
  @Input() dataValue:any;

  // for day
  @Input() dayMax:any;
  @Input() dayOld:any;
  @Input() textDay: any;

  // for hour
  @Input() HourMax:any;
  @Input() HourOld:any;
  @Input() textHour: any;

  constructor(
    // private config: NgbCarouselConfig,
    private changeDetectorRef: ChangeDetectorRef,
    private inject: Injector,
    private notificationsService: NotificationsService,
  ) {
    super(inject);
    // config.showNavigationArrows = false;
    // config.showNavigationIndicators = true;
    // config.interval = 0;
    // this.getColorReason();

  }
  ngAfterViewInit(): void {
  }
 ngOnChanges(changes: SimpleChanges): void {


 }
 onInit() {}

 checkInputValue($event) {
  debugger;
  this.notificationsService.notifyCode('DP012');
 }
}
