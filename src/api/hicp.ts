/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonStatResponse } from '../data/types';
import { fetchEurostatDataset } from './eurostat';

export const HICP_DATASET_CODE = 'prc_hicp_midx';

/**
 * Fetch Harmonised Index of Consumer Prices dataset from Eurostat
 * Dataset: prc_hicp_midx (HICP - monthly data, index)
 * coicop: CP00 (All-items HICP)
 * unit: I15 (Index, 2015=100)
 */
export async function fetchHicpData(
  geos: string[] = ['FR'],
  sinceTimePeriod = '2010-01'
): Promise<JsonStatResponse> {
  return fetchEurostatDataset(HICP_DATASET_CODE, {
    geo: geos,
    unit: 'I15',
    coicop: 'CP00',
    sinceTimePeriod,
  });
}
