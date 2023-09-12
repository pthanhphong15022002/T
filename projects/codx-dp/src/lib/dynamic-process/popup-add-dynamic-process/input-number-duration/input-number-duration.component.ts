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
  @Input() noteDay: any;

  // for hour
  @Input() hourMax: any;
  @Input() hourOld: any;
  @Input() textHour: any;
  @Input() noteHour: any;

  @Output() eventInput = new EventEmitter<any>();

  // type number
  dayValue: number = 0;
  hourValue: number = 0;

  // type boolean
  isView: boolean = false;

  readonly maxHourDefault: number = 23;
  readonly minHourDefault: number = 0;

  readonly maxDayDefault: number = 1000;
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
    this.noteDay =  this.formatNote(this.noteDay,this.maxDayDefault);
    this.noteHour =  this.formatNote(this.noteHour,this.maxHourDefault);
  }
  onInit() {}
  checkInputDayValue($event: any) {
    let value = parseInt($event.target.value ? $event.target.value: this.minDayDefault);
    if (( value ||value == 0) && this.dayMax) {
      if (value >= this.maxDayDefault) {
        value = this.maxDayDefault;
      } else if (value < this.dayMax) {
        this.notificationsService.notifyCode('DP012');
        value = this.dayMax;
        this.hourValue = this.hourValue >= this.hourMax ? this.hourValue: this.hourMax ;
      } else if (!value && value != 0) {
        value = this.dayMax;
      }
    }
    value = this.isTurnInput(this.typeDay, value);
    $event.target.value = value;
    this.dayValue = value;
    let data = {
      valueDay: value,
      valueHour: this.hourValue,
      type: this.typeDay,
    };

    this.eventInput.emit(data);
  }

  checkInputHourValue($event: any) {
    let value = parseInt( $event.target.value ? $event.target.value: this.minHourDefault) ;
    if ((value || value == 0) && this.dayMax && this.dayValue == this.dayMax) {
      if (value >= this.maxHourDefault) {
        value = this.maxHourDefault;
      } else if ( value < this.hourMax  ) {
        this.notificationsService.notifyCode('DP012');
        value = this.hourMax;
      } else if (!value && value != 0) {
        value = this.hourMax;
      }
    }
    value = this.isTurnInput(this.typeHour, value);
    $event.target.value = value;
    this.hourValue = value;
    let data = {
      valueHour: value,
      valueDay: this.dayValue,
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
      if (value >= this.maxDayDefault) {;
        this.hourValue = this.minHourDefault;
        value = this.maxDayDefault;
        this.isView = true
      }
      else if( value == this.secondMaxDayDefault && this.hourValue == this.maxHourDefault) {
        this.hourValue = this.minHourDefault;
        value = this.maxDayDefault;
      }
      else {
        this.isView = false;
      }
  } else if (type === this.typeHour) {
    if (value >= this.maxHourDefault) {
      value = this.maxHourDefault;
      }
      else if (
        this.dayValue == this.secondMaxDayDefault &&
        value == this.maxHourDefault
      ) {
        this.dayValue = this.maxDayDefault;
        value = this.minHourDefault;
        this.isView = true;
      }
       else {
        this.isView = this.dayValue == this.maxDayDefault;
      }
  } else {
      this.isView = false;
    }
    return value;
  }

  formatNote(note,maxValue){
    return (note ?? '').replace('{0}', maxValue);
  }
}
