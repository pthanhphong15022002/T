import { AfterViewInit, Component, ContentChildren, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, QueryList, SimpleChanges, ViewChild } from '@angular/core';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'select-scroll-bar',
  templateUrl: './select-scroll-bar.component.html',
  styleUrls: ['./select-scroll-bar.component.scss']
})
export class SelectScrollBarComponent extends UIComponent {
  override onInit(): void {
    throw new Error('Method not implemented.');
  }


  @Input() listTabs: any[] = [];
  @Input() width: number | undefined
  @Input() height: string = '72px'
  @Input() index: number = -1;
  @Input() active: any[] = [null, null, null, null, null, null, null];
  @Input() isClick: boolean = false;
  @ViewChild('container') container!: ElementRef;
  @ViewChild('tabContainer') tabContainer!: ElementRef;
  @ViewChild('prev') prev!: ElementRef;
  @ViewChild('next') next!: ElementRef;
  @ViewChild('scrollele') scrollele!: ElementRef;
  timeoutfn: any;
  targetElements: any[] = [];
  tabElements: any[] = [];
  isShowSwiper: boolean = false;


  ngAfterViewInit(): void {
    this.onCheckContainerOverflow();
    this.targetElements.push(...this.container.nativeElement.children);
    this.tabElements.push(...this.tabContainer.nativeElement.children);

     // Sử dụng MutationObserver để theo dõi thay đổi trong #tabContainer
     const observer = new MutationObserver(mutationsList => {
      mutationsList.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // Gọi lại hàm handleOverFlowTabActive khi class của các thành phần con thay đổi
          this.handleOverFlowTabActive();
        }
      });
    });

    // Theo dõi các thay đổi trong #tabContainer và các thuộc tính attributes
    observer.observe(this.tabContainer.nativeElement, {
      attributes: true,  // Theo dõi các thay đổi trong attributes của các thành phần con
      subtree: true,      // Theo dõi các thay đổi trong toàn bộ cây con của #tabContainer
      attributeFilter: ['class']  // Theo dõi chỉ các thay đổi của thuộc tính class
    });

    console.log(this.tabElements);
    console.log(this.targetElements)
  }

  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const currentWidth = window.innerWidth;
    this.onCheckContainerOverflow()
  }
  protected onCheckContainerOverflow() {
    // debugger;
    var condition: boolean = this.tabContainer.nativeElement.scrollWidth - this.tabContainer.nativeElement.clientWidth > 0;
    if (condition) {
      this.prev.nativeElement.style.display = 'block';
      this.next.nativeElement.style.display = 'block';
    }
    else {
      this.prev.nativeElement.style.display = 'none';
      this.next.nativeElement.style.display = 'none';
    }
  }
  hold: boolean = false;
  protected selectd: any;

  override ngOnInit() {
    this.selectd = this.listTabs[0];
  }
  ClickTabs(item: any) {
    this.hold = true;
    this.selectd = item;
    clearTimeout(this.timeoutfn);

    const el = document.getElementById("target-" + item.id)
    //el?.scrollIntoView({behavior: 'smooth',block:"start" });
    // You can adjust this offset value as needed
    const targetTop = el?.offsetTop ?? 0 - this.container.nativeElement.offsetTop;
    console.log('targetTop', targetTop);
    this.container.nativeElement.scrollTo({
      top: targetTop - 150,
      behavior: 'smooth'
    });
    this.container.nativeElement.height += 100;
    //el?.scrollTo({top: 500,behavior: "smooth"});
    console.log('container', this.container.nativeElement.scrollTop);
    console.log('el', el?.offsetTop);
    this.timeoutfn = setTimeout(() => {
      this.hold = false;
    }, 1000);
  }

  // handleOverFlowTabActive(event: any) {
  //   console.log("scroll nè")
  //   if (this.hold) return;
  //   console.log(event.target.scrollTop);
  //   var index: number = 1;
  //   this.targetElements.forEach((x, i) => {
  //     let top = event.target.scrollTop;
  //     let offset = x.offsetTop;
  //     let height = (window.innerHeight / 2) - 250;
  //     top = top + height
  //     if (top == height) {
  //       this.selectd = this.listTabs[0]
  //       index = 0;
  //     }
  //     else if (top >= offset) {
  //       this.selectd = this.listTabs[i]
  //       index = i;
  //     }
  //     else if ((event.target.scrollTop + event.target.offsetHeight) >= event.target.scrollHeight) {

  //       this.selectd = this.listTabs[this.listTabs.length - 1]
  //       index = this.listTabs.length - 1;
  //     }
  //   }
  //   )
  //   if (index != -1) {
  //     let elementActive = this.tabElements[index];
  //     var parent = this.tabContainer.nativeElement;
  //     var elementRect = elementActive.getBoundingClientRect();
  //     var parentRect = parent.getBoundingClientRect();

  //     var isOverflowingHorizontally = (elementRect.right > parentRect.right);
  //     if (isOverflowingHorizontally) {
  //       parent.scrollLeft += 150;
  //     }
  //     else if (elementRect.left < parentRect.left) {
  //       parent.scrollLeft -= 150;
  //     }

  //   }
  // }

  // handleOverFlowTabActive() {
  //   console.log("Handling overflow for active tab...");
  //   let index = -1;
  //   const containerScrollTop = this.container.nativeElement.scrollTop;
  //   const containerHeight = this.container.nativeElement.offsetHeight;
  //   const windowHeight = window.innerHeight;
  //   const height = (windowHeight / 2) - 250;

  //   console.log(containerScrollTop, containerHeight, windowHeight, height)
  
  //   this.targetElements.forEach((element, i) => {
  //     const elementOffsetTop = element.offsetTop;
  
  //     // Tính toán vị trí top của tab trong container
  //     const tabTopInView = containerScrollTop + height;
  
  //     if (tabTopInView === height) {
  //       this.selectd = this.listTabs[0];
  //       index = 3;
  //     } else if (tabTopInView >= elementOffsetTop) {
  //       this.selectd = this.listTabs[i];
  //       index = i;
  //     } else if ((containerScrollTop + containerHeight) >= this.container.nativeElement.scrollHeight) {
  //       this.selectd = this.listTabs[this.listTabs.length - 1];
  //       index = this.listTabs.length - 1;
  //     }
  //   });
  
  //   console.log("Selected index:", index);
  
  //   if (index !== -1) {
  //     const elementActive = this.tabElements[index];
  //     const parent = this.tabContainer.nativeElement;
  //     const elementRect = elementActive.getBoundingClientRect();
  //     const parentRect = parent.getBoundingClientRect();
  
  //     const isOverflowingHorizontally = (elementRect.right > parentRect.right);
  
  //     if (isOverflowingHorizontally) {
  //       parent.scrollLeft += 150;
  //     } else if (elementRect.left < parentRect.left) {
  //       parent.scrollLeft -= 150;
  //     }
  //   }
  // }
  
  handleOverFlowTabActive() {
    console.log("Handling overflow for active tab...");
    let index = -1;
    const containerScrollLeft = this.tabContainer.nativeElement.scrollLeft;
    const containerWidth = this.tabContainer.nativeElement.offsetWidth;
    
    // Tìm phần tử có class 'active' trong danh sách tabElements
    const activeElement = this.tabContainer.nativeElement.querySelector('.tab-container-item.active');
  
    if (activeElement) {
      const activeElementRect = activeElement.getBoundingClientRect();
  
      // Tính toán các biên của phần tử 'active' so với container
      const elementLeft = activeElementRect.left;
      const elementRight = activeElementRect.right;
  
      // Kiểm tra xem phần tử 'active' có bị tràn ra ngoài phía trái hoặc phải của container không
      if (elementLeft < 0 || elementRight > containerWidth) {
        // Tìm index của phần tử 'active' trong danh sách tabElements
        index = this.tabElements.findIndex(element => element === activeElement);
      }
    }
  
    if (index !== -1) {
      const elementActive = this.tabElements[index];
      const parent = this.tabContainer.nativeElement;
      const elementRect = elementActive.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
  
      const isOverflowingRight = (elementRect.right > parentRect.right);
  
      if (isOverflowingRight) {
        parent.scrollLeft += (elementRect.right - parentRect.right + 10); 
      } else if (elementRect.left < parentRect.left) {
        parent.scrollLeft -= (parentRect.left - elementRect.left + 10); 
      }
    }
  }

  smoothScrollTo(parent: HTMLElement, scrollAmount: number): void {
    const startTime = performance.now();
    const duration = 220; // Thời gian animation
  
    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
  
      parent.scrollLeft = this.easeInOut(elapsedTime, parent.scrollLeft, scrollAmount, duration);
  
      if (elapsedTime < duration) {
        requestAnimationFrame(animateScroll);
      }
    };
  
    requestAnimationFrame(animateScroll);
  }
  
  easeInOut(t: number, b: number, c: number, d: number): number {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
  
  
  navChange(evt: any, index: number = -1, functionID: number = -1, btnClick: any) {
    console.log(evt)
    let containerList = document.querySelectorAll('.pw-content');
    let lastDivList = document.querySelectorAll('.div_final');
    console.log(containerList)
    let lastDiv = lastDivList[index];
    let container = containerList[index];
    console.log('container', container)
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
      (lastDiv as any).style.height = `${containerHeight - distanceToBottom + 50
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