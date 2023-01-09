import { Component, OnInit, ViewChild } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'lib-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  constructor() { }
  isShow = true;
  data = [
    { 
      item: "Spacing utilities that apply",
      name:"Tính chất của một trận bán kết khiến HLV Park Hang-seo lẫn Shin Tae-yong đều phải thận trọng 1. ",
      data:[
        {
          item: "Item 112",
          data:{
            name:"Đây là điều khác hẳn so với những lần gặp nhau trước đây. ",
            item:"Item3"
          }
        },
        {
          item: "Spacing utilities that apply",
          data:{
            name:"Đây là điều khác hẳn so với những lần gặp nhau trước đây. ",
            item:"Item3"
          }
        },
        {
          item: "Item 117",
          data:{
            name:"Đây là điều khác hẳn so với những lần gặp nhau trước đây. ",
            item:"Item3"
          }
        },
      ]
    },
    { 
      item: "Item 2",
      name:"Tính chất của một trận bán kết khiến HLV Park Hang-seo lẫn Shin Tae-yong đều phải thận trọng 1. ",
      data:[
        {
          item: "Item 118",
          data:{
            name:"Đây là điều khác hẳn so với những lần gặp nhau trước đây. ",
            item:"Item3"
          }
        },
        {
          item: "Item 119",
          data:{
            name:"Đây là điều khác hẳn so với những lần gặp nhau trước đây. ",
            item:"Item3"
          }
        },
        {
          item: "Item 116",
          data:{
            name:"Đây là điều khác hẳn so với những lần gặp nhau trước đây. ",
            item:"Item3"
          }
        },
      ]
    },
    { 
      item: "Item 3",
      name:"Tính chất của một trận bán kết khiến HLV Park Hang-seo lẫn Shin Tae-yong đều phải thận trọng 1. ",
      data:[
        {
          item: "Item 1111",
          data:{
            name:"Đây là điều khác hẳn so với những lần gặp nhau trước đây. ",
            item:"Item3"
          }
        },
        {
          item: "Item 1131",
          data:{
            name:"Đây là điều khác hẳn so với những lần gặp nhau trước đây. ",
            item:"Item3"
          }
        },
        {
          item: "Item 11134",
          data:{
            name:"Đây là điều khác hẳn so với những lần gặp nhau trước đây. ",
            item:"Item3"
          }
        },
      ]
    },

  ]
  ngOnInit(): void {
  }
  show(){
    this.isShow = !this.isShow;
  }
  addFile(e) {
    this.attachment.uploadFile();
  }
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
  
  drop1(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.data, event.previousIndex, event.currentIndex);
  }

}
