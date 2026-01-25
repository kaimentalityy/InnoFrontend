import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    className = '',
    disabled,
    ...props
}) => {
    const baseClass = 'btn';
    const variantClass = variant === 'outline' ? 'btn-outline-primary' : `btn-${variant}`;
    const sizeClass = size !== 'md' ? `btn-${size}` : '';

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading...
                </>
            ) : (
                children
            )}
        </button>
    );
};
