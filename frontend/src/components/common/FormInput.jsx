import { forwardRef } from 'react';
import { input } from '../../constants/dashboardStyles';

const FormInput = forwardRef(function FormInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  readOnly = false,
  min,
  max,
  ariaLabel,
  className = '',
  isTextarea = false,
  variant = 'dashboard',
  ...props
}, ref) {
  const getBaseClasses = () => {
    if (variant === 'login') {
      return 'h-[54px] w-full rounded-[10px] border border-[#4d6f99]/70 bg-[#12314c]/30 px-4 text-[18px] text-[#e8eff7] placeholder:text-[#9fb4cb] outline-none transition-colors duration-200 focus:border-[#6d8fb7]';
    }
    return input;
  };

  const baseClasses = getBaseClasses();
  const textareaClasses = isTextarea ? 'min-h-[100px] py-3' : '';
  const finalClassName = `${baseClasses} ${textareaClasses} ${className}`.trim();

  if (isTextarea) {
    return (
      <textarea
        ref={ref}
        className={finalClassName}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        aria-label={ariaLabel}
        {...props}
      />
    );
  }

  return (
    <input
      ref={ref}
      type={type}
      className={finalClassName}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      readOnly={readOnly}
      min={min}
      max={max}
      aria-label={ariaLabel}
      {...props}
    />
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;