import BottomTabs from "../components/BottomTabs";

export default function SkillsPage() {
  return (
    <div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-8 pb-32">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Skills
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-300">
            This is the skills page. Here you can manage and view your skills.
          </p>
        </div>
      </div>
      <BottomTabs />
    </div>
  );
} 