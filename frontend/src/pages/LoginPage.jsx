import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LoginCard from '../components/auth/LoginCard';
import LanguageSwitcher from '../components/auth/LanguageSwitcher';
import OcpMarkLogo from '../components/branding/OcpMarkLogo';
import { useLocale } from '../context/LocaleContext';
import { resolveRoleHomePath } from '../utils/authPaths';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t, isRTL } = useLocale();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      navigate(resolveRoleHomePath(user?.role), { replace: true });
    }
  }, [token, user, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#031726]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,#0b3b34_0%,#052033_33%,#031726_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_52%,rgba(8,72,60,0.28)_0%,rgba(3,23,38,0)_58%)]" />

      <div className="relative flex min-h-screen flex-col px-4 pb-6 pt-4 sm:px-6 sm:pb-8 md:px-10 lg:px-12 xl:px-16">
        <div className={`flex items-center gap-[10px] ${isRTL ? 'justify-end' : 'justify-start'}`}>
          <OcpMarkLogo className="h-auto w-[30px] object-contain text-white" />
          <p className="text-[18px] font-semibold text-white">{t.brand}</p>
        </div>

        <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-8 overflow-x-hidden sm:gap-10 md:gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          <div className={`flex w-full items-center ${isRTL ? 'justify-end' : 'justify-start'}`}>
            <LoginCard />
          </div>

          <section
            className={`flex w-full items-center py-2 sm:py-4 lg:min-h-[65vh] lg:py-10 ${
              isRTL ? 'justify-start lg:pl-6 xl:pl-10' : 'justify-end lg:pr-6 xl:pr-10'
            }`}
          >
            <div className={`w-full max-w-2xl ${isRTL ? 'text-right' : 'text-left'}`}>
              <h2 className="text-3xl font-semibold leading-tight tracking-[0.02em] text-white sm:text-4xl lg:text-5xl">
                {t.rightSection.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/85 sm:mt-5 sm:text-base lg:text-lg">
                {t.rightSection.description}
              </p>

              <ul
                className={`mt-6 list-disc space-y-3 text-sm leading-7 text-white/90 sm:mt-8 sm:space-y-4 md:text-base ${
                  isRTL ? 'pr-5 sm:pr-6' : 'pl-5 sm:pl-6'
                }`}
              >
                <li>{t.rightSection.point1}</li>
                <li>{t.rightSection.point2}</li>
                <li>{t.rightSection.point3}</li>
              </ul>
            </div>
          </section>
        </main>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
