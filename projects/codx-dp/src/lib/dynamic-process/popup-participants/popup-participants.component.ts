import { CodxDpService } from './../../codx-dp.service';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';

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
  @Input() owner = '';
  title = 'Chọn đối tượng';
  checkRight = false;
  checkUser = false;
  currentLeft = 0;
  currentRight = 0;

  isLoading = true;
  lstOrg = [];
  fields: Object = { text: 'userName', value: 'userID' };
  query: Query = new Query().select(['userName', 'userID']);
  isDisable = false;
  id: any;
  constructor(private dpSv: CodxDpService) {}

  ngOnInit(): void {
    // if (this.lstParticipants != null && this.lstParticipants.length > 0)
    //   this.valueChangeLeft(0, this.lstParticipants[this.currentLeft]);
  }

  async ngAfterViewInit() {
    this.getListUserByOrg(this.lstParticipants);

    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
  }
  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    // console.log(changes);
    // if(changes['owner'] != null){
    //   if(changes['owner'] == this.id) return;
    //   this.id = changes['owner'].currentValue;
    // }
  }
  onSave() {
    this.dialog.close();
  }

  searchName(e) {}

  // valueChangeLeft(index, data) {
  //   this.isLoading = true;
  //   this.lstOrg = [];
  //   this.data = { id: '', name: '', type: '' };
  //   switch (data.objectType) {
  //     case 'O':
  //     case 'D':
  //     case 'P':
  //       this.dpSv
  //         .GetListUserIDByListTmpEmpIDAsync([data.objectID, data.objectType])
  //         .subscribe((res) => {
  //           this.isLoading = false;
  //           if (res && res.length > 0) {
  //             this.isDisable = false;
  //             this.lstOrg = res;
  //             if (this.lstOrg.length > 0) {
  //               this.valueChangeRight(0, this.lstOrg[this.currentRight]);
  //             }
  //           } else {
  //             if (this.isType == 'S') {
  //               this.isDisable = false;
  //               let lst = {};
  //               lst['userID'] = this.lstParticipants[this.currentLeft].objectID;
  //               lst['userName'] =
  //                 this.lstParticipants[this.currentLeft].objectName;
  //               var check = this.lstOrg.some((x) => x.userID == lst['userID']);
  //               if (check == false) {
  //                 this.lstOrg.push(lst);
  //               }
  //               this.data.id = this.lstParticipants[this.currentLeft].objectID;
  //               this.data.name =
  //                 this.lstParticipants[this.currentLeft].objectName;
  //               this.data.type =
  //                 this.lstParticipants[this.currentLeft].objectType;
  //             } else {
  //               if (this.lstOrg.length == 0) {
  //                 this.isDisable = true;
  //                 this.data = { id: '', name: '', type: '' };
  //                 this.lstOrg = [];
  //               } else {
  //                 this.isDisable = false;
  //               }
  //             }
  //           }
  //         });
  //       break;
  //     case 'R':
  //       this.dpSv.getListUserByRoleID(data.objectID).subscribe((res) => {
  //         this.isLoading = false;
  //         if (res && res.length > 0) {
  //           this.lstOrg = res;
  //           this.isDisable = false;
  //           if (this.lstOrg.length > 0) {
  //             this.valueChangeRight(0, this.lstOrg[this.currentRight]);
  //           }
  //         } else {
  //           if (this.isType == 'S') {
  //             let lst = {};
  //             lst['userID'] = this.lstParticipants[this.currentLeft].objectID;
  //             lst['userName'] =
  //               this.lstParticipants[this.currentLeft].objectName;
  //             var check = this.lstOrg.some((x) => x.userID == lst['userID']);
  //             if (check == false) {
  //               this.lstOrg.push(lst);
  //             }
  //             this.data.id = this.lstParticipants[this.currentLeft].objectID;
  //             this.data.name =
  //               this.lstParticipants[this.currentLeft].objectName;
  //             this.data.type =
  //               this.lstParticipants[this.currentLeft].objectType;
  //           } else {
  //             if (this.lstOrg.length == 0) {
  //               this.isDisable = true;
  //               this.data = { id: '', name: '', type: '' };
  //               this.lstOrg = [];
  //             } else {
  //               this.isDisable = false;
  //             }
  //           }
  //         }
  //       });
  //       break;
  //     case 'U':
  //       this.isLoading = false;
  //       this.isDisable = false;
  //       let lst = {};
  //       lst['userID'] = data.objectID;
  //       lst['userName'] = data.objectName;
  //       var check = this.lstOrg.some((x) => x.userID == lst['userID']);
  //       if (check == false) {
  //         this.lstOrg.push(lst);
  //       }
  //       if (this.lstOrg.length > 0) {
  //         this.valueChangeRight(0, this.lstOrg[this.currentRight]);
  //       }
  //       this.data.id = data.objectID;
  //       this.data.name = data.objectName;
  //       this.data.type = data.objectType;
  //       break;
  //   }

  //   this.currentLeft = index;
  //   this.currentRight = 0;
  // }

  async getListUserByOrg(list = []) {
    if (list != null && list.length > 0) {
      var userOrgID = list
        .filter((x) => x.objectType == 'O')
        .map((x) => x.objectID);
      if (userOrgID != null && userOrgID.length > 0) {
        this.dpSv
          .getListUserByListOrgUnitIDAsync(userOrgID, 'O')
          .subscribe((res) => {
            if (res != null && res.length > 0) {
              if (this.lstOrg != null && this.lstOrg.length > 0) {
                this.lstOrg = this.getUserArray(this.lstOrg, res);
              } else {
                this.lstOrg = res;
              }
            }
          });
      }
      var userDepartmentID = list
        .filter((x) => x.objectType == 'D')
        .map((x) => x.objectID);

      if (userDepartmentID != null && userDepartmentID.length > 0) {
        this.dpSv
          .getListUserByListOrgUnitIDAsync(userDepartmentID, 'D')
          .subscribe((res) => {
            if (res != null && res.length > 0) {
              if (this.lstOrg != null && this.lstOrg.length > 0) {
                this.lstOrg = this.getUserArray(this.lstOrg, res);
              } else {
                this.lstOrg = res;
              }
            }
          });
      }
      var userPositionID = list
        .filter((x) => x.objectType == 'P')
        .map((x) => x.objectID);
      if (userPositionID != null && userPositionID.length > 0) {
        this.dpSv
          .getListUserByListOrgUnitIDAsync(userPositionID, 'P')
          .subscribe((res) => {
            if (res != null && res.length > 0) {
              if (this.lstOrg != null && this.lstOrg.length > 0) {
                this.lstOrg = this.getUserArray(this.lstOrg, res);
              } else {
                this.lstOrg = res;
              }
            }
          });
      }

      var userRoleID = list
        .filter((x) => x.objectType == 'R')
        .map((x) => x.objectID);
      if (userRoleID != null && userRoleID.length > 0) {
        this.dpSv.getListUserByRoleID(userRoleID).subscribe((res) => {
          if (res != null && res.length > 0) {
            if (this.lstOrg != null && this.lstOrg.length > 0) {
              this.lstOrg = this.getUserArray(this.lstOrg, res);
            } else {
              this.lstOrg = res;
            }
          }
        });
      }
      var lstUser = list.filter((x) => x.objectType == 'U' || x.objectType == '1');
      if (lstUser != null && lstUser.length > 0) {
        var tmpList = [];
        lstUser.forEach((element) => {
          var tmp = {};
          if (element != null) {
            tmp['userID'] = element.objectID;
            tmp['userName'] = element.objectName;
            tmpList.push(tmp);
          }
        });
        if (tmpList != null && tmpList.length > 0) {
          this.lstOrg = this.getUserArray(this.lstOrg, tmpList);
        }
      }
    }
  }

  onFiltering: EmitType<any> = (e: FilteringEventArgs) => {
    // load overall data when search key empty.
    if (e.text.trim() === '') {
      e.updateData(this.lstOrg);
      return;
    } else {
      // set limit as 4 to search result
      let query: Query = new Query().select(['userName', 'userID']);
      query =
        e.text !== ''
          ? query.where('userName', 'contains', e.text, true)
          : query;
      e.updateData(this.lstOrg, query);
    }
  };

  cbxChange(e) {
    this.eventUser.emit({ id: e });
  }

  getUserArray(arr1, arr2) {
    const arr3 = arr1.concat(arr2).reduce((acc, current) => {
      const duplicateIndex = acc.findIndex((el) => el.userID === current.userID);
      if (duplicateIndex === -1) {
        acc.push(current);
      } else {
        acc[duplicateIndex] = current;
      }
      return acc;
    }, []);
    return arr3;
  }
}
