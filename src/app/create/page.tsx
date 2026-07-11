import { StepWizard } from "@/components/generator/step-wizard";

export default function CreatePage() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center bg-background px-4 py-16 sm:px-6 lg:px-8">
      <StepWizard />
    </main>
  );
}
