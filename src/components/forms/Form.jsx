import React from 'react';
import PropTypes from 'prop-types';
import { useForm as useReactHookForm } from 'react-hook-form';
import { Button } from '../ui';
import { formSchemas, validateForm } from '../../utils/validators';

/**
 * A reusable form component with validation and submission handling
 */
const Form = ({
  children,
  onSubmit,
  schema,
  defaultValues = {},
  submitText = 'Submit',
  submitDisabled = false,
  loading = false,
  className = '',
  formClassName = 'space-y-6',
  buttonWrapperClassName = 'flex justify-end space-x-4',
  buttonClassName = 'w-full sm:w-auto',
  showSubmitButton = true,
  resetOnSubmit = false,
  ...formProps
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError: setFormError,
    clearErrors,
    watch,
    control,
    getValues,
  } = useReactHookForm({
    defaultValues,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  // Handle form submission with validation
  const handleFormSubmit = async (data) => {
    try {
      // Clear any previous form-level errors
      clearErrors('form');
      
      // If a schema is provided, validate against it
      if (schema) {
        try {
          const schemaToUse = typeof schema === 'string' ? formSchemas[schema] : schema;
          
          if (!schemaToUse) {
            console.error(`Schema '${schema}' not found in formSchemas`);
            return;
          }
          
          const { isValid, errors: validationErrors } = validateForm(
            data,
            schemaToUse,
            { 
              getValues, 
              watch, 
              control,
              formState: { errors }
            }
          );

          if (!isValid) {
            // Set field errors
            Object.entries(validationErrors).forEach(([field, message]) => {
              if (message) {
                setFormError(field, { type: 'manual', message });
              }
            });
            return;
          }
        } catch (error) {
          console.error('Form validation error:', error);
          setFormError('form', {
            type: 'manual',
            message: 'An error occurred during form validation',
          });
          return;
        }
      }

      // Call the provided onSubmit handler
      await onSubmit(data, { reset, setError: setFormError });
      
      // Reset form after successful submission if enabled
      if (resetOnSubmit) {
        reset();
      }
    } catch (error) {
      // Handle form-level errors
      console.error('Form submission error:', error);
      setFormError('form', {
        type: 'manual',
        message: error.message || 'An error occurred while submitting the form',
      });
    }
  };

  // Clone form children and inject form props
  const renderChildren = () => {
    const formMethods = { register, watch, errors, control, getValues };
    
    // If children is a function, call it with form methods
    if (typeof children === 'function') {
      return children(formMethods);
    }

    return React.Children.map(children, (child) => {
      // Skip non-React elements
      if (!React.isValidElement(child)) {
        return child;
      }

      // If child has children that's a function, call it with form methods
      if (typeof child.props.children === 'function') {
        return React.cloneElement(child, {
          children: child.props.children(formMethods)
        });
      }

      // Skip if no name prop (not a form field)
      if (!child.props.name) {
        return child;
      }

      const { name, validation, ...childProps } = child.props;
      
      // Get validation rules from schema or props
      let validationRules = {};
      if (schema && typeof schema === 'string' && formSchemas[schema]?.[name]) {
        // Use validation from schema
        validationRules = { validate: formSchemas[schema][name] };
      } else if (validation) {
        // Use validation from props
        validationRules = { validate: validation };
      }

      // Register the field with react-hook-form
      const registerProps = register(name, {
        ...validationRules,
        // Support for required attribute
        required: childProps.required
          ? `${childProps.label || name} is required`
          : false,
      });

      return React.cloneElement(child, {
        ...childProps,
        key: name,
        name,
        error: errors[name]?.message,
        ...registerProps
      });
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Form-level error message */}
      {errors.form && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {errors.form.message}
        </div>
      )}
      
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className={`space-y-4 ${formClassName}`}
        noValidate
        {...formProps}
      >
        {renderChildren()}
        
        {showSubmitButton && (
          <div className={`mt-6 ${buttonWrapperClassName}`}>
            <Button
              type="submit"
              disabled={submitDisabled || loading}
              className={`w-full sm:w-auto ${buttonClassName}`}
            >
              {loading ? 'Submitting...' : submitText}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

Form.propTypes = {
  /** Form content, can be React nodes or a function that receives form methods */
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  /** Form submission handler */
  onSubmit: PropTypes.func.isRequired,
  /** Form validation schema (string name or schema object) */
  schema: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  /** Default form values */
  defaultValues: PropTypes.object,
  /** Text for the submit button */
  submitText: PropTypes.string,
  /** Disable the submit button */
  submitDisabled: PropTypes.bool,
  /** Show loading state */
  loading: PropTypes.bool,
  /** Additional class names for the form container */
  className: PropTypes.string,
  /** Additional class names for the form element */
  formClassName: PropTypes.string,
  /** Additional class names for the button wrapper */
  buttonWrapperClassName: PropTypes.string,
  /** Additional class names for the submit button */
  buttonClassName: PropTypes.string,
  /** Whether to show the submit button */
  showSubmitButton: PropTypes.bool,
  /** Reset form after successful submission */
  resetOnSubmit: PropTypes.bool,
};

export default Form;
