/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 AT&T Intellectual Property
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================LICENSE_END===================================
 */

 // Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChartsModule } from 'ng2-charts';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialDesignFrameworkModule } from 'angular6-json-schema-form';
import { NgModule } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { AngularDraggableModule } from 'angular2-draggable';
import { GaugeChartModule } from 'angular-gauge-chart';

// RD components
import { AddDashboardUserDialogComponent } from './user/add-dashboard-user-dialog/add-dashboard-user-dialog.component';
import { AppConfigurationComponent } from './app-configuration/app-configuration.component';
import { AppControlComponent } from './app-control/app-control.component';
import { CaasIngressComponent } from './caas-ingress/caas-ingress.component';
import { CatalogCardComponent } from './ui/catalog-card/catalog-card.component';
import { CatalogComponent } from './catalog/catalog.component';
import { ConfirmDialogComponent } from './ui/confirm-dialog/confirm-dialog.component';
import { ControlCardComponent } from './ui/control-card/control-card.component';
import { ControlComponent } from './control/control.component';
import { EditDashboardUserDialogComponent } from './user/edit-dashboard-user-dialog/edit-dashboard-user-dialog.component';
import { ErrorDialogComponent } from './ui/error-dialog/error-dialog.component';
import { FooterComponent } from './footer/footer.component';
import { InstanceSelectorDialogComponent } from './ui/instance-selector-dialog/instance-selector-dialog.component';
import { OnboardComponent } from './onboard/onboard.component';
import { LoadingDialogComponent } from './ui/loading-dialog/loading-dialog.component';
import { MainComponent } from './main/main.component';
import { PlatformComponent } from './platform/platform.component';
import { RanControlComponent } from './ran-control/ran-control.component';
import { RdRoutingModule } from './rd-routing.module';
import { RdComponent } from './rd.component';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { StatCardComponent } from './ui/stat-card/stat-card.component';
import { StatsComponent } from './stats/stats.component';
import { StatsDialogComponent } from './stats/stats-dialog.component';
import { UserComponent } from './user/user.component';

// RD services
import { AppMgrService } from './services/app-mgr/app-mgr.service';
import { DashboardService } from './services/dashboard/dashboard.service';
import { E2ManagerService } from './services/e2-mgr/e2-mgr.service';
import { ErrorDialogService } from './services/ui/error-dialog.service';
import { InstanceSelectorService } from './services/instance-selector/instance-selector.service';
import { InstanceSelectorDialogService } from './services/ui/instance-selector-dialog.service';
import { UiService } from './services/ui/ui.service';
import { XappOnboarderService } from './services/xapp-onboarder/xapp-onboarder.service';
import { DeployDialogComponent } from './ui/deploy-dialog/deploy-dialog.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { TrafficSteeringComponent } from './traffic-steering/traffic-steering.component';
import { LogAreaComponent } from './traffic-steering/log-area/log-area.component';
import { A1MediatorService } from './services/a1-mediator/a1-mediator.service';
import { MonitorComponent } from './monitor/monitor.component';
import { BouncerComponent } from './bouncer/bouncer.component'
import { PrometheusChartComponent } from './monitor/prometheus-chart/prometheus-chart.component';
import { FastHandoverComponent } from './fast-handover/fast-handover.component';
import { UeNameMappingComponent } from './fast-handover/ue-name-mapping/ue-name-mapping.component';
import { FieldSetupComponent } from './fast-handover/field-setup/field-setup.component';
import { GnbSetupComponent } from './fast-handover/gnb-setup/gnb-setup.component';
import { IntervalSetupComponent } from './fast-handover/interval-setup/interval-setup.component'
import { DoughnutChartComponent } from './fast-handover/doughnut-chart/doughnut-chart.component';
import { GaugeChartComponent } from './fast-handover/gauge-chart/gauge-chart.component';
import { OffsetSetupComponent } from './fast-handover/offset-setup/offset-setup.component';
import { StatisticsChartComponent } from './fast-handover/statistics-chart/statistics-chart.component';


@NgModule({
  declarations: [
    AddDashboardUserDialogComponent,
    AppConfigurationComponent,
    AppControlComponent,
    CaasIngressComponent,
    CatalogCardComponent,
    CatalogComponent,
    ConfirmDialogComponent,
    ControlCardComponent,
    ControlComponent,
    EditDashboardUserDialogComponent,
    ErrorDialogComponent,
    FooterComponent,
    LoadingDialogComponent,
    MainComponent,
    PlatformComponent,
    RanControlComponent,
    RdComponent,
    SidenavListComponent,
    StatCardComponent,
    StatsComponent,
    StatsDialogComponent,
    UserComponent,
    InstanceSelectorDialogComponent,
    OnboardComponent,
    DeployDialogComponent,
    LineChartComponent,
    TrafficSteeringComponent,
    LogAreaComponent,
    MonitorComponent,
    BouncerComponent,
    PrometheusChartComponent,
    FastHandoverComponent,
    UeNameMappingComponent,
    FieldSetupComponent,
    GnbSetupComponent,
    IntervalSetupComponent,
    DoughnutChartComponent,
    GaugeChartComponent,
    OffsetSetupComponent,
    StatisticsChartComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ChartsModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MaterialDesignFrameworkModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    MDBBootstrapModule.forRoot(),
    RdRoutingModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    AngularDraggableModule,
    GaugeChartModule
  ],
  exports: [
    ErrorDialogComponent,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatTabsModule
  ],
  entryComponents: [
    AddDashboardUserDialogComponent,
    AppConfigurationComponent,
    ConfirmDialogComponent,
    EditDashboardUserDialogComponent,
    ErrorDialogComponent,
    InstanceSelectorDialogComponent,
    LoadingDialogComponent,
    StatsDialogComponent
  ],
  providers: [
    AppMgrService,
    DashboardService,
    E2ManagerService,
    A1MediatorService,
    ErrorDialogService,
    InstanceSelectorService,
    InstanceSelectorDialogService,
    UiService,
    XappOnboarderService
  ],
  bootstrap: [RdComponent]
})
export class RdModule { }
