// utils/validation.js

export function validateField(name, value, rules = {}, formData = {}) {
  if (rules.required?.value && !value?.toString().trim()) {
    return rules.required.message || `${name} is required`;
  }

  if (rules.minLength?.value && value.length < rules.minLength.value) {
    return rules.minLength.message || `${name} must be at least ${rules.minLength.value} characters`;
  }

  if (rules.maxLength?.value && value.length > rules.maxLength.value) {
    return rules.maxLength.message || `${name} must be at most ${rules.maxLength.value} characters`;
  }

  if (rules.pattern?.value && !rules.pattern.value.test(value)) {
    return rules.pattern.message || `${name} is invalid`;
  }

  if (rules.match && value !== formData[rules.match]) {
    const targetFieldName = rules.matchDisplayName || rules.match;
    return rules.matchMessage || `${name} must match ${targetFieldName}`;
  }

  if (rules.validate && typeof rules.validate === 'function') {
    const result = rules.validate(value, formData);
    if (result !== true) {
      return typeof result === 'string' ? result : `${name} is invalid`;
    }
  }

  if (rules.custom && typeof rules.custom === 'function') {
    const customError = rules.custom(value, formData);
    if (customError) return customError;
  }

  return null;
}


export function validateForm(formData, validationRules) {
  const errors = {};

  for (const fieldName in validationRules) {
    const value = formData[fieldName];
    const rules = validationRules[fieldName];
    const error = validateField(fieldName, value, rules, formData);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return errors;
}
