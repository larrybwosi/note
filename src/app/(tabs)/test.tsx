
import { ItemCard } from 'src/components/schedule.item';
import AICreatorTemplate from 'src/components/ui/ai.template';

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
      endpoint="http://192.168.42.236:3000/ai/enhance"
      addManualRoute="scheduleadd"
      addManualButtonText="Add Manually"
      ItemComponent={ItemCard}
      gradientColors={['#4F46E5', '#7C3AED', '#9333EA']}
    />
  );
};
export default TasksEventsCreator