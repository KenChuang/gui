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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { CatalogComponent } from './catalog/catalog.component';
import { ControlComponent } from './control/control.component';
import { MainComponent } from './main/main.component';
import { PlatformComponent } from './platform/platform.component';
import { StatsComponent } from './stats/stats.component';
import { UserComponent } from './user/user.component';
import { TrafficSteeringComponent } from './traffic-steering/traffic-steering.component';
import { MonitorComponent } from './monitor/monitor.component';
import { BouncerComponent } from './bouncer/bouncer.component'
import { FastHandoverComponent } from './fast-handover/fast-handover.component';

const routes: Routes = [
    {path: '', component: FastHandoverComponent},
    {path: 'catalog', component: CatalogComponent},
    {path: 'control', component: ControlComponent},
    {path: 'stats', component: StatsComponent},
    {path: 'platform', component: PlatformComponent},
    {path: 'user', component: UserComponent},
    {path: 'ts', component: TrafficSteeringComponent},
    {path: 'monitor', component: MonitorComponent},
    {path: 'bouncer', component: BouncerComponent},
    {path: 'handover', component: FastHandoverComponent},
];

@NgModule({
  imports: [
      CommonModule,
      RouterModule.forRoot(routes)],
  exports: [
      RouterModule
    ],
    declarations: []
})

export class RdRoutingModule { }
