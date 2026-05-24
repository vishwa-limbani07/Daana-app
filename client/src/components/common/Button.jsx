// Button.jsx — wraps <button> with consistent Tailwind styles.
// Use `variant` to switch between primary / secondary / danger looks.

export default function Button({ variant = 'primary', className = '', ...props }) {
  const base = 'px-4 py-2 rounded font-medium transition disabled:opacity-50';
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
