import { btn, glass } from '../../constants/dashboardStyles';

const AdminEmployeesSection = ({ 
  employees, 
  t, 
  btn, 
  setEmployeeModalOpen, 
  setEmployeeEditingId, 
  setEmployeeForm, 
  setEmployeeDeleteTarget, 
  emptyEmployeeForm 
}) => {
  return (
    <section className={`${glass} border border-white/[0.08]`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-left text-[24px] font-semibold tracking-[0.04em] text-[#f0f3f6]">{t.manageEmployees}</h2>
        <button
          type="button"
          className={btn}
          onClick={() => {
            setEmployeeModalOpen(true);
            setEmployeeEditingId(null);
            setEmployeeForm(emptyEmployeeForm);
          }}
        >
          {t.addEmployee}
        </button>
      </div>
      <div className="space-y-2">
        {employees.map((e) => (
          <div
            key={e.id}
            className="grid grid-cols-[1fr_1fr_1.4fr_auto] items-center gap-2 rounded-[10px] border border-white/[0.08] bg-[#12314c]/25 p-2 text-[#d7e2ef]"
          >
            <p className="text-left">{e.nom}</p>
            <p className="text-left">{e.prenom}</p>
            <p className="truncate text-left">{e.email}</p>
            <div className="flex gap-2">
              <button
                type="button"
                className={btn}
                onClick={() => {
                  setEmployeeModalOpen(true);
                  setEmployeeEditingId(e.id);
                  setEmployeeForm({ nom: e.nom, prenom: e.prenom, email: e.email, password: '' });
                }}
              >
                {t.editEmployee}
              </button>
              <button type="button" className={btn} onClick={() => setEmployeeDeleteTarget(e)}>
                {t.deleteEmployee}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdminEmployeesSection;
