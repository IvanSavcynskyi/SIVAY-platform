import { useState } from 'react';

const GENERIC_ERROR = 'Сталася помилка. Спробуйте ще раз пізніше.';

export default function useAuthForm(initialValues, validators) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);

    const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({ ...current, [name]: value }));
    setFormError('');

    if (attempted) {
      setErrors((current) => ({ ...current, [name]: validators[name](value) }));
    }
  };

  const handleSubmit = (onValid) => async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const form = event.currentTarget;
    const nextErrors = {};

    Object.keys(validators).forEach((name) => {
      nextErrors[name] = validators[name](values[name]);
    });

    setAttempted(true);
    setErrors(nextErrors);
    setFormError('');

    const firstInvalid = Object.keys(nextErrors).find((name) => nextErrors[name]);

    if (firstInvalid) {
      form.elements[firstInvalid]?.focus();
      return;
    }

    setSubmitting(true);

    try {
      await onValid(values);
    } catch {
      setFormError(GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return { values, errors, formError, setFormError, submitting, handleChange, handleSubmit };
}
