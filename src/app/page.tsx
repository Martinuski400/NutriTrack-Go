
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to registration first, user can navigate from there
  redirect('/register');
}
