import { OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { AttachmentComponent } from '../attachment/attachment.component';
import { tmpReferences } from '../../models/assign-task.model';

@Component({
  selector: 'codx-references',
  templateUrl: './codx-references.component.html',
  styleUrls: ['./codx-references.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxReferencesComponent implements OnInit, OnChanges {
  @Input() funcID?: string; // khởi tạo để test,, sau có thể xóa
  // @Input() entityName?: string// khởi tạo để test,, sau có thể xóa
  @Input() dataReferences: any[];
  @Input() vllRefType = 'TM018';
  @Input() formModel?: FormModel;
  @Input() zIndex: number = 0;
  @Input() openViewPopup = true; // Thảo truyền ko cho click
  @ViewChild('attachment') attachment: AttachmentComponent;

  message: string = '';
  REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  lstFile: any[] = [];
  loaded: boolean;
  //dataAvtar: any;
  //chinh sua load bang ref
  // @Input() refID: any;
  // @Input() refType: any;
  // refIDCrr: any;
  // loaded = false;
   dataCrrChange :any

  constructor(
    private cache: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    this.loaded = false;
    if (changes['dataReferences']) {
      // if (changes['dataReferences'].currentValue === this.dataCrrChange) return;
      // this.dataCrrChange = changes['dataReferences'].currentValue;
      this.loaded = true;
      this.changeDetectorRef.detectChanges();
    }
   
    // if (changes['refID']) {
    //   if (changes['refID'].currentValue === this.refIDCrr) return;
    //   this.refIDCrr = changes['refID'].currentValue;
    //   this.loadDataReferences();
    //   return;
    // }
  }

  ngOnInit(): void {
    console.log('logggggg', this.dataReferences);
  }

  ngAfterViewInit(): void {}

  setStyles(color): any {
    let styles = {
      backgroundColor: color,
      color: 'white',
    };
    return styles;
  }

  //cai nay neu can thi sua theo cai nay
  // loadDataReferences() {
  //   this.loaded = false;
  //   if (!this.refID) {
  //     // this.loaded = true ;
  //     this.dataReferences = [];
  //     return;
  //   }

  //   var listUser = [];
  //   switch (this.refType) {
  //     case 'OD_Dispatches':
  //       this.api
  //         .exec<any>('OD', 'DispatchesBusiness', 'GetListByIDAsync', this.refID)
  //         .subscribe((item) => {
  //           if (item) {
  //             item.forEach((x) => {
  //               var ref = new tmpReferences();
  //               ref.recIDReferences = x.recID;
  //               ref.refType = 'OD_Dispatches';
  //               ref.createdOn = x.createdOn;
  //               ref.memo = x.title;
  //               ref.createdBy = x.createdBy;
  //               ref.attachments = x.attachments;
  //               ref.comments = x.comments;
  //               this.dataReferences.unshift(ref);
  //               if (listUser.findIndex((p) => p == ref.createdBy) == -1)
  //                 listUser.push(ref.createdBy);
  //               this.getUserByListCreateBy(listUser);
  //             });
  //           }
  //         });
  //       break;
  //     case 'ES_SignFiles':
  //       this.api
  //         .execSv<any>(
  //           'ES',
  //           'ERM.Business.ES',
  //           'SignFilesBusiness',
  //           'GetLstSignFileByIDAsync',
  //           JSON.stringify(this.refID.split(';'))
  //         )
  //         .subscribe((result) => {
  //           if (result) {
  //             result.forEach((x) => {
  //               var ref = new tmpReferences();
  //               ref.recIDReferences = x.recID;
  //               ref.refType = 'ES_SignFiles';
  //               ref.createdOn = x.createdOn;
  //               ref.memo = x.title;
  //               ref.createdBy = x.createdBy;
  //               ref.attachments = x.attachments;
  //               ref.comments = x.comments;
  //               this.dataReferences.unshift(ref);
  //               if (listUser.findIndex((p) => p == ref.createdBy) == -1)
  //                 listUser.push(ref.createdBy);
  //               this.getUserByListCreateBy(listUser);
  //             });
  //           }
  //         });
  //       break;
  //     case 'TM_Tasks':
  //       this.api
  //         .execSv<any>(
  //           'TM',
  //           'TM',
  //           'TaskBusiness',
  //           'GetTaskByRefIDAsync',
  //           this.refID
  //         )
  //         .subscribe((result) => {
  //           if (result) {
  //             var ref = new tmpReferences();
  //             ref.recIDReferences = result.recID;
  //             ref.refType = 'TM_Tasks';
  //             ref.createdOn = result.createdOn;
  //             ref.memo = result.taskName;
  //             ref.createdBy = result.createdBy;
  //             ref.attachments = result.attachments;
  //             ref.comments = result.comments;

  //             this.api
  //               .execSv<any>('SYS', 'AD', 'UsersBusiness', 'GetUserAsync', [
  //                 ref.createdBy,
  //               ])
  //               .subscribe((user) => {
  //                 if (user) {
  //                   ref.createByName = user.userName;
  //                   this.dataReferences.unshift(ref);
  //                   this.loaded = true;
  //                   this.changeDetectorRef.detectChanges();
  //                 }
  //               });
  //           }
  //         });
  //       break;
  //     case 'DP_Instances_Steps_Tasks':
  //       this.api
  //         .execSv<any>(
  //           'DP',
  //           'DP',
  //           'InstancesBusiness',
  //           'GetTempReferenceByRefIDAsync',
  //           this.refID
  //         )
  //         .subscribe((result) => {
  //           if (result && result?.length > 0) {
  //             this.dataReferences = result;
  //             this.loaded = true;
  //           }
  //         });
  //       break;
  //   }
  // }

  // getUserByListCreateBy(listUser) {
  //   this.api
  //     .execSv<any>(
  //       'SYS',
  //       'AD',
  //       'UsersBusiness',
  //       'LoadUserListByIDAsync',
  //       JSON.stringify(listUser)
  //     )
  //     .subscribe((users) => {
  //       if (users) {
  //         this.dataReferences.forEach((ref) => {
  //           var index = users.findIndex((user) => user.userID == ref.createdBy);
  //           if (index != -1) {
  //             ref.createByName = users[index].userName;
  //           }
  //         });
  //         this.loaded = true;
  //         this.changeDetectorRef.detectChanges();
  //       }
  //     });
  // }
}
