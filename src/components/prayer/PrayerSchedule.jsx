import PrayerCard from "./PrayerCard";

export default function PrayerSchedule({ prayers, nextPrayerId, statuses = {}, timeFormat, onToggle }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {prayers.map((prayer, index) => (
        <PrayerCard
          key={prayer.id}
          prayer={prayer}
          isNext={prayer.id === nextPrayerId}
          status={statuses[prayer.id]}
          timeFormat={timeFormat}
          onToggle={onToggle}
          delay={index * 70}
        />
      ))}
    </div>
  );
}