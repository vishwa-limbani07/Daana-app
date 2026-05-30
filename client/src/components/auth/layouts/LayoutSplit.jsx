// LayoutSplit.jsx — two-column auth (form left, gradient showcase right).
// Modern SaaS / Stripe / Linear feel. Business-friendly.

import { Link } from 'react-router-dom';
import AuthShowcase from '../AuthShowcase.jsx';
import AuthForm from '../AuthForm.jsx';
import { THEMES } from '../../../utils/themes.js';

export default function LayoutSplit({ mode, formProps, copy }) {
  const theme = THEMES.emerald;
  const isSignup = mode === 'signup';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
      <div className="flex items-center">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <Link to="/" className={`text-sm text-gray-500 ${theme.link}`}>← Back to home</Link>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">{copy.title}</h1>
            <p className="mt-2 text-gray-500">{copy.subtitle}</p>
          </div>

          <AuthForm mode={mode} {...formProps} variant="boxed" />

          <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
            <div className="flex-1 h-px bg-gray-200" />
            {isSignup ? 'Already have an account?' : 'New to Daana?'}
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Link
            to={isSignup ? '/login' : '/signup'}
            className={`block w-full text-center bg-white border border-gray-300 ${theme.linkBorder} ${theme.link}
              text-gray-700 font-medium rounded-lg py-3 transition-colors`}
          >
            {isSignup ? 'Log in →' : 'Create an account →'}
          </Link>
        </div>
      </div>

      <AuthShowcase theme={theme} heading={copy.showcaseHeading} sub={copy.showcaseSub} />
    </div>
  );
}
