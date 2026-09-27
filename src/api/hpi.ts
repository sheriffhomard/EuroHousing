/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonStatResponse } from '../data/types';
import { fetchEurostatDataset } from './eurostat';

export const HPI_DATASET_CODE = 'prc_hpi_q';

/**
 * Fetch House Price Index dataset from Eurostat
 * Dataset: prc_hpi_q (House price index - quarterly data)
 * Default unit: I15_Q (Quarterly index, 2015=100)
 */
export async function fetchHpiData(
  geos: string[] = ['FR'],
  sinceTimePeriod = '2010-Q1'
): Promise<JsonStatResponse> {
  return fetchEurostatDataset(HPI_DATASET_CODE, {
    geo: geos,
    unit: 'I15_Q',
    sinceTimePeriod,
  });
}
