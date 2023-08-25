import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'codx-taskbar',
  templateUrl: './codx-taskbar.component.html',
  styleUrls: ['./codx-taskbar.component.scss']
})
export class CodxTaskbarComponent implements OnInit,OnChanges {
  @Input() listTab = []; // danh sách tab {icon, name, textDefault}
  @Input() size = 20; // kích thước icon và chữ
  @Input() color = '';
  @Input() class = '';
  @Input() change: any;
  @Input() isStart: any;
  @Output() isShowFull = new EventEmitter();
  @Output() tab = new EventEmitter(); // giá trị trả về khi chọn => name

  sizeIcon = '';
  sizeText = '';
  listTaskConvert = [];
  tabOld;
  isShow = false;
  constructor() {

  }
  ngOnInit(): void {
    this.size = this.size%2 == 0 ? this.size : this.size + 1;
    this.sizeIcon = this.size.toString();
    this.sizeText = (this.size - 8).toString() + 'px';
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.listTab ){
      this.listTaskConvert = this.listTab.map((item) => {
        return {...item, isActive: false}
      })
      this.listTaskConvert[0].isActive = true;
      this.tabOld = this.listTaskConvert[0];
      this.tab.emit(this.listTaskConvert[0].name); 
    }

    if(changes.change){
      if(this.isStart){
        this.listTaskConvert = this.listTab.map((item) => {
          return {...item, isActive: false}
        })
        this.listTaskConvert[0].isActive = true;
        this.tabOld = this.listTaskConvert[0];
        this.tab.emit(this.listTaskConvert[0].name);
      }else{
        if(this.tabOld){
          this.tab.emit(this.tabOld.name);
        }else{
          this.listTaskConvert = this.listTab.map((item) => {
            return {...item, isActive: false}
          })
          this.listTaskConvert[0].isActive = true;
          this.tabOld = this.listTaskConvert[0];
          this.tab.emit(this.listTaskConvert[0].name);
        }
      }
    }
  }
  clickMenu(item) {
    if(item.name != this.tabOld?.name){
      item.isActive = true;
      this.tabOld.isActive = false;
      this.tabOld = item;
      this.tab.emit(item.name);
    }
  }
  clickShowTab(isShow){
    this.isShowFull.emit(isShow);
    // this.changeDetectorRef.detectChanges();
  }
}
