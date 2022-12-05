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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { RicInstance, RicRegion } from '../../interfaces/dashboard.types';
import { DashboardService } from '../dashboard/dashboard.service';

@Injectable({
  providedIn: 'root'
})
export class InstanceSelectorService {

  private allInstances: Observable<RicRegion[]>;
  private selectedInstance: BehaviorSubject<RicInstance> = new BehaviorSubject<RicInstance>({ key: '', name: '' });

  constructor(
    private dashboardSvc: DashboardService,
    private httpClient: HttpClient) {
  }

  getAllInstances(): Observable<RicRegion[]> {
    if (this.allInstances) {
      return this.allInstances;
    }
    const path = this.dashboardSvc.buildPath('admin', null, 'instance');
    return this.allInstances = this.httpClient.get<RicRegion[]>(path)
      .pipe(
        shareReplay(1)
      );
  }

  // This method may return the BehaviorSubject with empty value
  // Afther subscribe that BehaviorSubject
  // Please make sure this BehaviorSubject has non empty value
  getSelectedInstance(): BehaviorSubject<RicInstance> {
    return this.selectedInstance;
  }

  updateSelectedInstance(instance: RicInstance) {
    this.selectedInstance.next(instance);
  }

}
