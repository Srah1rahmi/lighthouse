/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as LH from '../../../types/lh.js';

export type HeaderEntry = {
    name: string;
    value: string;
};
export type ParsedURL = {
    /**
     * Equivalent to a `new URL(url).protocol` BUT w/o the trailing colon (:)
     */
    scheme: string;
    /**
     * Equivalent to a `new URL(url).hostname`
     */
    host: string;
    securityOrigin: string;
};
// TODO(15841): ideally this is not in trace engine
export type LightriderStatistics = {
    /**
     * The difference in networkEndTime between the observed Lighthouse networkEndTime and Lightrider's derived networkEndTime.
     */
    endTimeDeltaMs: number;
    /**
     * The time spent making a TCP connection (connect + SSL). Note: this is poorly named.
     */
    TCPMs: number;
    /**
     * The time spent requesting a resource from a remote server, we use this to approx RTT. Note: this is poorly names, it really should be "server response time".
     */
    requestMs: number;
    /**
     * Time to receive the entire response payload starting the clock on receiving the first fragment (first non-header byte).
     */
    responseMs: number;
};
export class NetworkRequest {
    static get TYPES(): LH.Util.SelfMap<LH.Crdp.Network.ResourceType>;

    requestId: string;
    connectionId: string;
    connectionReused: boolean;
    url: string;
    protocol: string;
    isSecure: boolean;
    isValid: boolean;
    parsedURL: ParsedURL;
    documentURL: string;
    /** When the renderer process initially discovers a network request, in milliseconds. */
    rendererStartTime: number;
    /**
     * When the network service is about to handle a request, ie. just before going to the
     * HTTP cache or going to the network for DNS/connection setup, in milliseconds.
     */
    networkRequestTime: number;
    /** When the last byte of the response headers is received, in milliseconds. */
    responseHeadersEndTime: number;
    /** When the last byte of the response body is received, in milliseconds. */
    networkEndTime: number;
    transferSize: number;
    responseHeadersTransferSize: number;
    resourceSize: number;
    fromDiskCache: boolean;
    fromMemoryCache: boolean;
    fromPrefetchCache: boolean;
    /** @type {LightriderStatistics|undefined} Extra timing information available only when run in Lightrider. */
    lrStatistics: LightriderStatistics | undefined;
    finished: boolean;
    requestMethod: string;
    statusCode: number;
    /** @type {Lantern.NetworkRequest|undefined} The network request that redirected to this one */
    redirectSource: NetworkRequest | undefined;
    /** @type {Lantern.NetworkRequest|undefined} The network request that this one redirected to */
    redirectDestination: NetworkRequest | undefined;
    /** @type {Lantern.NetworkRequest[]|undefined} The chain of network requests that redirected to this one */
    redirects: NetworkRequest[] | undefined;
    failed: boolean;
    localizedFailDescription: string;
    /** @type {LH.Crdp.Network.Initiator} */
    initiator: LH.Crdp.Network.Initiator;
    /** @type {LH.Crdp.Network.ResourceTiming|undefined} */
    timing: LH.Crdp.Network.ResourceTiming | undefined;
    /** @type {LH.Crdp.Network.ResourceType|undefined} */
    resourceType: LH.Crdp.Network.ResourceType | undefined;
    mimeType: string;
    /** @type {LH.Crdp.Network.ResourcePriority} */
    priority: LH.Crdp.Network.ResourcePriority;
    /** @type {Lantern.NetworkRequest|undefined} */
    initiatorRequest: NetworkRequest | undefined;
    /** @type {HeaderEntry[]} */
    responseHeaders: HeaderEntry[];
    /** @type {string} */
    responseHeadersText: string;
    fetchedViaServiceWorker: boolean;
    /** @type {string|undefined} */
    frameId: string | undefined;
    /** @type {string|undefined} */
    sessionId: string | undefined;
    /** @type {LH.Protocol.TargetType|undefined} */
    sessionTargetType: LH.Protocol.TargetType | undefined;
    isLinkPreload: boolean;
    isNonNetworkRequest(): boolean;
    get isOutOfProcessIframe(): boolean;
}

export {};
