import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { AttachmentService } from '../attachment/attachment.service';

declare var $: any;
@Component({
  selector: 'codx-breadcumb',
  templateUrl: './breadcumb.component.html'
})

export class BreadcumbComponent implements OnInit {
  @Input() start: number;
  @Input() max: number;
  @Input() end: number;
  @Input() link: boolean;
  @Input() root: boolean;
  @Input() notTree = false;
  // breadcumb: string[];
  breadcumb: string[];
  breadcumbTree: string[];
  linkList: string[];
  tree = false;
  @Output() eventShow = new EventEmitter<boolean>();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    public dmSV: CodxDMService,
  ) {
    //this.dmSV.folderId.next(id);
  }

  ngOnInit(): void {
    this.dmSV.isBreadcumTree.subscribe(res => {
      if (res) {
        this.breadcumbTree = res;
        this.tree = true;
      }
    })

    this.dmSV.isBreadcum.subscribe(res => {
      if (res) {
        this.breadcumb = res;
        this.breadcumbTree = res;
        this.linkList = this.dmSV.breadcumbLink;
        this.changeDetectorRef.detectChanges();
      
      }
    })
    this.dmSV.isChangeBreadCumb.subscribe((item) => {
      if (item) {
        var index = this.linkList.findIndex(x=>x == item.id);
        if(index >=0)
        {
          this.breadcumb[index] = item.name;
          this.changeDetectorRef.detectChanges();
        }
      }
    });
  }

  hover(ctrl) {
    ctrl.click();
    // console.log(ctrl);
  }

  getBreadCumList() {
    if (!this.notTree) return this.breadcumbTree;
    else return this.breadcumb;
  }

  onJump(index:any) {
    this.dmSV.isTree = false;
    this.dmSV.parentFolderId = this.linkList[index];
    this.dmSV.currentNode = '';
    this.dmSV.folderId.next(this.linkList[index]);
    this.breadcumb = this.breadcumb.slice(0,index+1)
    this.dmSV.breadcumb.next( this.breadcumb)
    var data = {} as any;
    data.recID = this.linkList[index];
    this.dmSV.nodeSelect.next(data);
  }
}