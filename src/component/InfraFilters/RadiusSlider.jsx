const RadiusSlider = ({ radius, onChange }) => {
  return (
    <div className="radius-slider bg-white p-3 rounded shadow-md w-40 text-center">
      <label htmlFor="radiusRange" className="block mb-2 font-medium text-sm">
        Радиус: {radius} м
      </label>
      <input
        id="radiusRange"
        type="range"
        min="1000"
        max="10000"
        step="500"
        value={radius}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  )
}

export default RadiusSlider