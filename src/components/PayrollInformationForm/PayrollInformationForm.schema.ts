import { z } from 'zod';

export const payrollInformationSchema = z
  .object({
    accountHolderName: z.string().min(1, 'Account Holder Name is required'),
    bankName: z.string().min(1, 'Bank Name is required'),
    accountNumber: z
      .string()
      .min(1, 'Account Number is required')
      .regex(/^\d{9,18}$/, 'Enter a valid Account Number'),

    confirmAccountNumber: z.string().min(1, 'Confirm Account Number is required'),
    ifscCode: z
      .string()
      .min(1, 'IFSC Code is required')
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC Code'),

    branchName: z.string().min(1, 'Branch Name is required'),
    panNumber: z
      .string()
      .min(1, 'PAN Number is required')
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Enter a valid PAN Number'),
    uanNumber: z
      .string()
      .min(1, 'UAN Number is required')
      .regex(/^\d{12}$/, 'UAN Number must be 12 digits'),
    esicNumber: z
      .string()
      .min(1, 'ESIC Number is required')
      .regex(/^\d{10,17}$/, 'Enter a valid ESIC Number'),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: 'Account numbers do not match',
    path: ['confirmAccountNumber'],
  });

export type PayrollInformationFormValues = z.infer<typeof payrollInformationSchema>;
