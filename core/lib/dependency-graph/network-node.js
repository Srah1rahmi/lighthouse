/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Lantern from './lantern.js';
import {BaseNode} from './base-node.js';

/**
 * @template [T=any]
 * @extends {BaseNode<T>}
 */
class NetworkNode extends BaseNode {
  /**
   * @param {Lantern.NetworkRequest<T>} networkRequest
   */
  constructor(networkRequest) {
    super(networkRequest.requestId);
    /** @private */
    this._request = networkRequest;
  }

  get type() {
    return BaseNode.TYPES.NETWORK;
  }

  /**
   * @return {number}
   */
  get startTime() {
    return this._request.rendererStartTime * 1000;
  }

  /**
   * @return {number}
   */
  get endTime() {
    return this._request.networkEndTime * 1000;
  }

  /**
   * @return {T}
   */
  get record() {
    return /** @type {Required<T>} */ (this._request.record);
  }

  /**
   * @return {Lantern.NetworkRequest<T>}
   */
  get request() {
    return this._request;
  }

  /**
   * @return {string}
   */
  get initiatorType() {
    return this._request.initiator && this._request.initiator.type;
  }

  /**
   * @return {boolean}
   */
  get fromDiskCache() {
    return !!this._request.fromDiskCache;
  }

  /**
   * @return {boolean}
   */
  get isNonNetworkProtocol() {
    return this._request.isNonNetworkRequest();
  }


  /**
   * Returns whether this network record can be downloaded without a TCP connection.
   * During simulation we treat data coming in over a network connection separately from on-device data.
   * @return {boolean}
   */
  get isConnectionless() {
    return this.fromDiskCache || this.isNonNetworkProtocol;
  }

  /**
   * @return {boolean}
   */
  hasRenderBlockingPriority() {
    const priority = this._request.priority;
    const isScript = this._request.resourceType === Lantern.NetworkRequest.TYPES.Script;
    const isDocument = this._request.resourceType === Lantern.NetworkRequest.TYPES.Document;
    const isBlockingScript = priority === 'High' && isScript;
    const isBlockingHtmlImport = priority === 'High' && isDocument;
    return priority === 'VeryHigh' || isBlockingScript || isBlockingHtmlImport;
  }

  /**
   * @return {NetworkNode<T>}
   */
  cloneWithoutRelationships() {
    const node = new NetworkNode(this._request);
    node.setIsMainDocument(this._isMainDocument);
    return node;
  }
}

export {NetworkNode};
