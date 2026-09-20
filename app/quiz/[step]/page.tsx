import { redirect } from 'next/navigation';

/** Legacy multi-step URLs now redirect to the single-page quiz. */
export default async function QuizStepRedirectPage() {
  redirect('/quiz');
}
