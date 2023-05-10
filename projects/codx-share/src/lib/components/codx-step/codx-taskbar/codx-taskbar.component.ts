import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'codx-taskbar',
  templateUrl: './codx-taskbar.component.html',
  styleUrls: ['./codx-taskbar.component.scss']
})
export class CodxTaskbarComponent implements OnInit {
  @Input() listTab = []; // danh sách tab {icon, name, textDefault}
  @Input() size = 20; // kích thước icon và chữ
  @Output() tab = new EventEmitter(); // giá trị trả về khi chọn => name

  sizeIcon = '';
  sizeText = '';
  listTaskConvert = [];
  tabOld;
  ngOnInit(): void {
    this.size = this.size%2 == 0 ? this.size : this.size + 1;
    this.sizeIcon = this.size.toString();
    this.sizeText = (this.size - 8).toString() + 'px';

    this.listTaskConvert = this.listTab.map((item) => {
      return {...item, isActive: false}
    })
    this.listTaskConvert[0].isActive = true;
    this.tabOld = this.listTaskConvert[0];
    this.tab.emit(this.listTaskConvert[0].name);
  }

  clickMenu(item) {
    if(item.name != this.tabOld?.name){
      item.isActive = true;
      this.tabOld.isActive = false;
      this.tabOld = item;
    }
    this.tab.emit(item.name);
  }
}
