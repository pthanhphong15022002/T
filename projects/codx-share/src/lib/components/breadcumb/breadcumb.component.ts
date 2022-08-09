import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
      if (res != null) {
        this.breadcumbTree = res;
        this.tree = true;
        this.changeDetectorRef.detectChanges();
      }
    })

    this.dmSV.isBreadcum.subscribe(res => {
      if (res != null) {
        this.breadcumb = res;
        this.breadcumbTree = res;
        this.linkList = this.dmSV.breadcumbLink;
        this.changeDetectorRef.detectChanges();
      }
    })
  }

  hover(ctrl) {
    ctrl.click();
    // console.log(ctrl);
  }

  getBreadCumList() {
    if (!this.notTree)
      return this.breadcumbTree;
    else
      return this.breadcumb;
  }

  onJump(id) {
    this.dmSV.isTree = false;
    // alert(this.linkList[id]);
    this.dmSV.parentFolderId = this.linkList[id];
    this.dmSV.currentNode = '';
    this.dmSV.folderId.next(this.linkList[id]);
    //isFolderId
    this.changeDetectorRef.detectChanges();
  }
}