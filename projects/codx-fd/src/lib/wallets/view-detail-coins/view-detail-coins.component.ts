import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
  Injector,
} from '@angular/core';
import { LayoutService } from '@shared/services/layout.service';
import { Location } from '@angular/common';
import { take } from 'rxjs/operators';
import {
  AuthStore,
  CodxGridviewComponent,
  UIComponent,
  UserModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { ModelPage } from 'projects/codx-ep/src/public-api';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-detail-coins',
  templateUrl: './view-detail-coins.component.html',
  styleUrls: ['./view-detail-coins.component.scss'],
})
export class ViewDetailCoinsComponent extends UIComponent implements OnInit {
  @Input() functionObject;
  @ViewChild('itemSenderOrReceiver', { static: true })
  itemSenderOrReceiver: TemplateRef<any>;
  @ViewChild('coins', { static: true }) coins: TemplateRef<any>;
  @ViewChild('createdOn', { static: true }) createdOn: TemplateRef<any>;
  @ViewChild('itemReference', { static: true }) itemReference: TemplateRef<any>;
  @ViewChild('itemCategory', { static: true }) itemCategory: TemplateRef<any>;
  @ViewChild('itemContent', { static: true }) itemContent: TemplateRef<any>;
  @ViewChild('gridView', { static: true }) gridView: CodxGridviewComponent;
  @ViewChild('iTemplateLeft') iTemplateLeft: TemplateRef<any>;
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;

  myModel = {
    template: null,
  };
  predicate =
    'UserID=@0 AND ( TransType = "1" OR TransType = "2" OR TransType = "4" OR TransType = "5" OR TransType = "6")';
  dataValue = '';
  user: UserModel;
  USER_ID = '';
  columnsGrid = [];
  favoriteID = '';
  funcID = '';
  views: Array<ViewModel> = [];
  userPermission: any;
  headerStyle = {
    textAlign: 'center',
    backgroundColor: '#F1F2F3',
    fontWeight: 'bold',
    border: 'none',
  };
  columnStyle = {
    border: 'none',
    fontSize: '13px !important',
    fontWeight: 400,
    lineHeight: 1.4,
  };

  constructor(
    private injector: Injector,
    private changedr: ChangeDetectorRef,
    private layoutService: LayoutService,
    private location: Location,
    private route: ActivatedRoute
  ) {
    super(injector);
    this.route.params.subscribe((params) => {
      this.funcID = params['funcID'];
    });
  }

  onInit(): void {
    this.getQueryParams();
    this.columnsGrid = [
      {
        field: 'noName',
        headerText: 'Phân loại',
        template: this.itemCategory,
        width: 200,
      },
      {
        field: 'competenceID',
        headerText: 'Người nhận/gửi',
        template: this.itemSenderOrReceiver,
        width: 200,
      },
      { field: 'content', headerText: 'Nội dung', template: this.itemContent },
      {
        field: 'memo',
        headerText: 'Tham chiếu',
        template: this.itemReference,
        width: 250,
      },
      {
        field: 'createName',
        headerText: 'Ngày tạo',
        template: this.createdOn,
        width: 100,
      },
      {
        field: 'createdOnFormat',
        headerText: 'Xu',
        template: this.coins,
        width: 100,
      },
    ];
    this.layoutService.isSetValueFavorite.pipe(take(2)).subscribe((value) => {
      if (value) {
        this.favoriteID = value;
        this.changedr.detectChanges();
      }
    });
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.templateLeft,
        },
      },
    ];
    // this.userPermission = this.view.userPermission;
    this.changedr.detectChanges();
  }

  getQueryParams() {
    this.route.queryParams.subscribe((params) => {
      if (params) {
        this.dataValue = params.userID;
      }
    });
  }

  backLocation() {
    this.location.back();
  }
}
