import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NotificationsService, UIComponent } from 'codx-core';

@Component({
  selector: 'codx-input-number-duration',
  templateUrl: './input-number-duration.component.html',
  styleUrls: ['./input-number-duration.component.scss'],
})
export class InputNumberDurationComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() field: any;
  @Input() dataValue: any;

  // for day
  @Input() dayMax: any;
  @Input() dayOld: any;
  @Input() textDay: any;

  // for hour
  @Input() hourMax: any;
  @Input() hourOld: any;
  @Input() textHour: any;

  @Output() eventInput = new EventEmitter<any>();

  // type number
  dayValue: number = 0;
  hourValue: number = 0;

  // type boolean
  isView: boolean = false;

  readonly maxHourDefault: number = 24;
  readonly minHourDefault: number = 0;

  readonly maxDayDefault: number = 100;
  readonly secondMaxDayDefault: number = this.maxDayDefault - 1;
  readonly minDayDefault: number = 0;

  readonly typeDay: string = 'D';
  readonly typeHour: string = 'H';

  readonly regex = /[^0-9]/g;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private inject: Injector,
    private notificationsService: NotificationsService
  ) {
    super(inject);
  }
  ngAfterViewInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dayMax']) {
      this.dayMax = changes['dayMax'].currentValue;
    }
    if (changes['hourMax']) {
      this.hourMax = changes['hourMax'].currentValue;
    }
    if (changes['dayOld']) {
      this.dayOld = changes['dayOld'].currentValue;
      this.dayValue = this.isTurnInput(this.typeDay,this.dayOld);
    }
    if (changes['hourOld']) {
      this.hourOld = changes['hourOld'].currentValue;
      this.hourValue =  this.isTurnInput(this.typeHour,this.hourOld);
    }
  }
  onInit() {}
  checkInputDayValue($event: any) {
    var value = 0;
    if (($event.target.value || $event.target.value == 0) && this.dayMax) {
      value = parseFloat($event.target.value);
      if (value >= this.maxDayDefault) {
        value = this.maxDayDefault;
      } else if (value < this.dayMax) {
        this.notificationsService.notifyCode('DP012');
        value = this.dayMax;
      } else if (!value && value != 0) {
        value = this.dayMax;
      }
    } else {
      value = this.minDayDefault;
    }
    value = this.isTurnInput(this.typeDay, value);
    $event.target.value = value;
    this.dayValue = $event.target.value;
    var data = {
      value: value,
      type: this.typeDay,
    };

    this.eventInput.emit(data);
  }

  checkInputHourValue($event: any) {
    var value = 0;
    if (($event.target.value || $event.target.value == 0) && this.dayMax) {
      value = parseFloat($event.target.value);
      if (value >= this.maxHourDefault) {
        value = this.maxHourDefault;
      } else if (value < this.hourMax) {
        this.notificationsService.notifyCode('DP012');
        value = this.hourMax;
      } else if (!value && value != 0) {
        value = this.hourMax;
      }
    } else {
      value = this.minHourDefault;
    }

    value = this.isTurnInput(this.typeHour, value);
    $event.target.value = value;
    this.hourValue = $event.target.value;
    var data = {
      value: value,
      type: this.typeHour,
    };
    this.eventInput.emit(data);
  }

  onKeyDownFormat(event: KeyboardEvent): void {
    if (event.key === '+' || event.key === '-' || event.key === '.') {
      event.preventDefault();
    }
  }

  isTurnInput(type: string, value: number) {
    if (type === this.typeDay) {
      if (value == this.maxDayDefault) {
        this.isView = true;
      } else {
        this.isView = false;
      }
    } else if (type === this.typeHour) {
      if (
        this.dayValue == this.secondMaxDayDefault &&
        value == this.maxHourDefault
      ) {
        this.isView = true;
        this.dayValue = this.maxDayDefault;
        value = this.minHourDefault;
      } else {
        this.isView = false;
      }
    } else {
      this.isView = false;
    }
    return value;
  }
}
