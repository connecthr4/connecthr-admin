import { z } from 'zod';

/**
 * Mirrors the rule the create endpoint applies to both phone numbers — ten digits opening
 * with 6-9 — so a number it would reject is caught on the step rather than at submit.
 */
const INDIAN_MOBILE_NUMBER = /^[6-9]\d{9}$/;

export const personalInformationSchema = z.object({
  // Personal Details
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  mobileNumber: z.string().regex(INDIAN_MOBILE_NUMBER, 'Enter a valid 10-digit Mobile Number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  dateOfBirth: z.string().min(1, 'Date of Birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  maritalStatus: z.string().min(1, 'Marital Status is required'),
  aadhaarNumber: z
    .string()
    .length(12, 'Aadhaar Number must be 12 digits')
    .regex(/^\d+$/, 'Aadhaar Number must contain only numbers'),

  // Address Information
  currentAddress: z.string().min(1, 'Current Address is required'),
  currentCity: z.string().min(1, 'Current City is required'),
  currentState: z.string().min(1, 'Current State is required'),
  currentDistrictCode: z.string().min(1, 'Current District is required'),
  currentPinCode: z
    .string()
    .length(6, 'PIN Code must be 6 digits')
    .regex(/^\d+$/, 'PIN Code must contain only numbers'),
  sameAsCurrentAddress: z.boolean().optional(),
  permanentAddress: z.string().min(1, 'Permanent Address is required'),
  permanentCity: z.string().min(1, 'Permanent City is required'),
  permanentState: z.string().min(1, 'Permanent State is required'),
  permanentDistrictCode: z.string().min(1, 'Permanent District is required'),
  permanentPinCode: z
    .string()
    .length(6, 'PIN Code must be 6 digits')
    .regex(/^\d+$/, 'PIN Code must contain only numbers'),

  // Emergency Contact
  emergencyContactName: z.string().min(1, 'Contact Name is required'),
  emergencyRelationship: z.string().min(1, 'Relationship is required'),
  emergencyPhoneNumber: z.string().regex(INDIAN_MOBILE_NUMBER, 'Enter a valid 10-digit Phone Number'),
  emergencyAddress: z.string().min(1, 'Address is required'),
});

export type PersonalInformationFormValues = z.infer<typeof personalInformationSchema>;
