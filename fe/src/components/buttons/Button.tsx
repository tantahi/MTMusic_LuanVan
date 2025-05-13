import { forwardRef, ButtonHTMLAttributes } from 'react';
import { classNames } from '@/lib/utils';
import Icon from '../Icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  disabled?: boolean;
  className?: string;
  variant?: 'outlined' | 'contained' | 'gradient' | any;
  labelIcon?: any;
  isSubmitting?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'button',
      label,
      disabled,
      className,
      variant,
      labelIcon,
      isSubmitting,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={classNames(
          variant === 'outlined' && 'border border-primary text-primary',
          variant === 'contained' && 'bg-primary text-white',
          variant === 'gradient' &&
            'from-button_gradient_from to-button_gradient_to bg-gradient-to-r text-white',
          'scale-1 rounded px-4 py-2 text-sm font-semibold outline-none transition duration-300 ease-linear disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        disabled={disabled || isSubmitting}
        type={type}
        ref={ref}
        {...props}
      >
        {!isSubmitting ? (
          <div className="flex flex-row items-center">
            {labelIcon && (
              <Icon
                name={labelIcon}
                className={classNames(
                  variant === 'contained' && 'text-primary',
                  variant === 'filled' && 'text-white',
                  variant === 'gradient' && 'text-white',
                  'mr-1' // Add margin-right directly here
                )}
              />
            )}
            <div className="w-full whitespace-nowrap text-center">{label}</div>
          </div>
        ) : (
          <div>Loading..</div>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
