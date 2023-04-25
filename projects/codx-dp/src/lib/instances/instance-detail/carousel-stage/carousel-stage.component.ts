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
  inject,
} from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'codx-carousel-stage',
  templateUrl: './carousel-stage.component.html',
  styleUrls: ['./carousel-stage.component.scss'],
})
export class CarouselStageComponent extends UIComponent
implements OnInit, AfterViewInit {
  @Input() dataSource: any;
  @Input() fieldName: any;
  @Input() maxSize: any;
  @Input() status: any;

  @Output() eventClicked = new EventEmitter<any>();

  listTreeView: any[] = [];
  listDefaultView: any[] = [];
  listStep: any[] = [];

  colorReasonSuccess:any;
  colorReasonFail:any;

  // type string
  selectedIndex: string = '0';
  viewSetting: string = '';

  // type number
  currentStep = 0;
  idElementCrr: any;
  readonly viewCarouselForPage: string = 'viewCarouselForPage';
  readonly viewCarouselDefault: string = 'viewCarouselDefault';
  readonly guidEmpty: string ='00000000-0000-0000-0000-000000000000'; // for save BE
  constructor(
    private config: NgbCarouselConfig,
    private changeDetectorRef: ChangeDetectorRef,
    private inject: Injector,
  ) {
    super(inject);
    config.showNavigationArrows = false;
    config.showNavigationIndicators = true;
    config.interval = 0;
    this.getColorReason();

  }

  ngAfterViewInit(): void {}
  onInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource']) {
      this.clearDataBefore();
      this.listStep = changes['dataSource'].currentValue;
      this.handleDateMaxSize(this.listStep, this.maxSize);
      this.status != '1' && this.autoClick(this.listStep);
      this.changeDetectorRef.detectChanges();
    }
  }

  clearDataBefore(){
    this.listTreeView = [];
    this.viewSetting = '';
    this.selectedIndex = '0';
    this.idElementCrr='';
  }
  handleDateMaxSize(list, maxSize) {
    if (list && list.length > maxSize) {
      var index = 0;
      for (let i = 0; i < list.length; i += maxSize) {
        const combinedItem = { items: list.slice(i, i + maxSize) };
        this.selectedIndex == '0' &&
          ( this.status == '2') && this.findStatusInDoing(combinedItem, index);
        this.listTreeView.push(combinedItem);
        index++;
      }
      this.status != '1' && this.status != '2' && this.stageEnd();
      this.viewSetting = this.viewCarouselForPage;
    } else if (list && list.length <= maxSize && list.length > 0) {
      this.listDefaultView = list;
      (this.status == '2') && this.findStatusInDoing(this.listDefaultView, null);
      this.viewSetting = this.viewCarouselDefault;
    }
  }

  getColorStepName(status: string) {
    if (status == '1') {
      return 'step current ';
    } else if (status == '3' || status == '4' || status == '5' || !status) {
      return 'step old ';
    }
    return 'step';
  }
  getbackgroundColor(item) {
    if(item.isSuccessStep) {
      return '--primary-color:' + this.colorReasonSuccess?.color;
    }
    else if(item.isFailStep) {
      return '--primary-color:' + this.colorReasonFail?.color;
    }
    return item?.backgroundColor
    ? '--primary-color:' + item?.backgroundColor
    : '--primary-color: #23468c';
  }

  findStatusInDoing(listStep, index) {
    this.currentStep = this.listStep.findIndex( (item) => item.stepStatus == '1');
    if (index) {
      var indexResult = listStep.items.findIndex(
        (item) => item.stepStatus == '1'
      );
      if (indexResult > -1) {

        this.selectedIndex =
          index == 0 || index ? index.toString() : this.selectedIndex;

      }
    }
  }
  stageEnd() {
    this.selectedIndex = (this.listTreeView.length - 1).toString();
  }
  eventClick(id) {
    this.idElementCrr = id;
    var index = this.dataSource.findIndex((x) => x.stepID == id);
    if (index != -1) {
      var isView = this.currentStep == index && (this.status == '1' || this.status == '2');
      var result = {
        index: index,
        id: id,
        isOnlyView: isView,
      };
      this.eventClicked.emit(result);
    }
    this.changeDetectorRef.detectChanges();
  }
  autoClick(listStep){
    let stepCrr = listStep?.filter(x=>x.stepStatus == '1')[0];
    var stepId = '';
    if(stepCrr) {
      stepId = stepCrr.stepID;
    }
    else {
      stepId = this.guidEmpty;
    }
    this.idElementCrr = stepId;
  }

  getColorReason(){
    this.cache.valueList('DP036').subscribe((res) => {
      if (res.datas) {
        for (let item of res.datas) {
          if (item.value === 'S') {
            this.colorReasonSuccess = item;
          } else if (item.value === 'F') {
            this.colorReasonFail = item;
          }
        }
      }
    });
  }
}
