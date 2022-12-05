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
  selector: 'rd-gnb-setup',
  templateUrl: './gnb-setup.component.html',
  styleUrls: ['./gnb-setup.component.scss']
})
export class GnbSetupComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<GnbSetupComponent>,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit(): void {
  }

  applyGNB(): void {
    // check input available
    for (let i = 0; i < 2; i++) {
      // check id
      let tempId = Number(this.data.bsListInput[i].index);
      if (isNaN(tempId)) {
        this.notificationService.error('GNB ID must be integer!');
        return;
      } else if (tempId < 0) {
        this.notificationService.error('GNB ID must be positive!');
        return;
      }
      // check position
      let x = Number(this.data.bsListInput[i].x);
      let y = Number(this.data.bsListInput[i].y);
      if (isNaN(x) || isNaN(y) || !Number.isInteger(x) || !Number.isInteger(y)) {
        this.notificationService.error('GNB x & y must be integer!');
        return;
      }
    }
    // input available, start to assign
    for (let i = 0; i < 2; i++) {
      this.data.bsList[i].position = {
        x: Math.round((Number(this.data.bsListInput[i].x) + 20) * 10),
        y: Math.round((Number(this.data.bsListInput[i].y) + 20) * 10)
      }
      this.data.bsList[i].index = this.data.bsListInput[i].index
    }
    this.notificationService.success('GNB setup successfully!');
    this.dialogRef.close();
  }
}
