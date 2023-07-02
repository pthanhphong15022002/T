import { S } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, Input, OnInit, Optional, ViewEncapsulation } from '@angular/core';
import { CallFuncService, DialogData, DialogModel, DialogRef } from 'codx-core';
import { environment } from 'src/environments/environment';
import { PopupViewFileFullComponent } from './popup-view-file-full/popup-view-file-full.component';

@Component({
  selector: 'app-popup-view-file',
  templateUrl: './popup-view-file.component.html',
  styleUrls: ['./popup-view-file.component.scss'],
  encapsulation: ViewEncapsulation.None,
  
})
export class PopupViewFileComponent {
  dataFile: any;
  dialog:any
  scale = 1;
  panning = false;
  pointX = 0;
  pointY = 0;
  start = { x: 0, y: 0 };
  selectedIndex = 0;
  isZoom = false;
  constructor(
    private callfunc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.dataFile = dt?.data?.dataFile;
    this.selectedIndex = dt?.data?.selectedIndex;
  }

  getSrcImage(data) {
    if(data?.avatar) return data?.avatar
    return environment.urlUpload + "/" +data?.pathDisk;
  }
  
  clickZoom()
  {
    this.isZoom = !this.isZoom;
    if(!this.isZoom) this.removeZoom();
    this.zoom(this.selectedIndex);
  }

  zoom(index:any)
  {
    let that = this;
    var zoom = document.getElementById("zoom"+ index);
    zoom.onmousedown = function (e) {
      if(!that.isZoom) return;
      e.preventDefault();
      that.start = { x: e.clientX - that.pointX, y: e.clientY - that.pointY };
      that.panning = true;
    }
    zoom.onmouseup = function (e) {
      if(!that.isZoom) return;
      that.panning = false;
    }
    zoom.onmousemove = function (e) {
      if(!that.isZoom) return;
      e.preventDefault();
      if (!that.panning) {
        return;
      }
      that.pointX = (e.clientX - that.start.x);
      that.pointY = (e.clientY - that.start.y);
      zoom.style.transform = "translate(" + that.pointX + "px, " + that.pointY + "px) scale(" + that.scale + ")";
    }

    zoom.onwheel = function (e:any) {
      if(!that.isZoom) return;
      e.preventDefault();
      var xs = (e.clientX - that.pointX) / that.scale,
        ys = (e.clientY - that.pointY) / that.scale,
        delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
      (delta > 0) ? (that.scale *= 1.2) : (that.scale /= 1.2);
      that.pointX = e.clientX - xs * that.scale;
      that.pointY = e.clientY - ys * that.scale;

      zoom.style.transform = "translate(" + that.pointX + "px, " + that.pointY + "px) scale(" + that.scale + ")";
    }
  }
  slideChanging(e:any)
  {
    this.removeZoom();
    this.scale = 1;
    this.panning = false;
    this.pointX = 0;
    this.pointY = 0;
    this. start = { x: 0, y: 0 };
    this.zoom(e?.currentIndex);
  }

  removeZoom()
  {
    // Get the element by their class name
    var cur_columns = document.getElementsByClassName('zoom');

    // Now remove them

    for (var i = 0; i < cur_columns.length; i++) {
      (cur_columns[i] as HTMLElement).style.transform = "none";
    }
  }
  clickFullScreen()
  {
    let file = this.dataFile[this.selectedIndex];
    let option = new DialogModel();
    option.IsFull = true;
    this.callfunc.openForm(PopupViewFileFullComponent,"",null,null,"",{dataFile:file},"",option)
  }
  close()
  {
    this.dialog.close();
  }
}
