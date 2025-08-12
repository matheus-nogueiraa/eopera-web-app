// Reusable FieldError component

import React from 'react';
import PropTypes from 'prop-types';
import CIcon from '@coreui/icons-react';
import { cilX } from '@coreui/icons';

/**
 * Reusable FieldError Component for displaying field validation errors
 * @param {Object} props - Component props
 */
const FieldError = ({ error, className = '', ...props }) => {
  if (!error) return null;

  return (
    <div className={`texto-erro fade-in-error ${className}`} {...props}>
      <CIcon icon={cilX} size="sm" />
      {error}
    </div>
  );
};

FieldError.propTypes = {
  error: PropTypes.string,
  className: PropTypes.string
};

FieldError.defaultProps = {
  error: '',
  className: ''
};

export default FieldError;