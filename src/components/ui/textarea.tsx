'use client';

import React, { forwardRef } from 'react';
import { View, TextInput, Platform } from 'react-native';
import { cssInterop } from 'nativewind';
import { createContext, useContext } from 'react';
import { Reactive } from '@legendapp/state/react';

// Enhanced context type
type TextareaContextType = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  cursorPosition?: 'top' | 'middle';
  fontFamily?: string;
};

// Style context
const TextareaContext = createContext<TextareaContextType>({ 
  size: 'md',
  cursorPosition: 'top',
  fontFamily: 'font-regular'
});

// Native CSS interop
cssInterop(View, { className: 'style' });
cssInterop(TextInput, {
  className: { target: 'style', nativeStyleToProp: { textAlign: true } },
});

// Enhanced Types
type TextareaProps = {
  variant?: 'default';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  disabled?: boolean;
  invalid?: boolean;
  showBorder?: boolean;
  cursorPosition?: 'top' | 'middle';
  fontFamily?: string;
} & React.ComponentProps<typeof View>;

type TextareaInputProps = {
  className?: string;
  autoFocus?: boolean;
} & React.ComponentProps<typeof TextInput>;

// Wrapper component
const TextareaWrapper = forwardRef<React.ElementRef<typeof View>, TextareaProps>(
  ({ 
    children, 
    className = '', 
    variant = 'default', 
    size = 'md', 
    disabled, 
    invalid,
    showBorder = true,
    cursorPosition = 'top',
    fontFamily = 'font-regular',
    ...props 
  }, ref) => {
    // Base styles with conditional border
    const baseStyle = `w-full h-[100px] rounded ${showBorder ? 'border border-background-300' : ''}`;
    const hoverStyle = showBorder ? 'data-[hover=true]:border-outline-400' : '';
    const focusStyle = showBorder ? 'data-[focus=true]:border-primary-700 data-[focus=true]:data-[hover=true]:border-primary-700' : '';
    const disabledStyle = `
      data-[disabled=true]:opacity-40 
      data-[disabled=true]:bg-background-50 
      ${showBorder ? 'data-[disabled=true]:data-[hover=true]:border-background-300' : ''}
    `;
    
    const variantStyles = {
      default: showBorder ? `
        data-[focus=true]:border-primary-700 
        data-[focus=true]:web:ring-1 
        data-[focus=true]:web:ring-inset 
        data-[focus=true]:web:ring-indicator-primary 
        data-[invalid=true]:border-error-700 
        data-[invalid=true]:web:ring-1 
        data-[invalid=true]:web:ring-inset 
        data-[invalid=true]:web:ring-indicator-error 
        data-[invalid=true]:data-[hover=true]:border-error-700 
        data-[invalid=true]:data-[focus=true]:data-[hover=true]:border-primary-700
        data-[invalid=true]:data-[focus=true]:data-[hover=true]:web:ring-1 
        data-[invalid=true]:data-[focus=true]:data-[hover=true]:web:ring-inset 
        data-[invalid=true]:data-[focus=true]:data-[hover=true]:web:ring-indicator-primary 
        data-[invalid=true]:data-[disabled=true]:data-[hover=true]:border-error-700 
        data-[invalid=true]:data-[disabled=true]:data-[hover=true]:web:ring-1 
        data-[invalid=true]:data-[disabled=true]:data-[hover=true]:web:ring-inset 
        data-[invalid=true]:data-[disabled=true]:data-[hover=true]:web:ring-indicator-error
      `.trim() : ''
    };

    const combinedStyle = `
      ${baseStyle}
      ${hoverStyle}
      ${focusStyle}
      ${disabledStyle}
      ${variantStyles[variant]}
      ${className}
    `.trim();

    return (
      <TextareaContext.Provider value={{ size, cursorPosition, fontFamily }}>
        <View 
          ref={ref} 
          className={combinedStyle}
          {...props}
          accessible={!disabled}
          aria-disabled={disabled}
        >
          {children}
        </View>
      </TextareaContext.Provider>
    );
  }
);

// Input component
const TextareaInput = forwardRef<React.ElementRef<typeof TextInput>, TextareaInputProps>(
  ({ className = '', ...props }, ref) => {
    const { size = 'md', cursorPosition = 'top', fontFamily = 'font-regular' } = useContext(TextareaContext);
    
    const baseStyle = `
      p-2 
      web:outline-0 
      web:outline-none 
      flex-1 
      color-typography-900 
      align-text-top 
      placeholder:text-typography-500 
      web:cursor-text 
      web:data-[disabled=true]:cursor-not-allowed
      ${fontFamily}
    `;
    
    const sizeStyles = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    };

    // Apply text align based on cursor position
    const cursorStyles = {
      top: 'text-top',
      middle: 'text-center'
    };

    const combinedStyle = `
      ${baseStyle}
      ${sizeStyles[size]}
      ${cursorStyles[cursorPosition]}
      ${className}
    `.trim();

    return (
      <Reactive.TextInput
       $ref={ref}
        $className={combinedStyle}
        $multiline
        $textAlignVertical={cursorPosition}
        {...props}
      />
    );
  }
);

// Component display names
TextareaWrapper.displayName = 'Textarea';
TextareaInput.displayName = 'TextareaInput';

// Export both components
export { TextareaWrapper as Textarea, TextareaInput };