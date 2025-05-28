import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import mapboxgl from 'mapbox-gl'

const Marker = ({ feature, map, children, onClick }) => {
  const markerRef = useRef()
  const markerEl = useRef()
  const popupEl = useRef()

  const [active, setActive] = useState(false)

  const handlePopupOpen = () => {
    setActive(true)
  }

  const handlePopupClose = () => {
    setActive(false)
  }

  const handleClick = () => {
    onClick(feature)
  }

  useEffect(() => {
    const marker = new mapboxgl.Marker({
      element: markerEl.current
    })
      .setLngLat([feature.coords.lon, feature.coords.lat])
      .addTo(map)

    marker.addTo(map)

    markerRef.current = marker
  }, [feature])

  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return

    let popup

    if (children) {
      popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: true,
        closeOnMove: true,
        maxWidth: '300px',
        offset: 14
      })
        .setDOMContent(popupEl.current)
        .on('open', handlePopupOpen)
        .on('close', handlePopupClose)
    }

    marker.setPopup(popup)
  }, [children])

  if (!feature) return null
  const { name: name } = feature

  return (
    <div className='cursor-pointer' onClick={handleClick}>
      <div
        ref={markerEl}
        className={classNames(
          'marker px-3 py-3 rounded-full box-content shadow hover:bg-gray-200 border hover:border-gray-400 mapboxgl-marker mapboxgl-marker-anchor-center font-bold text-base hover:cursor-pointer',
          {
            'bg-gray-200 border-gray-400': active,
            'bg-white border-transparent': !active
          }
        )}
        style={{
          boxShadow: '0px 3px 15px 0px rgba(0, 0, 0, 0.2)'
        }}
      >

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ lineHeight: '12px' }}>{name}</span>
      </div>

      </div>
      <div ref={popupEl}>{children}</div>
    </div>
  )
}

export default Marker