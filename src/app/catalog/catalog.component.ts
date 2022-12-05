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
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { XMXapp } from '../interfaces/app-mgr.types';
import { RicInstance } from '../interfaces/dashboard.types';
import { AppMgrService } from '../services/app-mgr/app-mgr.service';
import { InstanceSelectorService } from '../services/instance-selector/instance-selector.service';
import { ConfirmDialogService } from '../services/ui/confirm-dialog.service';
import { LoadingDialogService } from '../services/ui/loading-dialog.service';
import { NotificationService } from '../services/ui/notification.service';
import { UiService } from '../services/ui/ui.service';
import { DeployDialogComponent } from '../ui/deploy-dialog/deploy-dialog.component';
import { OnboardComponent } from './../onboard/onboard.component';
import { CatalogDataSource } from './catalog.datasource';

@Component({
  selector: 'rd-app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnInit, OnDestroy {

  darkMode: boolean;
  panelClass: string;
  displayedColumns: string[] = ['name', 'version', 'action'];
  dataSource: CatalogDataSource;
  private instanceChange: Subscription;
  private instanceKey: string;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private appMgrService: AppMgrService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    public instanceSelectorService: InstanceSelectorService,
    public ui: UiService) { }

  ngOnInit() {
    this.dataSource = new CatalogDataSource(this.appMgrService, this.sort, this.notificationService);
    this.ui.darkModeState.subscribe((isDark) => {
      this.darkMode = isDark;
    });

    this.instanceChange = this.instanceSelectorService.getSelectedInstance().subscribe((instance: RicInstance) => {
      // if (instance.key) {
      if (true) {
        this.instanceKey = instance.key;
        this.dataSource.loadTable(instance.key);
      }
    });
  }

  ngOnDestroy() {
    this.instanceChange.unsubscribe();
  }

  onDeployApp(app: XMXapp): void {
    if (this.darkMode) {
      this.panelClass = 'dark-theme';
    } else {
      this.panelClass = '';
    }
    const dialogRef = this.dialog.open(DeployDialogComponent, {
      panelClass: this.panelClass,
      width: '400px',
      maxHeight: '1000px',
      position: {
        top: '10%'
      },
      data: {
        xappName: app.name,
        instanceKey: this.instanceKey
      }

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.instanceKey) {
          this.dataSource.loadTable(this.instanceKey);
        }
      }
    });
  }

  onboard(): void {
    if (this.darkMode) {
      this.panelClass = 'dark-theme';
    } else {
      this.panelClass = '';
    }
    const dialogRef = this.dialog.open(OnboardComponent, {
      panelClass: this.panelClass,
      width: '400px',
      maxHeight: '1000px',
      position: {
        top: '10%'
      },
      data: {
        instanceKey: this.instanceKey
      }

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.instanceKey) {
          this.dataSource.loadTable(this.instanceKey);
        }
      }
    });
  }

}
