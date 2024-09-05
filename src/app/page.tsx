import ExpenseAnalysis from '@/components/ExpenseAnalysis';
import ExpenseTracker from '@/components/ExpenseTracker';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <ExpenseTracker />
    </main>
  );
}