import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog';

export default function MissionDeleteDialog({
  missionDeleteTarget,
  t,
  glass,
  btn,
  onCancel,
  onConfirm,
}) {
  if (!missionDeleteTarget) return null;

  return (
    <ConfirmDeleteDialog
      isOpen={true}
      title={t.missionDelete}
      message={`${t.missionDeleteConfirmBody} "${missionDeleteTarget.title}"`}
      onCancel={onCancel}
      onConfirm={onConfirm}
      glass={glass}
      btn={btn}
      cancelLabel={t.cancel}
      confirmLabel={t.missionDeleteConfirmAction}
    />
  );
}