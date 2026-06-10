import { z } from 'zod';

export const personalInformationSchema = z.object({
  // Personal Details
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  mobileNumber: z
    .string()
    .min(10, 'Mobile Number must be 10 digits')
    .max(10, 'Mobile Number must be 10 digits')
    .regex(/^\d+$/, 'Mobile Number must contain only numbers'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  dateOfBirth: z.date({
    required_error: 'Date of Birth is required',
  }),
  gender: z.string().min(1, 'Gender is required'),
  nationality: z.string().optional(),
  maritalStatus: z.string().min(1, 'Marital Status is required'),
  aadhaarNumber: z
    .string()
    .length(12, 'Aadhaar Number must be 12 digits')
    .regex(/^\d+$/, 'Aadhaar Number must contain only numbers'),

  // Address Information
  currentAddress: z.string().min(1, 'Current Address is required'),
  currentCity: z.string().min(1, 'Current City is required'),
  currentState: z.string().min(1, 'Current State is required'),
  currentPinCode: z
    .string()
    .length(6, 'PIN Code must be 6 digits')
    .regex(/^\d+$/, 'PIN Code must contain only numbers'),
  permanentAddress: z.string().min(1, 'Permanent Address is required'),
  permanentCity: z.string().min(1, 'Permanent City is required'),
  permanentState: z.string().min(1, 'Permanent State is required'),
  permanentPinCode: z
    .string()
    .length(6, 'PIN Code must be 6 digits')
    .regex(/^\d+$/, 'PIN Code must contain only numbers'),

  // Emergency Contact
  contactName: z.string().min(1, 'Contact Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumber: z
    .string()
    .length(10, 'Phone Number must be 10 digits')
    .regex(/^\d+$/, 'Phone Number must contain only numbers'),

  address: z.string().min(1, 'Address is required'),
});

export type PersonalInformationFormValues = z.infer<typeof personalInformationSchema>;
