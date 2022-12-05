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
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { A1MediatorService } from './services/a1-mediator/a1-mediator.service';
import { Subscription } from 'rxjs';
import { RicInstance, RicRegion } from './interfaces/dashboard.types';
import { InstanceSelectorService } from './services/instance-selector/instance-selector.service';
import { InstanceSelectorDialogService } from './services/ui/instance-selector-dialog.service';
import { UiService } from './services/ui/ui.service';

@Component({
  selector: 'rd-root',
  templateUrl: './rd.component.html',
  styleUrls: ['./rd.component.scss']
})
export class RdComponent implements OnInit {
  showMenu = false;
  darkModeActive: boolean;
  selectedInstanceName: string = 'Select RIC instance';
  private instanceChange: Subscription;

  // for bouncer status
  ricStatusIcon = ['status_green.png', 'status_yellow.png', 'status_red.png'];
  ricStatusIndicator = 0;
  UPDATE_INTERVAL = 1;

  constructor(
    public ui: UiService,
    private instanceSelectorDialogService: InstanceSelectorDialogService,
    private instanceSelectorService: InstanceSelectorService,
    private a1MediatorService: A1MediatorService,
    private router: Router) {
  }

  ngOnInit() {
    this.ui.darkModeState.subscribe((value) => {
      this.darkModeActive = value;
    });

    this.instanceChange = this.instanceSelectorService.getSelectedInstance().subscribe((instance: RicInstance) => {
      if (instance.name) {
        this.selectedInstanceName = instance.name;
      } else {
        this.instanceSelectorService.getAllInstances().subscribe((regArray: RicRegion[]) => {
          this.instanceSelectorService.updateSelectedInstance(regArray[0].instances[0]);
        });
      }
    });
    this.updateRicStatus();
  }

  ngOnDestroy() {
    this.instanceChange.unsubscribe();
  }

  modeToggleSwitch() {
    this.ui.darkModeState.next(!this.darkModeActive);
  }

  openInstanceSelectorDialog() {
    this.instanceSelectorDialogService.openInstanceSelectorDialog();
  }

  updateRicStatus() {
    let vm = this;
    let func = function(vm) {
      vm.a1MediatorService.getSdlData('Bouncer', 'process_time')
      .subscribe((res: string) => {
        let processTime = res[0]['time'];
        if (processTime < 1000) {
          vm.ricStatusIndicator = 0;
        } else if (processTime >= 1000 && processTime < 5000) {
          vm.ricStatusIndicator = 1;
        } else {
          vm.ricStatusIndicator = 2;
        }
      });
      vm.setTimeoutTask = setTimeout(func, vm.UPDATE_INTERVAL * 1000, vm);
    }
    func(this);
  }

  getRicStatus(): string {
    return this.ricStatusIcon[this.ricStatusIndicator];
  }

  redirectBouncer() {
    this.router.navigate(['bouncer']);
  }
}
