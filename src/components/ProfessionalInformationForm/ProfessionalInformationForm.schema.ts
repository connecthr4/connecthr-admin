import { z } from 'zod';

export const professionalInformationSchema = z.object({
  employeeID: z.string().optional(),
  employeeType: z.string().min(1, 'Employee Type is required'),
  employmentStatus: z.string().min(1, 'Employment Status is required'),
  dateOfJoining: z.string().min(1, 'Date of Joining is required'),
  department: z.string().min(1, 'Department is required'),
  // Holds the shift's code ("GENERAL"), which is what `/shifts` keys its options on.
  shiftCode: z.string().min(1, 'Shift is required'),
});

export type ProfessionalInformationFormValues = z.infer<typeof professionalInformationSchema>;
