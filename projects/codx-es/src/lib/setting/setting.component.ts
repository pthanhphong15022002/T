import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  AuthService,
  ButtonModel,
  CallFuncService,
  DialogRef,
  FormModel,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { CodxEsService } from '../codx-es.service';

export class defaultRecource {}
@Component({
  selector: 'setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent implements OnInit, AfterViewInit {
  constructor(
    private callfunc: CallFuncService,
    private cr: ChangeDetectorRef,
    private readonly auth: AuthService,
    private activedRouter: ActivatedRoute,
    private esService: CodxEsService
  ) {}
  ngOnInit(): void {}

  ngAfterViewInit(): void {}
}
