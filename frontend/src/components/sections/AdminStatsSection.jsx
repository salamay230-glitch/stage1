import StatTile from '../dashboard/StatTile';

const AdminStatsSection = ({ stats, t }) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile variant="total" label={t.responsableStatsTotal} value={stats.total_missions ?? 0} />
      <StatTile variant="notStarted" label={t.responsableStatsNotStarted} value={stats.not_started_missions ?? 0} />
      <StatTile variant="ongoing" label={t.responsableStatsOngoing} value={stats.ongoing_missions ?? 0} />
      <StatTile variant="completed" label={t.responsableStatsCompleted} value={stats.completed_missions ?? 0} />
    </div>
  );
};

export default AdminStatsSection;
