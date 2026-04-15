import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../features/auth/authSlice';
import { useLocale } from '../../context/LocaleContext';

const buttonBaseClass =
  'flex h-[50px] w-[210px] items-center justify-start rounded-[10px] border border-[#4d6f99]/70 bg-[linear-gradient(135deg,#052033_0%,#0b3b34_100%)] px-4 text-[17px] font-semibold tracking-[0.02em] text-[#f1f6fc] transition-colors duration-200 hover:bg-[linear-gradient(135deg,#06283f_0%,#0f4a41_100%)]';

export default function LoginCard() {
  const dispatch = useDispatch();
  const { t, isRTL } = useLocale();
  const { status, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const loading = status === 'loading';
  const canContinue = email.trim().length > 0 && password.trim().length > 0 && !loading;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canContinue) {
      return;
    }
    dispatch(loginUser({ email: email.trim(), password, remember: true }));
  };

  return (
    <section className={`w-full max-w-[470px] px-[24px] py-[10px] ${isRTL ? 'mr-[14px]' : 'ml-[14px]'}`}>
      <h1 className={`text-[54px] font-medium tracking-[0.05em] leading-[58px] text-[#f0f3f6] ${isRTL ? 'text-right' : 'text-left'}`}>
        {t.loginTitle}
      </h1>
      <p className={`mt-3 max-w-[380px] text-[14px] leading-[20px] text-[#d7e2ef] ${isRTL ? 'text-right' : 'text-left'}`}>
        {t.loginSubtitle}
      </p>

      <form onSubmit={handleSubmit} className={`mt-[28px] w-full max-w-[400px] ${isRTL ? 'text-right' : 'text-left'}`}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t.emailPlaceholder}
          className="h-[54px] w-full rounded-[10px] border border-[#4d6f99]/70 bg-[#12314c]/30 px-4 text-[18px] text-[#e8eff7] placeholder:text-[#9fb4cb] outline-none transition-colors duration-200 focus:border-[#6d8fb7]"
        />

        <div className="relative mt-4">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t.passwordPlaceholder}
            className="h-[54px] w-full rounded-[10px] border border-[#4d6f99]/70 bg-[#12314c]/30 px-4 pr-16 text-[18px] text-[#e8eff7] placeholder:text-[#9fb4cb] outline-none transition-colors duration-200 focus:border-[#6d8fb7]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className={`absolute top-1/2 -translate-y-1/2 text-xs font-medium text-[#cddbed] transition-colors hover:text-white ${isRTL ? 'left-3' : 'right-3'}`}
          >
            {showPassword ? t.hide : t.show}
          </button>
        </div>

        <button
          type="submit"
          disabled={!canContinue}
          className={`${buttonBaseClass} mt-5 disabled:cursor-not-allowed disabled:opacity-80`}
        >
          {loading ? t.loading : t.login}
        </button>

        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

        <div className="hidden mt-8 items-center gap-6">
          <span className="h-px flex-1 bg-white/20" />
          <span className="text-[16px] text-white/70">or</span>
          <span className="h-px flex-1 bg-white/20" />
        </div>

        <button type="button" className="hidden">
          Continue with Google
        </button>
        <button type="button" className="hidden">
          Continue with Apple
        </button>

        <p className="hidden mt-8 text-center text-[16px] text-white/65">Don’t have an account?</p>
        <button type="button" className="hidden">
          Create account
        </button>
      </form>
    </section>
  );
}
