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
import { of } from 'rxjs/observable/of';
import { merge } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { V1Pod, V1PodList } from '@kubernetes/client-node';
import { CaasIngressService } from '../services/caas-ingress/caas-ingress.service';
import { NotificationService } from '../services/ui/notification.service';

export class CaasIngressDataSource extends DataSource<V1Pod> {

  private relationsSubject = new BehaviorSubject<V1Pod[]>([]);

  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  public rowCount = 1; // hide footer during intial load

  constructor(private caasIngressService: CaasIngressService,
    private sort: MatSort,
    private notificationService: NotificationService) {
    super();
  }

  loadTable(instanceKey: string, cluster: string, namespace: string) {
    this.loadingSubject.next(true);
    this.caasIngressService.getPodList(instanceKey, cluster, namespace)
      .pipe(
        catchError((her: HttpErrorResponse) => {
          console.log('CaasIngressDataSource failed: ' + her.message);
          this.notificationService.error('Failed to get data: ' + her.message);
          return of([]);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((pl: V1PodList) => {
        this.rowCount = pl.items.length;
        // precompute container ready, restart counts to keep HTML simple
        for (const v1pod of pl.items) {
          v1pod['readyCount'] = 0;
          v1pod['restartCount'] = 0;
          for (const cs of v1pod.status.containerStatuses) {
            if (cs.ready) {
              v1pod['readyCount'] = v1pod['readyCount'] + 1;
            }
            v1pod['restartCount'] = v1pod['restartCount'] + cs.restartCount;
          }
        }
        this.relationsSubject.next(pl.items);
      });
  }

  connect(collectionViewer: CollectionViewer): Observable<V1Pod[]> {
    const dataMutations = [
      this.relationsSubject.asObservable(),
      this.sort.sortChange
    ];
    return merge(...dataMutations).pipe(map(() => {
      return this.getSortedData([...this.relationsSubject.getValue()]);
    }));
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.relationsSubject.complete();
    this.loadingSubject.complete();
  }

  private getSortedData(data: V1Pod[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }
    return data.sort((a: V1Pod, b: V1Pod) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'namespace': return compare(a.metadata.namespace, b.metadata.namespace, isAsc);
        case 'name': return compare(a.metadata.name, b.metadata.name, isAsc);
        case 'status': return compare(a.status.phase, b.status.phase, isAsc);
        case 'containers': return compare(a.spec.containers.length, b.spec.containers.length, isAsc);
        case 'ip': return compare(a.status.podIP, b.status.podIP, isAsc);
        case 'restartCount': return compare(a['restartCount'], b['restartCount'], isAsc);
        case 'createTime': return compare(a.metadata.creationTimestamp, b.metadata.creationTimestamp, isAsc);
        default: return 0;
      }
    });
  }
}

function compare(a: any, b: any, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
