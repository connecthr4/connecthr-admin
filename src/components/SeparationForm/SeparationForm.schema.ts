import { z } from 'zod';

import { NOTICE_PERIOD_DAYS } from '@/src/constants/strings';
import { parseLocalDate } from '@/src/utils/date';

/** Whole days only — the field is a text input, so "30.5" and "-5" both have to be refused. */
const WHOLE_NUMBER = /^\d+$/;

/*
  Field names are the backend's own (`reason`, `notes`), so the validated values are the
  request body: nothing is renamed between what the user filled in and what is sent.
*/
export const initiateSeparationSchema = z
  .object({
    /*
      Holds the backend's code ("RESIGNATION"), since the dropdown is filled from
      `/separations/options` and submits the `value` of whatever was picked. Checked for
      emptiness only: the dropdown cannot produce a value that is not on its own list.
    */
    separationType: z.string().min(1, 'Separation Type is required'),
    resignationDate: z.string().min(1, 'Resignation Date is required'),
    noticePeriodDays: z
      .string()
      .min(1, 'Notice Period is required')
      .regex(WHOLE_NUMBER, 'Notice Period must be a whole number of days')
      .refine(
        (value) => Number(value) >= NOTICE_PERIOD_DAYS.MIN && Number(value) <= NOTICE_PERIOD_DAYS.MAX,
        `Notice Period must be between ${NOTICE_PERIOD_DAYS.MIN} and ${NOTICE_PERIOD_DAYS.MAX} days`
      ),
    lastWorkingDate: z.string().min(1, 'Last Working Date is required'),
    reason: z
      .string()
      .min(1, 'Reason for Leaving is required')
      .max(500, 'Reason for Leaving cannot be longer than 500 characters'),
    notes: z.string().max(1000, 'Additional Notes cannot be longer than 1000 characters').optional(),
  })
  /*
    An exit cannot end before it was announced. Reported on the last working date rather than
    on the resignation date: that is the field the user is expected to correct, and the one
    they reach last.
  */
  .refine(
    (data) => {
      const resignation = parseLocalDate(data.resignationDate);
      const lastWorkingDay = parseLocalDate(data.lastWorkingDate);

      // Either one missing is already reported by its own rule above.
      if (!resignation || !lastWorkingDay) {
        return true;
      }

      return lastWorkingDay.getTime() >= resignation.getTime();
    },
    {
      message: 'Last Working Date cannot be before the Resignation Date',
      path: ['lastWorkingDate'],
    }
  );

export type InitiateSeparationFormValues = z.infer<typeof initiateSeparationSchema>;
