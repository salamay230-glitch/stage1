import { forwardRef } from 'react';
import { input } from '../../constants/dashboardStyles';

const FormSelect = forwardRef(function FormSelect({
  children,
  value,
  onChange,
  className = '',
  variant = 'dashboard',
  ...props
}, ref) {
  const getBaseClasses = () => {
    if (variant === 'status') {
      return 'h-[36px] rounded-[8px] border border-[#4d6f99]/70 bg-[#12314c] px-3 text-[13px] font-semibold text-[#f1f6fc] outline-none';
    }
    return input;
  };

  const baseClasses = getBaseClasses();
  const finalClassName = `${baseClasses} ${className}`.trim();

  return (
    <select
      ref={ref}
      className={finalClassName}
      value={value}
      onChange={onChange}
      {...props}
    >
      {children}
    </select>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;
