import React from 'react'
import { Loader } from '@mantine/core';

function Spinner() {
  return (
    <div>
        <Loader size="lg" 
        variant='bars'/>
    </div>
  )
}

export default Spinner