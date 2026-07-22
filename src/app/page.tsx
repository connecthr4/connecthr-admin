import { redirect } from 'next/navigation';
import { ROUTES } from '../constants/strings';

export default function Home() {
  redirect(ROUTES.LOGIN);
}
