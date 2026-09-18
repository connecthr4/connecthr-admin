import { z } from 'zod';

import { DOCUMENT_UPLOAD, NOTICE_PERIOD_DAYS } from '@/src/constants/strings';
import { BYTES_IN_MB } from '@/src/utils/helper';
import { parseLocalDate } from '@/src/utils/date';

/** Whole days only — the field is a text input, so "30.5" and "-5" both have to be refused. */
const WHOLE_NUMBER = /^\d+$/;

/** Widened from the constant's literal tuple, so an arbitrary `File.type` can be looked up. */
const ACCEPTED_TYPES: readonly string[] = DOCUMENT_UPLOAD.ACCEPTED_TYPES;

export const initiateSeparationSchema = z
  .object({
    /*
      Holds the display text the dropdown offers ("Resignation"), like every other
      backend-owned option in the app. Checked for emptiness only: the dropdown cannot
      produce a value that is not on its own list.
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
    reasonForLeaving: z
      .string()
      .min(1, 'Reason for Leaving is required')
      .max(500, 'Reason for Leaving cannot be longer than 500 characters'),
    additionalNotes: z.string().max(1000, 'Additional Notes cannot be longer than 1000 characters').optional(),

    /*
      The dropzone refuses an unsupported or oversized pick itself, but a file can also be
      dropped straight onto it — and the value is what ends up being uploaded either way, so
      both rules are enforced here as well as there.
    */
    resignationLetter: z
      .instanceof(File, { message: 'Resignation Letter is required' })
      .refine((file) => ACCEPTED_TYPES.includes(file.type), 'Resignation Letter must be a JPEG or PDF')
      .refine(
        (file) => file.size <= DOCUMENT_UPLOAD.MAX_SIZE_MB * BYTES_IN_MB,
        `Resignation Letter must be smaller than ${DOCUMENT_UPLOAD.MAX_SIZE_MB}MB`
      ),
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
