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
  @Output() tab = new EventEmitter(); // giá trị trả về khi chọn => name

  sizeIcon = '';
  sizeText = '';
  listTaskConvert = [];
  tabOld;
  constructor() {
    
  }
  ngOnInit(): void {
    this.size = this.size%2 == 0 ? this.size : this.size + 1;
    this.sizeIcon = this.size.toString();
    this.sizeText = (this.size - 8).toString() + 'px';
    this.tab.emit(this.listTaskConvert[0].name);  
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.listTab){
      this.listTaskConvert = this.listTab.map((item) => {
        return {...item, isActive: false}
      })
      this.listTaskConvert[0].isActive = true;
      this.tabOld = this.listTaskConvert[0];
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
}
