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

// Models of data used by the App Manager.
// TS interface names are Java class names plus XM prefix.

export interface XMConfigMetadata {
  xappName: string;
  namespace: string;
}

export interface XMXappConfig {
  metadata: XMConfigMetadata;
  config: Object;
}

export interface XMAllXappConfig {
  [position: number]: XMXappConfig;
}

export interface XMConfigValidationError {
  field: string;
  error: string;
}

export interface XMConfigValidationErrors {
  [position: number]: XMConfigValidationError;
}

export interface XMAppTransport {
  name: string;
  version: string;
}

export interface XMDashboardDeployableXapps {
  [position: number]: XMAppTransport;
}

export interface XMXappInstance {
  ip: string;
  name: string;
  port: number;
  status: string;
  rxMessages: Array<string>;
  txMessages: Array<string>;
  policies: Array<number>;
}

export interface XMXapp {
  name: string;
  status: string; // actually an enum
  version: string;
  instances: Array<XMXappInstance>;
}

export interface XMAllDeployedXapps {
  [postion: number]: XMXapp;
}

/**
 * xappName is the only required field
 */
export interface XMXappDescriptor {
  xappName: string;
  helmVersion?: string;
  releaseName?: string;
  namespace?: string;
  overrideFile?: object;
}

export interface XappControlRow {
  xapp: string;
  instance: XMXappInstance;
}
