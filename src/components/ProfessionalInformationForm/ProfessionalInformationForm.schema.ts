import { z } from 'zod';

export const professionalInformationSchema = z.object({
  employeeID: z.string().optional(),
  employeeType: z.string().min(1, 'Employee Type is required'),
  employmentStatus: z.string().min(1, 'Employment Status is required'),
  dateOfJoining: z.string().min(1, 'Date of Joining is required'),
  department: z.string().min(1, 'Department is required'),
});

export type ProfessionalInformationFormValues = z.infer<typeof professionalInformationSchema>;
