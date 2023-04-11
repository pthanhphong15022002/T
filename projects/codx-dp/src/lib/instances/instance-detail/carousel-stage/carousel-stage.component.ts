import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'codx-carousel-stage',
  templateUrl: './carousel-stage.component.html',
  styleUrls: ['./carousel-stage.component.scss']
})
export class CarouselStageComponent {
  @Input() dataSource: any;
  @Input() fieldName: any;
  @Input() maxSize: any;
  @Input() status:any;


  @Output() eventClicked = new EventEmitter<any>();

  listTreeView:any []=[];
  listDefaultView:any[] = [];

  // type string
  selectedIndex:string ='0';
  viewSetting: string = '';

  // type number
  currentStep = 0;

  readonly viewCarouselForPage: string = 'viewCarouselForPage';
  readonly viewCarouselDefault: string = 'viewCarouselDefault';
  constructor(
    private config: NgbCarouselConfig,
    private ChangeDetectorRef: ChangeDetectorRef,

  ) {
    config.showNavigationArrows = false;
		config.showNavigationIndicators = true;
    config.interval = 0;
  }
   ngOnInit() {

  }



  ngAfterViewInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource']) {
      this.listTreeView = [];
      this.viewSetting = '';
      this.selectedIndex ='0';
      this.handleDateMaxSize(changes['dataSource'].currentValue,this.maxSize);
      this.ChangeDetectorRef.detectChanges();
    }
  }

  handleDateMaxSize(list,maxSize)
  {
    debugger;
    if(list && list.length > maxSize) {
      var index = 0;
      for (let i = 0; i < list.length; i += maxSize) {
        const combinedItem = {items: list.slice(i, i + maxSize) };
        (this.selectedIndex == '0' && (this.status == '1' || this.status == '2')) && this.findStatusInDoing(combinedItem,index);
        this.listTreeView.push(combinedItem);
        index++;
      }
      (this.status != '1' && this.status != '2') && this.stageEnd();
      this.viewSetting = this.viewCarouselForPage;
    }
    else if(list && (list.length <= maxSize && list.length > 0  ) )
    {
      this.listDefaultView = list;
      this.viewSetting = this.viewCarouselDefault;
    }

  }

  getColorStepName(status: string) {
    if (status == '1') {
      return 'step current';
    } else if (
      status == '3' ||
      status == '4' ||
      status == '5' ||
      !status
    ) {
      return 'step old';
    }
    return 'step';
  }
  getbackgroundColor(item) {
    return item?.backgroundColor
      ? '--primary-color:' + item?.backgroundColor
      : '--primary-color: #23468c';
  }

  findStatusInDoing(listStep,index){
    var indexResult = listStep.items.findIndex(item => item.stepStatus == '1');
    if (indexResult > -1) {
        this.selectedIndex = index.toString();
        this.currentStep = indexResult;
    }
  }
  stageEnd(){
    this.selectedIndex = (this.listTreeView.length -1).toString();
  }
  eventClick(id){
   var index = this.dataSource.findIndex(x=>x.stepID == id);
   if(index != -1) {
    var result = {
      index: index,
      id: id
    }
    if (
      this.currentStep < index && (this.status === '1' || this.status === '2')
    )
      return;
    this.eventClicked.emit(result);
   }
  }
}
