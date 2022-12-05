/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2020 AT&T Intellectual Property
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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';
import { RicInstance, RicRegion } from '../../interfaces/dashboard.types';
import { InstanceSelectorService } from '../../services/instance-selector/instance-selector.service';
import { LoadingDialogService } from '../../services/ui/loading-dialog.service';

@Component({
  selector: 'rd-instance-selector-dialog',
  templateUrl: './instance-selector-dialog.component.html',
})
export class InstanceSelectorDialogComponent implements OnInit  {

  //declare following variables as Public variable. Private variables should not be used in template HTML
  allRegions: RicRegion[];
  regionInstances: RicInstance[];
  instanceForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<InstanceSelectorDialogComponent>,
    private instanceSelectorService: InstanceSelectorService,
    private loadingDialogService: LoadingDialogService) { }

  ngOnInit() {
    this.instanceForm = new FormGroup({
      instance: new FormControl('', [Validators.required])
    });

    this.loadingDialogService.startLoading('Loading RIC instances');
    this.instanceSelectorService.getAllInstances()
      .pipe(
        finalize(() => this.loadingDialogService.stopLoading())
      )
      .subscribe((regArray: RicRegion[]) => {
        this.allRegions = regArray;
      });
  }

  changeInstance(selectedInstance: RicInstance) {
    this.instanceSelectorService.updateSelectedInstance(selectedInstance);
    this.dialogRef.close(true);
  }

  changeRegion(selectedRegion: RicRegion) {
    this.instanceForm.setValue({ instance: '' });
    this.regionInstances = selectedRegion.instances;
  }
}
