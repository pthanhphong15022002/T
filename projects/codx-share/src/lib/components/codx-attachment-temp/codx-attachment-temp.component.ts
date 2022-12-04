import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApiHttpService,
  AuthService,
  CallFuncService,
  DialogModel,
  FormModel,
} from 'codx-core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'codx-attachment-temp',
  templateUrl: './codx-attachment-temp.component.html',
  styleUrls: ['./codx-attachment-temp.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxAttachmentTempComponent implements OnInit {
  @Input() objectID: string = '';
  @Input() formModel: FormModel = null;
  @Input() viewType = '0';
  @Input() count = 0;
  @Input() zIndex: number = 0; // Thảo truyền z index

  services: string = 'DM';
  assamplyName: string = 'ERM.Business.DM';
  className: string = 'FileBussiness';
  lstFile: any[] = [];
  countData: number = 0;
  user: any = null;
  REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  @ViewChild('tmpListItem') tmpListItem: TemplateRef<any>;
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callFC: CallFuncService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.userValue;
    this.getDataAsync(this.objectID);
  }

  getDataAsync(pObjectID: string) {
    if (pObjectID) {
      this.api
        .execSv(
          this.services,
          this.assamplyName,
          this.className,
          'GetFilesByIbjectIDAsync',
          [pObjectID]
        )
        .subscribe((res: any) => {
          if (res.length > 0) {
            let files = res;
            files.map((e: any) => {
              if (e && e.referType == this.REFERTYPE.VIDEO) {
                e[
                  'srcVideo'
                ] = `${environment.apiUrl}/api/dm/filevideo/${e.recID}?access_token=${this.user.token}`;
              }
            });
            this.lstFile = res;
            this.countData = res.length;
          }
        });
    }
  }
  openPopup() {
    if (this.tmpListItem) {
      let option = new DialogModel();
      if (this.zIndex > 0) option.zIndex = this.zIndex;
      let popup = this.callFC.openForm(
        this.tmpListItem,
        '',
        400,
        500,
        '',
        null,
        '',
        option
      );
      popup.closed.subscribe((res: any) => {
        if (res) {
          this.getDataAsync(this.objectID);
        }
      });
    }
  }
}
