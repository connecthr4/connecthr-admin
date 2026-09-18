/**
 * Server-Component data loaders for the separation routes.
 */

import { getEmployeeDetail } from './employees';

import type { SeparationEmployee } from '../types/separation';

/**
 * Loads the employee a separation is being filed against, reduced to what the screen shows.
 *
 * @remarks
 * The full record carries the employee's address, bank account and identity numbers. None of
 * that belongs on this screen, and everything a Server Component hands a Client Component is
 * serialized into the page — so the record is narrowed here, on the server, rather than
 * passed through whole.
 *
 * Missing and unauthorized records are already handled by `getEmployeeDetail`: a bad id
 * renders the not-found page, and an unusable session redirects to login.
 *
 * @param employeeId - The employee's `id`, as taken from the URL.
 * @returns What the separation screen needs to identify the employee.
 */
export async function getSeparationEmployee(employeeId: string): Promise<SeparationEmployee> {
  const employee = await getEmployeeDetail(employeeId);

  return {
    id: employee.id,
    employeeId: employee.employeeId,
    name: employee.name,
    avatar: employee.avatar,
    department: employee.professionalInformation.department,
    designation: employee.professionalInformation.designation,
    dateOfJoining: employee.professionalInformation.dateOfJoining,
  };
}
