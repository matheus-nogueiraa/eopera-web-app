import React from 'react'
import { CFooter } from '@coreui/react'
import pkg from '../../package.json';

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div className="ms-auto">
        <span className="ms-1">Portal Elcop &copy; 2025. v{pkg.version}</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
