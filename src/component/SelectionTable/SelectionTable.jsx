import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartBroken } from '@fortawesome/free-solid-svg-icons';

const SelectionTable = ({
  developments,
  headers,
  dataKey,
  dataSuffix = '', // суффикс для данных (например, " м")
  onDeleteDevelopment,
  onFeatureClick,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            {/* Первая колонка для ЖК, задаем ей фиксированную ширину */}
            <th className="p-3 text-left w-1/5">ЖК</th>
            {/* Остальные колонки с данными */}
            {headers.map((header) => (
              <th key={header} className="p-3 border-b-2 border-gray-200 text-left font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {developments.map((item) => (
            <tr key={item.development.id} className="border-b border-gray-200 hover:bg-gray-50">
              {/* Ячейка с информацией о ЖК */}
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
                    <FontAwesomeIcon icon={faHeartBroken} />
                  </button>
                </div>
              </td>
              {/* Ячейки с данными */}
              {Object.values(item[dataKey]).map((value, index) => (
                <td key={index} className="p-3 text-left">
                  {value}{dataSuffix}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SelectionTable;