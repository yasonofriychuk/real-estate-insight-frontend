const InfraFilters = ({ filters, activeFilters, onToggle }) => {
  return (
    <div className="filters-container flex gap-4 bg-white p-3 rounded shadow-md">
      {filters.map(({ id, label, icon }) => {
        const active = activeFilters.includes(id)
        return (
          <button
            key={id}
            onClick={() => onToggle(id)}
            className="flex items-center gap-1 cursor-pointer"
            aria-pressed={active}
            style={{ opacity: active ? 1 : 0.5 }}
          >
            <img
              src={icon}
              alt={label}
              width={16}
              height={16}
              style={{ filter: active ? 'none' : 'grayscale(100%)' }}
            />
            <span className="text-sm select-none">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default InfraFilters