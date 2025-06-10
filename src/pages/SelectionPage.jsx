import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getSelectionById,
  toggleFavoriteSelection,
  deleteSelection,
} from "../api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkedAlt,
  faTrashAlt,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../component/Modal/Modal";
import SelectionModal from "../component/SelectionModal/SelectionModal";
import SelectionTable from "../component/SelectionTable/SelectionTable";

// Обновленная конфигурация с ключами для надежной привязки данных к заголовкам
const tableConfigs = {
  distance: {
    headers: [
      ["kindergarten", "Детский сад"],
      ["school", "Учебное заведение"],
      ["hospital", "Больница"],
      ["shops", "Магазин"],
      ["sport", "Спорт"],
      ["busStop", "Остановка"],
    ],
    dataKey: "distance",
    dataSuffix: " м",
  },
  count: {
    headers: [
      ["kindergarten", "Детские сады"],
      ["school", "Учебные заведения"],
      ["hospital", "Больницы"],
      ["shops", "Магазины"],
      ["sport", "Спорт"],
      ["busStop", "Остановки"],
    ],
    dataSuffix: "", // dataKey будет динамическим
  },
};

const radiusOptions = [1000, 2000, 3000, 4000, 5000];

const SelectionPage = () => {
  const { selectionId } = useParams();
  const [selection, setSelection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [activeTab, setActiveTab] = useState("distance");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "none",
  });
  const [selectedRadius, setSelectedRadius] = useState(3000);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSelection = async () => {
      try {
        setLoading(true);
        const selectionData = await getSelectionById(selectionId);
        setSelection(selectionData);
      } catch (err) {
        setError("Не удалось загрузить подборку.");
      } finally {
        setLoading(false);
      }
    };
    fetchSelection();
  }, [selectionId]);

  // Сортировка переключает состояния: по возрастанию -> по убыванию -> без сортировки
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    } else if (
      sortConfig.key === key &&
      sortConfig.direction === "descending"
    ) {
      direction = "none";
      key = null;
    }
    setSortConfig({ key, direction });
  };

  const currentDataKey = useMemo(() => {
    return activeTab === "count"
      ? `object${selectedRadius}mCounts`
      : "distance";
  }, [activeTab, selectedRadius]);

  // Логика сортировки, исправленная для работы с ключами
  const sortedDevelopments = useMemo(() => {
    if (!selection?.favoriteDevelopments) return [];

    const sortableItems = [...selection.favoriteDevelopments];

    if (sortConfig.key !== null && sortConfig.direction !== "none") {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === "development") {
          aValue = a.development.name;
          bValue = b.development.name;
        } else {
          // Используем ключ для доступа к числовым данным
          const isDistance = activeTab === "distance";
          // Если данных нет, для расстояний считаем бесконечностью, для количества - нулем
          const defaultValue = isDistance ? Infinity : 0;
          aValue = a[currentDataKey]?.[sortConfig.key] ?? defaultValue;
          bValue = b[currentDataKey]?.[sortConfig.key] ?? defaultValue;
        }

        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return sortableItems;
  }, [selection?.favoriteDevelopments, sortConfig, currentDataKey, activeTab]);

  const handleDeleteSelection = async () => {
    if (window.confirm("Удалить эту подборку?")) {
      try {
        await deleteSelection(selectionId);
        navigate("/");
      } catch (err) {
        alert("Ошибка при удалении подборки");
      }
    }
  };

  const handleDeleteDevelopment = async (developmentId) => {
    if (window.confirm("Удалить этот ЖК из подборки?")) {
      try {
        await toggleFavoriteSelection(selectionId, developmentId, false);
        setSelection((prev) => ({
          ...prev,
          favoriteDevelopments: prev.favoriteDevelopments.filter(
            (dev) => dev.development.id !== developmentId
          ),
        }));
      } catch (err) {
        alert("Ошибка при удалении ЖК");
      }
    }
  };

  const handleFeatureClick = (feature) => setActiveFeature(feature);
  const handleEditSelection = () => {
    setModalData({
      selectionId: selection.selection.selectionId,
      name: selection.selection.name,
      comment: selection.selection.comment,
      form: selection.selection.form,
    });
  };

  if (loading) return <div className="p-6">Загрузка...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!selection) return <div className="p-6">Подборка не найдена.</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-gray-500 text-sm mb-2">
              <Link to="/" className="text-blue-600 hover:text-blue-800">
                Подборки
              </Link>{" "}
              /
            </div>
            <h1 className="text-3xl font-bold">{selection.selection.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Дата обновления:{" "}
              {new Date(selection.selection.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() =>
                navigate(`/map?selectionId=${selection.selection.selectionId}`)
              }
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FontAwesomeIcon icon={faMapMarkedAlt} className="mr-2" />
              На карте
            </button>
            <button
              onClick={handleEditSelection}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Редактировать
            </button>
            <button
              onClick={handleDeleteSelection}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
              Удалить
            </button>
          </div>
        </div>
        {selection.selection.comment && (
          <p className="text-gray-700">{selection.selection.comment}</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          {/* Табы */}
          <div>
            <button
              onClick={() => {
                setActiveTab("distance");
                setSortConfig({ key: null, direction: "none" });
              }}
              className={`px-4 py-2 rounded-l-md transition-colors ${
                activeTab === "distance"
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Расстояние до объектов
            </button>
            <button
              onClick={() => {
                setActiveTab("count");
                setSortConfig({ key: null, direction: "none" });
              }}
              className={`px-4 py-2 rounded-r-md transition-colors ${
                activeTab === "count"
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Количество объектов
            </button>
          </div>
          {/* Переключатель радиуса */}
          {activeTab === "count" && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Радиус:</span>
              <div className="flex items-center bg-gray-100 rounded-md p-1">
                {radiusOptions.map((radius) => (
                  <button
                    key={radius}
                    onClick={() => {
                      setSelectedRadius(radius);
                      setSortConfig({ key: null, direction: "none" });
                    }}
                    className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                      selectedRadius === radius
                        ? "bg-blue-600 text-white shadow"
                        : "bg-transparent text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {radius / 1000} км
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <SelectionTable
          developments={sortedDevelopments}
          headers={tableConfigs[activeTab].headers}
          dataKey={currentDataKey}
          dataSuffix={tableConfigs[activeTab].dataSuffix}
          onDeleteDevelopment={handleDeleteDevelopment}
          onFeatureClick={handleFeatureClick}
          onSort={handleSort}
          sortConfig={sortConfig}
          valueType={activeTab}
        />
      </div>

      {activeFeature && (
        <Modal feature={activeFeature} onClose={() => setActiveFeature(null)} />
      )}
      {modalData && (
        <SelectionModal
          initialData={modalData}
          onClose={() => setModalData(null)}
          onSave={(newSelection) => {
            setModalData(null);
            setSelection((prev) => ({ ...prev, selection: newSelection }));
          }}
        />
      )}
    </div>
  );
};

export default SelectionPage;
