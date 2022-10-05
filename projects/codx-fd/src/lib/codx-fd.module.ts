import { AddBehaviorRuleComponent } from './setting/category/behavior-rule/add-behavior-rule/add-behavior-rule.component';
import { AddProposedFieldComponent } from './setting/category/proposed-field/add-proposed-field/add-proposed-field.component';
import { AddGiftGroupComponent } from './setting/category/gift-group/add-gift-group/add-gift-group.component';
import { LayoutNoAsideComponent } from './../../../codx-share/src/lib/_layout/_noAside/_noAside.component';
import { BehaviorComponent } from './setting/category/behavior/behavior.component';
import { GiftsComponent } from './setting/category/gifts/gifts.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule,
  Type,
} from '@angular/core';
import { CoreModule } from '@core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  AccumulationChartModule,
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import {
  ProgressBar,
  ProgressBarModule,
} from '@syncfusion/ej2-angular-progressbar';
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
import { LayoutOnlyHeaderComponent } from 'projects/codx-share/src/lib/_layout/_onlyHeader/_onlyHeader.component';
import { FeedbackMessageComponent } from './setting/feedback-message/feedback-message.component';
import { PatternComponent } from './setting/feedback-message/pattern/pattern.component';
import { EditPatternComponent } from './setting/feedback-message/pattern/edit-pattern/edit-pattern.component';
import { PolicyCardComponent } from './setting/feedback-message/policy-card/policy-card.component';
import { PolicyCoinComponent } from './setting/feedback-message/policy-coin/policy-coin.component';
import { PolicyDedicationComponent } from './setting/feedback-message/policy-dedication/policy-dedication.component';
import { DetailPolicyComponent } from './setting/feedback-message/detail-policy/detail-policy.component';
import { AddGiftsComponent } from './setting/category/gifts/add-gifts/add-gifts.component';
import { AddWarehouseComponent } from './setting/category/gifts/add-warehouse/add-warehouse.component';
import { AddBehaviorComponent } from './setting/category/behavior/add-behavior/add-behavior.component';
import { DedicationRankComponent } from './setting/dedication-rank/dedication-rank.component';
import { GiftGroupComponent } from './setting/category/gift-group/gift-group.component';
import { BehaviorRuleComponent } from './setting/category/behavior-rule/behavior-rule.component';
import { ProposedFieldComponent } from './setting/category/proposed-field/proposed-field.component';
import { WalletComponent } from './setting/wallet/wallet.component';

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
  {
    path: '',
    component: LayoutOnlyHeaderComponent,
    children: [
      {
        path: 'settings/:funcID',
        component: SettingComponent,
      },
      {
        path: 'setting/cards/:funcID',
        component: FeedbackMessageComponent,
      },
      {
        path: 'detailpolicy',
        component: DetailPolicyComponent,
      },
      {
        path: 'setting/fedranges/:funcID',
        component: DedicationRankComponent,
      },
    ],
  },
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'setting/gifts/:funcID',
        component: GiftsComponent,
      },
      {
        path: 'setting/giftgroups/:funcID',
        component: GiftGroupComponent,
      },
      {
        path: 'setting/behaviorgroups/:funcID',
        component: BehaviorRuleComponent,
      },
      {
        path: 'setting/behaviors/:funcID',
        component: BehaviorComponent,
      },
      {
        path: 'setting/industries/:funcID',
        component: ProposedFieldComponent,
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
  DedicationRankComponent,
  ProposedFieldComponent,
  GiftsComponent,
  GiftGroupComponent,
  BehaviorRuleComponent,
  BehaviorComponent,
  PopupAddGiftComponent,
  FeedbackMessageComponent,
  PatternComponent,
  EditPatternComponent,
  PolicyCardComponent,
  PolicyCoinComponent,
  PolicyDedicationComponent,
  DetailPolicyComponent,
  AddGiftsComponent,
  AddWarehouseComponent,
  AddGiftGroupComponent,
  AddProposedFieldComponent,
  AddBehaviorRuleComponent,
  AddBehaviorComponent,
  WalletComponent,
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
  exports: [RouterModule],
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
