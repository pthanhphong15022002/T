import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiHttpService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CodxMwpService } from '../../codx-mwp.service';

@Component({
  selector: 'lib-edit-hobby',
  templateUrl: './edit-hobby.component.html',
  styleUrls: ['./edit-hobby.component.css']
})
export class EditHobbyComponent implements OnInit {
  dialog: any;
  title = "Sở thích";
  hobbies: [];
  editItem = null;
  editItemCurren = null;
  employeeID = "";
  chooseHobbyItems = [];
  dataBind: any = {};

  constructor(
    private codxMwp: CodxMwpService,
    private api: ApiHttpService,
    private df: ChangeDetectorRef,
    private ngxService: NgxUiLoaderService,
    private modalService: NgbModal,
    private notificationsService: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.dialog = dialog;
  }
  ngOnInit(): void {
    this.codxMwp.hobbyChange.subscribe((data: any) => {
      if (data) {
        this.chooseHobbyItems = [];
        this.employeeID = data.employeeID;
        this.dataBind = {};
        this.api.exec('ERM.Business.BS', 'HobbiesBusiness', 'GetListAsync')
          .subscribe((o: any) => {
            if (!o) return;
            this.hobbies = o;
            if (data.list && o) {
              for (let index = 0; index < data.list.length; index++) {
                const element = data.list[index];
                for (let z = 0; z < o.length; z++) {
                  const h = o[z];
                  if (element.hobbyName == h.hobbyName) {
                    this.chooseHobbyItems.push(h);
                    break;
                  }
                }
              }
            }
            this.df.detectChanges();
          });
      }
    });
  }



  getContrastYIQ(item) {
    var hexcolor = (item.color || "#ffffff").replace("#", "");
    var r = parseInt(hexcolor.substr(0, 2), 16);
    var g = parseInt(hexcolor.substr(2, 2), 16);
    var b = parseInt(hexcolor.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
  }

  saveHobby() {
    if (this.editItem) {
      this.api.exec('ERM.Business.BS', 'HobbiesBusiness', 'UpdateAsync', this.editItem)
        .subscribe((o: any) => {
          if (this.editItem.hobbyID) {
            this.editItemCurren.hobbyName = this.editItem.hobbyName;
            this.editItemCurren.color = this.editItem.color;
          }
          else {
            (this.hobbies as any).push(o);
          }
          this.editItem = null;
          this.df.detectChanges();
        });
    }
    this.dialog.close(this.editItem);
  }
}
