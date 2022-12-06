import {
  AfterViewInit,
  Component,
  EventEmitter,
  Injector,
  Input,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  AuthService,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxOmService } from '../../codx-om.service';


@Component({
  selector: 'popup-distribute-kr',
  templateUrl: 'popup-distribute-kr.component.html',
  styleUrls: ['popup-distribute-kr.component.scss'],
})
export class PopupDistributeKRComponent extends UIComponent implements AfterViewInit {
  
  views: Array<ViewModel> | any = [];
  @ViewChild('alignKR') alignKR: TemplateRef<any>;

  dialogRef: DialogRef;
  formModel: FormModel;
  headerText: string;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.headerText= "Phân bổ KR"//dialogData?.data[2];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef?.formModel;    
    
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelRightRef: this.alignKR,
          contextMenu: '',
        },
      },
    ];
  }

  onInit(): void {
    
  }
  click(event: any) {
    switch (event) {
      
    }
  }


}
