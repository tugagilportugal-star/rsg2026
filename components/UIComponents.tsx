import React, { ReactNode } from 'react';
import { X, CheckCircle2, Loader2 } from 'lucide-react';

interface SectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
}

export const Section: React.FC<SectionProps> = ({ id, className = "", children }) => (
  <section id={id} className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 ${className}`}>
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </section>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'white';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = "", isLoading, children, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 border text-base font-medium rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "border-transparent text-white bg-brand-orange hover:bg-orange-600 focus:ring-brand-orange",
    secondary: "border-transparent text-white bg-brand-blue hover:bg-blue-600 focus:ring-brand-blue",
    outline: "border-brand-blue text-brand-blue bg-transparent hover:bg-blue-50 focus:ring-brand-blue",
    white: "border-transparent text-brand-darkBlue bg-white hover:bg-gray-100 focus:ring-white",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
          Enviando...
        </>
      ) : children}
    </button>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  size?: 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const maxWidth = size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-lg';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className={`relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${maxWidth} w-full`}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              {title && (
                <h3 className="text-xl leading-6 font-bold text-brand-darkBlue" id="modal-title">
                  {title}
                </h3>
              )}
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-2">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className = "", ...props }) => (
  <div className="mb-4 text-left">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      className={`shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-brand-blue focus:border-brand-blue block w-full sm:text-sm border-gray-300 rounded-md p-3 border ${className}`}
      {...props}
    />
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, id, className = "", ...props }) => (
  <div className="mb-4 text-left">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      id={id}
      rows={4}
      className={`shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-brand-blue focus:border-brand-blue block w-full sm:text-sm border-gray-300 rounded-md p-3 border ${className}`}
      {...props}
    />
  </div>
);

export const SuccessState: React.FC<{ message: string; onReset?: () => void }> = ({ message, onReset }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in-up">
    <div className="bg-green-100 p-4 rounded-full mb-6">
      <CheckCircle2 className="w-16 h-16 text-green-600" />
    </div>
    <h3 className="text-2xl font-bold text-brand-darkBlue mb-2">Mensagem Enviada!</h3>
    <p className="text-gray-600 mb-8 max-w-xs">{message}</p>
    {onReset && (
      <button onClick={onReset} className="text-brand-blue font-bold hover:underline">
        Enviar outra resposta
      </button>
    )}
  </div>
);