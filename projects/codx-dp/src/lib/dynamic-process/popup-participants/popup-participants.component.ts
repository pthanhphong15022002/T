import { CodxDpService } from './../../codx-dp.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'codx-popup-participants',
  templateUrl: './popup-participants.component.html',
  styleUrls: ['./popup-participants.component.scss'],
})
export class PopupParticipantsComponent implements OnInit {
  @Input() lstParticipants = [];
  @Input() dialog: any;
  @Output() eventUser = new EventEmitter();
  @Input() isType = '';
  title = 'Chọn đối tượng';
  checkRight = false;
  checkUser = false;
  currentLeft = 0;
  currentRight = 0;
  isLoading = true;
  lstOrg = [];
  data = {
    id: '',
    name: '',
    type: '',
  };
  isDisable = false;
  constructor(private dpSv: CodxDpService) {}

  ngOnInit(): void {
    if (this.lstParticipants != null && this.lstParticipants.length > 0)
      this.valueChangeLeft(0, this.lstParticipants[this.currentLeft]);
  }

  onSave() {
    this.eventUser.emit(this.data);
    this.dialog.close();
  }

  searchName(e) {}

  valueChangeLeft(index, data) {
    this.isLoading = true;
    this.lstOrg = [];
    this.data = { id: '', name: '', type: '' };
    switch (data.objectType) {
      case 'O':
      case 'D':
      case 'P':
        this.dpSv
          .GetListUserIDByListTmpEmpIDAsync([data.objectID, data.objectType])
          .subscribe((res) => {
            this.isLoading = false;
            if (res && res.length > 0) {
              this.lstOrg = res;
              if (this.lstOrg.length > 0) {
                this.valueChangeRight(0, this.lstOrg[this.currentRight]);
              }
            } else {
              if (this.isType == 'S') {
                this.isDisable = true;
                let lst = {};
                lst['userID'] = this.lstParticipants[this.currentLeft].objectID;
                lst['userName'] =
                  this.lstParticipants[this.currentLeft].objectName;
                var check = this.lstOrg.some((x) => x.userID == lst['userID']);
                if (check == false) {
                  this.lstOrg.push(lst);
                }
                this.data.id = this.lstParticipants[this.currentLeft].objectID;
                this.data.name =
                  this.lstParticipants[this.currentLeft].objectName;
                this.data.type =
                  this.lstParticipants[this.currentLeft].objectType;
              } else {
                if (this.lstOrg.length == 0) {
                  this.isDisable = true;
                  this.data = { id: '', name: '', type: '' };
                  this.lstOrg = [];
                } else {
                  this.isDisable = false;
                }
              }
            }
          });
        break;
      case 'R':
        this.dpSv.getListUserByRoleID(data.objectID).subscribe((res) => {
          this.isLoading = false;
          if (res && res.length > 0) {
            this.lstOrg = res;
            if (this.lstOrg.length > 0) {
              this.valueChangeRight(0, this.lstOrg[this.currentRight]);
            }
          } else {
            if (this.isType == 'S') {
              let lst = {};
              lst['userID'] = this.lstParticipants[this.currentLeft].objectID;
              lst['userName'] =
                this.lstParticipants[this.currentLeft].objectName;
              var check = this.lstOrg.some((x) => x.userID == lst['userID']);
              if (check == false) {
                this.lstOrg.push(lst);
              }
              this.data.id = this.lstParticipants[this.currentLeft].objectID;
              this.data.name =
                this.lstParticipants[this.currentLeft].objectName;
              this.data.type =
                this.lstParticipants[this.currentLeft].objectType;
            } else {
              if (this.lstOrg.length == 0) {
                this.isDisable = true;
                this.data = { id: '', name: '', type: '' };
                this.lstOrg = [];
              } else {
                this.isDisable = false;
              }
            }
          }
        });
        break;
      case 'U':
        this.isLoading = false;
        this.isDisable = false;
        let lst = {};
        lst['userID'] = data.objectID;
        lst['userName'] = data.objectName;
        var check = this.lstOrg.some((x) => x.userID == lst['userID']);
        if (check == false) {
          this.lstOrg.push(lst);
        }
        if (this.lstOrg.length > 0) {
          this.valueChangeRight(0, this.lstOrg[this.currentRight]);
        }
        this.data.id = data.objectID;
        this.data.name = data.objectName;
        this.data.type = data.objectType;
        break;
    }

    this.currentLeft = index;
    this.currentRight = 0;
  }

  valueChangeRight(index, data) {
    this.data.id = data.userID;
    this.data.name = data.userName;
    this.data.type = 'U';
    this.currentRight = index;
  }
}
