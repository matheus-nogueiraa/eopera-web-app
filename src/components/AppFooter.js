import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div className="ms-auto">
        <span className="ms-1">&copy; 2025 Elcop Academy.</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
