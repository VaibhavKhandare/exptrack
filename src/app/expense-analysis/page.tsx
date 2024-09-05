import ExpenseAnalysis from '@/components/ExpenseAnalysis';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <ExpenseAnalysis />
    </main>
  );
}