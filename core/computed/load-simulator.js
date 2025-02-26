/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {makeComputedArtifact} from './computed-artifact.js';
import * as constants from '../config/constants.js';
import {Simulator} from '../lib/dependency-graph/simulator/simulator.js';
import {NetworkAnalysis} from './network-analysis.js';

class LoadSimulator {
  /**
   * @param {{devtoolsLog: LH.DevtoolsLog, settings: LH.Audit.Context['settings']}} data
   * @param {LH.Artifacts.ComputedContext} context
   * @return {Promise<Simulator>}
   */
  static async compute_(data, context) {
    const {throttlingMethod, throttling, precomputedLanternData} = data.settings;
    const networkAnalysis = await NetworkAnalysis.request(data.devtoolsLog, context);

    /** @type {LH.Gatherer.Simulation.Options} */
    const options = {
      additionalRttByOrigin: networkAnalysis.additionalRttByOrigin,
      serverResponseTimeByOrigin: networkAnalysis.serverResponseTimeByOrigin,
      observedThroughput: networkAnalysis.throughput,
    };

    // If we have precomputed lantern data, overwrite our observed estimates and use precomputed instead
    // for increased stability.
    if (precomputedLanternData) {
      options.additionalRttByOrigin = new Map(Object.entries(
        precomputedLanternData.additionalRttByOrigin));
      options.serverResponseTimeByOrigin = new Map(Object.entries(
        precomputedLanternData.serverResponseTimeByOrigin));
    }

    switch (throttlingMethod) {
      case 'provided':
        options.rtt = networkAnalysis.rtt;
        options.throughput = networkAnalysis.throughput;
        options.cpuSlowdownMultiplier = 1;
        options.layoutTaskMultiplier = 1;
        break;
      case 'devtools':
        if (throttling) {
          options.rtt =
            throttling.requestLatencyMs / constants.throttling.DEVTOOLS_RTT_ADJUSTMENT_FACTOR;
          options.throughput =
            throttling.downloadThroughputKbps * 1024 /
            constants.throttling.DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR;
        }

        options.cpuSlowdownMultiplier = 1;
        options.layoutTaskMultiplier = 1;
        break;
      case 'simulate':
        if (throttling) {
          options.rtt = throttling.rttMs;
          options.throughput = throttling.throughputKbps * 1024;
          options.cpuSlowdownMultiplier = throttling.cpuSlowdownMultiplier;
        }
        break;
      default:
        // intentionally fallback to simulator defaults
        break;
    }

    return new Simulator(options);
  }

  /**
   * @param {LH.Artifacts.NetworkAnalysis} networkAnalysis
   * @return {LH.PrecomputedLanternData}
   */
  static convertAnalysisToSaveableLanternData(networkAnalysis) {
    /** @type {LH.PrecomputedLanternData} */
    const lanternData = {additionalRttByOrigin: {}, serverResponseTimeByOrigin: {}};
    for (const [origin, value] of networkAnalysis.additionalRttByOrigin.entries()) {
      if (origin.startsWith('http')) lanternData.additionalRttByOrigin[origin] = value;
    }

    for (const [origin, value] of networkAnalysis.serverResponseTimeByOrigin.entries()) {
      if (origin.startsWith('http')) lanternData.serverResponseTimeByOrigin[origin] = value;
    }

    return lanternData;
  }
}

const LoadSimulatorComputed = makeComputedArtifact(LoadSimulator, ['devtoolsLog', 'settings']);
export {LoadSimulatorComputed as LoadSimulator};
