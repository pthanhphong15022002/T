import { BehaviorComponent } from './setting/category/behavior/behavior.component';
import { BehaviorruleComponent } from './setting/category/behaviorrule/behaviorrule.component';
import { GiftgroupComponent } from './setting/category/giftgroup/giftgroup.component';
import { GiftsComponent } from './setting/category/gifts/gifts.component';
import { ProposedfieldComponent } from './setting/category/proposedfield/proposedfield.component';
import { CategoryComponent } from './setting/category/category.component';
import { DedicationrankComponent } from './setting/dedicationrank/dedicationrank.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { CoreModule } from '@core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AccumulationChartModule, ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { ProgressBar, ProgressBarModule } from '@syncfusion/ej2-angular-progressbar';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { InlineSVGModule } from 'ng-inline-svg';
import path from 'path';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxWpModule } from 'projects/codx-wp/src/public-api';
import { AchievementComponent } from './achievement/achievement.component';
import { CardsComponent } from './cards/cards.component';
import { PopupAddCardsComponent } from './cards/popup-add-cards/popup-add-cards.component';
import { ViewDetailCardsComponent } from './cards/view-detail-cards/view-detail-cards.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GiftTransComponent } from './gift-trans/gift-trans.component';
import { PopupAddGiftComponent } from './gift-trans/popup-add-gift/popup-add-gift.component';
import { ViewDetailGiftComponent } from './gift-trans/view-detail-gift/view-detail-gift.component';
import { SettingComponent } from './setting/setting.component';
import { StatisticalComponent } from './statistical/statistical.component';
import { ViewDetailCoinsComponent } from './wallets/view-detail-coins/view-detail-coins.component';
import { WalletsComponent } from './wallets/wallets.component';
import { LayoutComponent } from './_layout/layout.component';
import { LayoutNotoolbar } from './_layoutNoToolbar/layoutNotoolbar.component';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home/:funcID',
        component: DashboardComponent,
      },
      {
        path: 'coins/:funcID',
        component: WalletsComponent,
      },
      {
        path: 'detailcoins/:funcID',
        component: ViewDetailCoinsComponent,
      },
      {
        path: 'statistical/:funcID',
        component: StatisticalComponent,
      },
      {
        path: 'achievement/:funcID',
        component: AchievementComponent,
      },
      {
        path: 'cards/:funcID',
        component: CardsComponent,
      },
      {
        path: 'gifttrans/:funcID',
        component: GiftTransComponent,
      },

    ],
  },
];

const Component: Type<any>[] = [
  LayoutComponent,
  LayoutNotoolbar,
  WalletsComponent,
  StatisticalComponent,
  AchievementComponent,
  ViewDetailCoinsComponent,
  DashboardComponent,
  CardsComponent,
  ViewDetailCardsComponent,
  ViewDetailGiftComponent,
  PopupAddCardsComponent,
  GiftTransComponent,
  SettingComponent,
  DedicationrankComponent,
  CategoryComponent,
  ProposedfieldComponent,
  GiftsComponent,
  GiftgroupComponent,
  BehaviorruleComponent,
  BehaviorComponent,
  PopupAddGiftComponent
];

@NgModule({
  imports: [ 
    CommonModule,
    OverlayModule,
    InlineSVGModule.forRoot(),
    HttpClientModule,
    CodxCoreModule,
    CodxShareModule,
    CodxWpModule,
    CoreModule,
    NgbModule,
    AccumulationChartModule,
    ChartAllModule,
    ProgressBarModule,
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ],
  declarations: Component,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxFdModule {
  public static forRoot(
    config?: EnvironmentConfig
  ): ModuleWithProviders<CodxCoreModule> {
    return {
      ngModule: CodxCoreModule,
      providers: [
        HttpClientModule,
        { provide: EnvironmentConfig, useValue: config },
      ],
    };
  }
}
