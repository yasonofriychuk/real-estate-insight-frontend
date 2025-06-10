import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";

// Компонент для иконки сортировки, без изменений
const SortIcon = ({ direction }) => {
  if (direction === "ascending")
    return <FontAwesomeIcon icon={faSortUp} className="ml-2" />;
  if (direction === "descending")
    return <FontAwesomeIcon icon={faSortDown} className="ml-2" />;
  return <FontAwesomeIcon icon={faSort} className="ml-2 text-gray-400" />;
};

const SelectionTable = ({
  developments,
  headers, // Теперь это массив пар [key, headerText]
  dataKey,
  dataSuffix = "",
  onDeleteDevelopment,
  onFeatureClick,
  onSort,
  sortConfig,
  valueType, // 'distance' или 'count'
}) => {
  // Вычисляем мин/макс значения для каждой колонки, используя ключи
  const columnStats = useMemo(() => {
    if (!developments || developments.length === 0) return {};
    const stats = {};
    headers.forEach(([key]) => {
      const values = developments
        .map((item) => item[dataKey]?.[key])
        .filter((v) => typeof v === "number");
      if (values.length < 2) {
        stats[key] = { min: 0, max: 0, range: 0 };
      } else {
        const min = Math.min(...values);
        const max = Math.max(...values);
        stats[key] = { min, max, range: max - min };
      }
    });
    return stats;
  }, [developments, headers, dataKey]);

  // Функция для получения цвета ячейки, теперь принимает ключ
  const getCellColor = (value, key) => {
    if (typeof value !== "number") return "transparent";

    const stats = columnStats[key];
    if (stats.range === 0) {
      return "transparent"; // Нет градиента, если все значения одинаковы
    }

    let normalized = (value - stats.min) / stats.range;

    // Для расстояний инвертируем: чем меньше, тем "зеленее"
    if (valueType === "distance") {
      normalized = 1 - normalized;
    }

    normalized = Math.max(0, Math.min(1, normalized)); // Защита от выхода за пределы [0, 1]

    const hue = normalized * 120; // 0 = red, 120 = green
    return `hsl(${hue}, 70%, 88%)`; // Светлый оттенок для фона
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th
              className="p-3 text-left w-1/5 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => onSort("development")}
            >
              <div className="flex items-center">
                <span>ЖК</span>
                {sortConfig.key === "development" ? (
                  <SortIcon direction={sortConfig.direction} />
                ) : (
                  <FontAwesomeIcon
                    icon={faSort}
                    className="ml-2 text-gray-400"
                  />
                )}
              </div>
            </th>
            {headers.map(([key, headerText]) => (
              <th
                key={key}
                className="p-3 border-b-2 border-gray-200 text-left font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => onSort(key)}
              >
                <div className="flex items-center justify-between">
                  <span>{headerText}</span>
                  {sortConfig.key === key ? (
                    <SortIcon direction={sortConfig.direction} />
                  ) : (
                    <FontAwesomeIcon
                      icon={faSort}
                      className="ml-2 text-gray-400"
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {developments.map((item) => (
            <tr
              key={item.development.id}
              className="border-b border-gray-200 hover:bg-gray-50"
            >
              <td className="p-3">
                <div className="flex items-center">
                  <img
                    src={item.development.imageUrl}
                    alt={item.development.name}
                    className="w-12 h-12 object-cover rounded flex-shrink-0"
                  />
                  <div className="ml-4 flex-grow">
                    <span
                      className="block font-semibold cursor-pointer hover:text-blue-600"
                      onClick={() => onFeatureClick(item.development)}
                    >
                      {item.development.name}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteDevelopment(item.development.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                    title="Удалить из подборки"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </td>
              {/* Рендерим ячейки, используя ключи для доступа к данным */}
              {headers.map(([key]) => {
                const value = item[dataKey]?.[key];
                return (
                  <td
                    key={key}
                    className="p-3 text-left transition-colors"
                    style={{ backgroundColor: getCellColor(value, key) }}
                  >
                    {typeof value === "number" ? `${value}${dataSuffix}` : "–"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SelectionTable;
