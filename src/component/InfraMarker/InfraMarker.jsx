import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import classNames from "classnames"
import mapboxgl from "mapbox-gl"

const ICONS = {
  hospital: "/img/hospital-button-active.svg",
  sport: "/img/sport-button-active.svg",
  shops: "/img/shop-button-active.svg",
  kindergarten: "/img/kindergarten-button-active.svg",
  bus_stop: "/img/bus-stop-button-active.svg",
  school: "/img/school-button-active.svg",
}

const InfraMarker = ({ markerData, map, onClick }) => {
  const markerRef = useRef()
  const contentRef = useRef(document.createElement("div"))

  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (!map) return

    markerRef.current = new mapboxgl.Marker(contentRef.current)
      .setLngLat([markerData.coords.lon, markerData.coords.lat])
      .addTo(map)

    return () => {
      markerRef.current.remove()
    }
  }, [map, markerData])

  if (!markerData) return null

  return createPortal(
    <div
      className={classNames(
        "flex flex-col items-center cursor-pointer select-none"
      )}
      onClick={() => onClick && onClick(markerData)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: "max-content" }}
    >
      <div
        className={classNames(
          "infra-marker w-6 h-6 rounded-full bg-gray-800 bg-opacity-10 border border-white flex items-center justify-center flex-shrink-0"
        )}
      >
        <img
          className="w-5 h-5"
          src={ICONS[markerData.objType] || "/img/default-icon.svg"}
          alt={markerData.objType}
        />
      </div>
      {hovered && (
        <div
          className="mt-1 text-xs font-semibold select-text whitespace-nowrap"
        >
          {markerData.name}
        </div>
      )}
    </div>,
    contentRef.current
  )
}

export default InfraMarker
