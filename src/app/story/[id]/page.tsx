import { notFound } from "next/navigation";
import { getStoryRecordById } from "@/lib/services/story-repository";
import { isElevenLabsAvailable } from "@/lib/services/narration-service";
import { StorySections } from "@/components/story/story-sections";

interface StoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params;
  const record = await getStoryRecordById(id);

  if (record === null) {
    notFound();
  }

  return (
    <StorySections record={record} elevenAvailable={isElevenLabsAvailable()} />
  );
}
