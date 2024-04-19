import { AfterViewInit, Component, ContentChildren, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, QueryList, ViewChild } from '@angular/core';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'select-scroll-bar',
  templateUrl: './select-scroll-bar.component.html',
  styleUrls: ['./select-scroll-bar.component.scss']
})
export class SelectScrollBarComponent extends UIComponent{
  override onInit(): void {
    throw new Error('Method not implemented.');
  }
 

  @Input() listTabs: any[] = [];
  @Input() width :number
  @Input() height :string='72px'
  @Input() index:number;
  @Input() active: any[];
  @Input() isClick: boolean;
  @ViewChild('container') container!:ElementRef;
  @ViewChild('tabContainer') tabContainer!:ElementRef;
  @ViewChild('prev') prev!:ElementRef;
  @ViewChild('next') next!:ElementRef;
  @ViewChild('scrollele') scrollele!:ElementRef;
  timeoutfn:any;
  targetElements: any[] = [];
  tabElements: any[] = [];
  isShowSwiper:boolean = false;
  
  
  ngAfterViewInit(): void {
      this.onCheckContainerOverflow();
      this.targetElements.push(...this.container.nativeElement.children);
      this.tabElements.push(...this.tabContainer.nativeElement.children);

      console.log(this.targetElements);
  }
  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    const currentWidth = window.innerWidth;
    this.onCheckContainerOverflow()
  }
  protected onCheckContainerOverflow(){
        // debugger;
        var condition:boolean = this.tabContainer.nativeElement.scrollWidth - this.tabContainer.nativeElement.clientWidth > 0;
        if(condition){
            this.prev.nativeElement.style.display = 'block'; 
            this.next.nativeElement.style.display = 'block';
        }
        else{
          this.prev.nativeElement.style.display = 'none';
          this.next.nativeElement.style.display = 'none';
        }
  }
  hold:boolean = false;
  protected selectd:any;
  override ngOnInit() {
    this.selectd = this.listTabs[0];
  }
  ClickTabs(item:any){
    this.hold = true;
    this.selectd = item;
    clearTimeout(this.timeoutfn);
    
    const el = document.getElementById("target-" + item.id)
    //el?.scrollIntoView({behavior: 'smooth',block:"start" });
 // You can adjust this offset value as needed
    const targetTop = el?.offsetTop ?? 0 - this.container.nativeElement.offsetTop ;
    console.log('targetTop',targetTop);
    this.container.nativeElement.scrollTo({
      top: targetTop - 150,
      behavior: 'smooth'
    });
    this.container.nativeElement.height += 100;
    //el?.scrollTo({top: 500,behavior: "smooth"});
    console.log('container',this.container.nativeElement.scrollTop);
    console.log('el', el?.offsetTop);
    this.timeoutfn = setTimeout(() => {
      this.hold = false;
    }, 1000);
  }

  onScroll(event:any) {
    if(this.hold) return;
    console.log(event.target.scrollTop);
    var index: number = -1;
    this.targetElements.forEach((x,i)=> {
          let top = event.target.scrollTop;
          let offset = x.offsetTop;
          let height = (window.innerHeight / 2) - 250; 
          top = top + height              
          if(top == height){
            this.selectd = this.listTabs[0]
            index = 0;
          }
          else if(top >= offset){         
            this.selectd = this.listTabs[i]
            index = i;
          }
          else if((event.target.scrollTop  + event.target.offsetHeight) >= event.target.scrollHeight ){
            
            this.selectd = this.listTabs[this.listTabs.length - 1]
            index = this.listTabs.length - 1;
          }      
      }
    )
      if(index != -1){
          let elementActive = this.tabElements[index];
          var parent  =  this.tabContainer.nativeElement;
          var elementRect = elementActive.getBoundingClientRect();
           var parentRect = parent.getBoundingClientRect();

           var isOverflowingHorizontally = (elementRect.right > parentRect.right);
          if(isOverflowingHorizontally){
              parent.scrollLeft += 150;
          }
          else if(elementRect.left < parentRect.left){
            parent.scrollLeft -= 150;
          }
          
      }
  }

  navChange(evt: any, index: number = -1, functionID:number = -1, btnClick:any) {
    console.log(functionID)
    let containerList = document.querySelectorAll('.pw-content');
    let lastDivList = document.querySelectorAll('.div_final');
    console.log(containerList)
    let lastDiv = lastDivList[index];
    let container = containerList[index];
    console.log('container', container )
    let containerHeight = (container as any).offsetHeight;
    let contentHeight = 0;
    for (let i = 0; i < container.children.length; i++) {
      contentHeight += (container.children[i] as any).offsetHeight;
    }

    if (!evt) return;
    let element = document.getElementById(evt);
    console.log(element)
    if (!element) return;
    let distanceToBottom = contentHeight - element.offsetTop;

    if (distanceToBottom < containerHeight) {
      (lastDiv as any).style.width = '200px';
      (lastDiv as any).style.height = `${
        containerHeight - distanceToBottom + 50
      }px`;
    }

    if (index > -1) {
      this.active[functionID] = evt;
      console.log(this.active)
      this.detectorRef.detectChanges();
    }
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });

    console.log('qua')
    this.isClick = true;
    this.detectorRef.detectChanges();
    setTimeout(() => {
      this.isClick = false;
      return;
    }, 500);
  }




  // isInViewport(top:number,el:any) {
  //   console.log(top);
  //   const rect = el.getBoundingClientRect();
  //   // const elementPosition = rect.top;
  //   console.log(rect);
  //   console.log(this.selectd);
  //   console.log('tabContainer',this.tabContainer.nativeElement)
  //   console.log('rect.bottom', rect.bottom);
  //  return !(rect.top  >= (top) || rect.bottom < 0);
  // }
}
