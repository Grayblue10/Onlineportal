import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Switch } from '../ui';

const FormSwitch = ({
  name,
  label,
  description,
  disabled = false,
  className = '',
  ...props
}) => {
  const { register, watch, setValue } = useFormContext();
  const value = watch(name);

  return (
    <div className={`flex items-start justify-between py-3 ${className}`}>
      <div className="flex flex-col">
        <label
          htmlFor={name}
          className={`text-sm font-medium ${
            disabled ? 'text-gray-400' : 'text-gray-700'
          }`}
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="ml-4 flex-shrink-0">
        <Switch
          id={name}
          checked={value}
          onCheckedChange={(checked) => setValue(name, checked, { shouldDirty: true })}
          disabled={disabled}
          {...props}
        />
      </div>
      <input
        type="hidden"
        {...register(name)}
      />
    </div>
  );
};

export default FormSwitch;
