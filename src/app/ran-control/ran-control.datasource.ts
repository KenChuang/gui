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
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { of } from 'rxjs/observable/of';
import { catchError, finalize } from 'rxjs/operators';
import { E2RanDetails } from '../interfaces/e2-mgr.types';
import { E2ManagerService } from '../services/e2-mgr/e2-mgr.service';
import { NotificationService } from '../services/ui/notification.service';

export class RANControlDataSource extends DataSource<E2RanDetails> {

  private ranControlSubject = new BehaviorSubject<E2RanDetails[]>([]);

  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  public rowCount = 1; // hide footer during intial load

  constructor(private e2MgrSvcservice: E2ManagerService,
    private notificationService: NotificationService) {
    super();
  }

  loadTable(instanceKey: string) {
    this.loadingSubject.next(true);
    this.e2MgrSvcservice.getRan(instanceKey)
      .pipe(
        catchError( (her: HttpErrorResponse) => {
          console.log('RANControlDataSource failed: ' + her.message);
          this.notificationService.error('Failed to get RAN details: ' + her.message);
          return of([]);
        }),
        finalize( () =>  this.loadingSubject.next(false) )
      )
      .subscribe( (ranControl: E2RanDetails[] ) => {
        let ranIds = [];
        for (let id in ranControl) {
          let node = ranControl[id];
          let ranInstance = null;
          for (let id2 in ranIds) {
            if (ranIds[id2].nbId == node.nodebIdentity.globalNbId.nbId) {
              ranInstance = ranIds[id2];
              break;
            }
          }
          if (!ranInstance) {
            ranInstance = {nbId: node.nodebIdentity.globalNbId.nbId, duFlag: false, cuUpFlag: false};
            ranIds.push(ranInstance);
          }
          if (node.nodebIdentity.inventoryName.includes('_d_')) {
            node.nodebStatus.nodeType = 'DU';
            ranInstance.duFlag = true;
          } else if (node.nodebIdentity.inventoryName.includes('_u_')) {
            node.nodebStatus.nodeType = 'CU-UP';
            ranInstance.cuUpFlag = true;
          }
        }
        for (let id in ranControl) {
          let node = ranControl[id];
          if (node.nodebStatus.nodeType == 'GNB') {
            let ranInstance;
            for (let id2 in ranIds) {
              if (ranIds[id2].nbId == node.nodebIdentity.globalNbId.nbId) {
                ranInstance = ranIds[id2];
                break;
              }
            }
            if (ranInstance.duFlag && ranInstance.cuUpFlag) {
              node.nodebStatus.nodeType = 'CU-CP';
            } else if (ranInstance.duFlag) {
              node.nodebStatus.nodeType = 'CU/CU-CP';
            } else {
              node.nodebStatus.nodeType = 'GNB/CU/CU-CP';
            }
          }
        }
        // sort RAN nodes
        let ranControlSorted = [];
        for (let id in ranIds) {
          let ranInstance = ranIds[id];
          for (let i = 0; i < 3; i++) {
            switch (i) {
              case 0: // CU/CU-CP
                for (let j = 0; j < ranControl.length; j++) {
                  let node = ranControl[j];
                  if (node.nodebIdentity.globalNbId.nbId == ranInstance.nbId
                    && (node.nodebStatus.nodeType.includes('CU-CP') || node.nodebStatus.nodeType.includes('CU/'))) {
                    ranControl.splice(j, 1);
                    ranControlSorted.push(node);
                    break;
                  }
                }
                break;
              case 1: // CU-UP
                for (let j = 0; j < ranControl.length; j++) {
                  let node = ranControl[j];
                  if (node.nodebIdentity.globalNbId.nbId == ranInstance.nbId
                    && node.nodebStatus.nodeType.includes('CU-UP')) {
                    ranControl.splice(j, 1);
                    ranControlSorted.push(node);
                    break;
                  }
                }
                break;
              case 2: // DU
                let done;
                do {
                  done = true;
                  for (let j = 0; j < ranControl.length; j++) {
                    let node = ranControl[j];
                    if (node.nodebIdentity.globalNbId.nbId == ranInstance.nbId
                      && node.nodebStatus.nodeType.includes('DU')) {
                      ranControl.splice(j, 1);
                      ranControlSorted.push(node);
                      done = false;
                      break;
                    }
                  }
                } while (!done);
                break;
            }
          }
        }
        this.rowCount = ranControlSorted.length;
        this.ranControlSubject.next(ranControlSorted);
      });
  }

  connect(collectionViewer: CollectionViewer): Observable<E2RanDetails[]> {
    return this.ranControlSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.ranControlSubject.complete();
    this.loadingSubject.complete();
  }

}
