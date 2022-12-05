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

import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { merge } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { catchError, finalize, map } from 'rxjs/operators';
import { AppMgrService } from '../services/app-mgr/app-mgr.service';
import { XMXapp, XMXappInstance } from '../interfaces/app-mgr.types';
import { NotificationService } from '../services/ui/notification.service';

export class CatalogDataSource extends DataSource<XMXapp> {

  private catalogSubject = new BehaviorSubject<XMXapp[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  public rowCount = 1; // hide footer during intial load

  constructor(
    private appMgrSvc: AppMgrService,
    private sort: MatSort,
    private notificationService: NotificationService) {
    super();
  }

  loadTable(instanceKey: string) {
    this.loadingSubject.next(true);
    this.appMgrSvc.getDeployable(instanceKey)
      .pipe(
        catchError((her: HttpErrorResponse) => {
          console.log('CatalogDataSource failed: ' + her.message);
          this.notificationService.error('Failed to get applications: ' + her.message);
          return of([]);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      // .subscribe((xApps: XMXapp[]) => {
      //   this.rowCount = xApps.length;
      //   this.catalogSubject.next(xApps);
      // });
      .subscribe((res: string) => {
        let names = Object.keys(res);
        let xApps = []
        for (let name of names) {
          let new_xapp = new MyXMXapp();
          new_xapp.name = name;
          xApps.push(new_xapp);
        }
        this.rowCount = xApps.length;
        this.catalogSubject.next(xApps);
      });
  }

  connect(collectionViewer: CollectionViewer): Observable<XMXapp[]> {
    const dataMutations = [
      this.catalogSubject.asObservable(),
      this.sort.sortChange
    ];
    return merge(...dataMutations).pipe(map(() => {
      return this.getSortedData([...this.catalogSubject.getValue()]);
    }));
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.catalogSubject.complete();
    this.loadingSubject.complete();
  }

  private getSortedData(data: XMXapp[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }
    return data.sort((a: XMXapp, b: XMXapp) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'name': return this.compare(a.name, b.name, isAsc);
        case 'version': return this.compare(a.version, b.version, isAsc);
        default: return 0;
      }
    });
  }

  private compare(a: any, b: any, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}

export class MyXMXapp implements XMXapp {
  name: string;
  status: string;
  version: string;
  instances: XMXappInstance[];
}