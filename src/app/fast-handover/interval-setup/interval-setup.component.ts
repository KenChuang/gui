/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 - 2022 AT&T Intellectual Property
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
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '../../services/ui/notification.service';

@Component({
  selector: 'rd-interval-setup',
  templateUrl: './interval-setup.component.html',
  styleUrls: ['./interval-setup.component.scss']
})
export class IntervalSetupComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<IntervalSetupComponent>,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  intervalInput = 0;

  ngOnInit(): void {
    this.intervalInput = this.data.refreshInterval;
  }

  applyInterval(): void {
    let interval = Number(this.intervalInput);
    if (isNaN(interval) || interval < 0 || !Number.isInteger(interval)) {
      this.notificationService.error('Setup failed: GUI Update Interval should be non-negative integer!');
    } else {
      // input available
      this.data.refreshInterval = interval;
      this.notificationService.success('GUI Update Interval setup successfully!');
      this.dialogRef.close();
    }
  }
}
