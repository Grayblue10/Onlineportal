/**
 * Validation patterns and rules for form fields
 */

export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email pattern
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-Z\s-']+$/, // Allows letters, spaces, hyphens, and apostrophes
  studentId: /^[A-Za-z0-9-]+$/, // Alphanumeric with hyphens
  ssn: /^\d{3}-\d{2}-\d{4}$/, // Social Security Number format
  date: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD format
};

/**
 * Common validation rules for form fields
 */
export const rules = {
  required: (value) => ({
    isValid: !!value && value.toString().trim().length > 0,
    message: 'This field is required',
  }),
  minLength: (min) => (value) => ({
    isValid: !value || value.length >= min,
    message: `Must be at least ${min} characters`,
  }),
  maxLength: (max) => (value) => ({
    isValid: !value || value.length <= max,
    message: `Must be less than ${max} characters`,
  }),
  pattern: (pattern, message) => (value) => ({
    isValid: !value || (typeof pattern === 'string' ? new RegExp(pattern) : pattern).test(value),
    message: message || 'Invalid format',
  }),
  email: (value) => ({
    isValid: !value || patterns.email.test(value),
    message: 'Please enter a valid email address',
  }),
  password: (value) => ({
    isValid: !value || patterns.password.test(value),
    message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
  }),
  match: (fieldName, getValues) => (value, context = {}) => {
    try {
      // If getValues is provided in context, use it, otherwise use the one passed as argument
      const getValueFn = context.getValues || getValues || (() => context.formData || {});
      
      if (!getValueFn) {
        console.error('getValues function is required for match validator');
        return { isValid: false, message: 'Validation error' };
      }
      
      const fieldValue = typeof getValueFn === 'function' ? getValueFn(fieldName) : (context.formData?.[fieldName]);
      
      return {
        isValid: !value || value === fieldValue,
        message: 'Passwords do not match',
      };
    } catch (error) {
      console.error('Match validator error:', error);
      return { isValid: false, message: 'Validation error' };
    }
  },
  date: (value) => ({
    isValid: !value || !isNaN(Date.parse(value)),
    message: 'Please enter a valid date',
  }),
  number: (value) => ({
    isValid: !value || !isNaN(Number(value)),
    message: 'Please enter a valid number',
  }),
  min: (min) => (value) => ({
    isValid: !value || Number(value) >= min,
    message: `Must be at least ${min}`,
  }),
  max: (max) => (value) => ({
    isValid: !value || Number(value) <= max,
    message: `Must be less than or equal to ${max}`,
  }),
};

/**
 * Validates a value against a set of validation rules
 * @param {*} value - The value to validate
 * @param {Array} validators - Array of validator functions
 * @returns {Object} Validation result with isValid and errors array
 */
export const validateField = (value, validators = []) => {
  if (!validators || validators.length === 0) {
    return { isValid: true, errors: [] };
  }

  const errors = validators
    .map((validator) => validator(value))
    .filter((result) => !result.isValid)
    .map((result) => result.message);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Schema for common forms in the application
 */
export const formSchemas = {
  login: {
    email: [rules.required, rules.email],
    password: [rules.required],
  },
  register: {
    firstName: [rules.required, rules.pattern(patterns.name, 'Please enter a valid first name')],
    lastName: [rules.required, rules.pattern(patterns.name, 'Please enter a valid last name')],
    email: [rules.required, rules.email],
    password: [rules.required, rules.password],
    confirmPassword: [
      rules.required,
      (value, context) => rules.match('password', context?.getValues)(value, context),
    ],
    role: [rules.required],
  },
  forgotPassword: {
    email: [rules.required, rules.email],
  },
  resetPassword: {
    password: [rules.required, rules.minLength(6)],
    confirmPassword: [
      rules.required,
      (value, context) => rules.match('password', context?.getValues)(value, context),
    ],
  },
  profile: {
    firstName: [rules.required, rules.pattern(patterns.name, 'Please enter a valid name')],
    lastName: [rules.required, rules.pattern(patterns.name, 'Please enter a valid name')],
    email: [rules.required, rules.email],
    dateOfBirth: [rules.required, rules.date],
  },
  student: {
    studentId: [rules.required, rules.pattern(patterns.studentId)],
    grade: [rules.required, rules.number, rules.min(1), rules.max(12)],
  },
  teacher: {
    department: [rules.required],
    subject: [rules.required],
    qualification: [rules.required],
  },
  assignment: {
    title: [rules.required, rules.minLength(5)],
    description: [rules.required, rules.minLength(10)],
    dueDate: [rules.required, rules.date],
    totalMarks: [rules.required, rules.number, rules.min(1)],
  },
  grade: {
    score: [rules.required, rules.number, rules.min(0)],
    feedback: [rules.maxLength(500)],
  },
};

/**
 * Validates a form based on a schema
 * @param {Object} formData - Form data to validate
 * @param {Object} schema - Validation schema
 * @param {Object} options - Additional options like getValues function
 * @returns {Object} Validation result with isValid and errors object
 */
export const validateForm = (formData, schema, options = {}) => {
  const errors = {};
  let isValid = true;

  for (const [field, fieldValidators] of Object.entries(schema)) {
    const value = formData[field];
    
    // Ensure validators is an array
    const validators = Array.isArray(fieldValidators) ? fieldValidators : [fieldValidators];
    
    // Create a context with form data and options
    const context = { 
      ...options, 
      formData, 
      field, 
      value,
      getValues: options.getValues || (() => formData)
    };
    
    // Process each validator
    for (const validator of validators) {
      let validatorFn = validator;
      
      // If it's a rule function, call it with the context
      if (typeof validator === 'function') {
        validatorFn = (val) => validator(val, context);
      }
      
      const result = validateField(value, [validatorFn]);
      
      if (!result.isValid) {
        errors[field] = result.errors[0]; // Only show the first error
        isValid = false;
        break; // Stop at the first error
      }
    }
  }

  return { isValid, errors };
};

/**
 * Hook for form validation with React Hook Form
 * @param {Object} schema - Validation schema
 * @returns {Object} Methods for form validation
 */
export const useFormValidation = (schema) => {
  const validate = (data) => {
    const { isValid, errors } = validateForm(data, schema);
    return isValid || Object.values(errors).join('');
  };

  return { validate };
};

export default {
  patterns,
  rules,
  validateField,
  formSchemas,
  validateForm,
  useFormValidation,
};
