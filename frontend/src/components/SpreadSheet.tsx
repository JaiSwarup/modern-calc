import Sheet from './Sheet'
import { useParams } from 'react-router-dom'
import React from 'react'
import axios from 'axios'

// type Props = {
//     data : JSON,
// }

export default function SpreadSheet() {
    const [read, setRead] = React.useState(false)


  return (
    <div>
        <Sheet />
    </div>
  )
}