import AICreatorTemplate from 'src/components/ui/ai.template';
import { ItemCard } from 'src/components/schedule.item';
import { endpoint } from "src/utils/env";

const TasksEventsCreator = () => {
  return (
    <AICreatorTemplate
      title="Tasks & Events"
      subtitle="AI-powered organization assistant"
      inputPlaceholder="Describe your task or event..."
      examplePrompts={[
        "Plan weekly team meeting for project updates",
        "Schedule gym sessions three times a week",
        "Organize monthly family dinner gathering",
        "Create daily meditation routine",
        "Set up quarterly business review",
        "Plan weekend grocery shopping list"
      ]}
      type="task_event"
      endpoint={`${endpoint}/ai/calendar`}
      addManualRoute="create.schedule"
      addManualButtonText="Add Manually"
      ItemComponent={ItemCard}
      gradientColors={['#0e7490', '#06b6d4', '#67e8f9']}
    />
  );
};
export default TasksEventsCreator
