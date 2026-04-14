'use client'

import dynamic from 'next/dynamic'

const MiniMap = dynamic(() => import('./MiniMap'), {
  ssr: false,
  loading: () => (
    <div className="h-48 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading map…</p>
    </div>
  ),
})

interface Props {
  lat: number
  lng: number
  title: string
  address: string
}

export default function MiniMapClient(props: Props) {
  return <MiniMap {...props} />
}
