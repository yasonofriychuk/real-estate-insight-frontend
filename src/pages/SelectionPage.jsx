import { useEffect, useState } from "react";
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
// Импортируем новый компонент таблицы
import SelectionTable from "../component/SelectionTable/SelectionTable";

// Конфигурация для таблиц, чтобы избежать дублирования в JSX
const tableConfigs = {
  distance: {
    headers: [
      "Детский сад",
      "Учебное заведение",
      "Больница",
      "Магазин",
      "Спорт",
      "Остановка",
    ],
    dataKey: "distance",
    dataSuffix: " м",
  },
  count: {
    headers: [
      "Детские сады",
      "Учебные заведения",
      "Больницы",
      "Магазины",
      "Спорт",
      "Остановки",
    ],
    dataKey: "object3000mCounts",
    dataSuffix: "",
  },
};

const SelectionPage = () => {
  const { selectionId } = useParams();
  const [selection, setSelection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [activeTab, setActiveTab] = useState("distance");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSelection = async () => {
      try {
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
        setSelection((prevSelection) => ({
          ...prevSelection,
          favoriteDevelopments: prevSelection.favoriteDevelopments.filter(
            (dev) => dev.development.id !== developmentId
          ),
        }));
      } catch (err) {
        alert("Ошибка при удалении ЖК");
      }
    }
  };

  const handleFeatureClick = (feature) => {
    setActiveFeature(feature);
  };

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Блок с информацией и действиями */}
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

      {/* Блок с таблицами */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Переключатели табов */}
        <div className="mb-6">
          <button
            onClick={() => setActiveTab("distance")}
            className={`px-4 py-2 rounded-l-md transition-colors ${
              activeTab === "distance"
                ? "bg-blue-600 text-white font-semibold"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Расстояние до объектов
          </button>
          <button
            onClick={() => setActiveTab("count")}
            className={`px-4 py-2 rounded-r-md transition-colors ${
              activeTab === "count"
                ? "bg-blue-600 text-white font-semibold"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Количество объектов (радиус 3 км)
          </button>
        </div>

        {/* Отображение активной таблицы через новый компонент */}
        <SelectionTable
          developments={selection.favoriteDevelopments}
          headers={tableConfigs[activeTab].headers}
          dataKey={tableConfigs[activeTab].dataKey}
          dataSuffix={tableConfigs[activeTab].dataSuffix}
          onDeleteDevelopment={handleDeleteDevelopment}
          onFeatureClick={handleFeatureClick}
        />
      </div>

      {/* Модальные окна */}
      {activeFeature && (
        <Modal feature={activeFeature} onClose={() => setActiveFeature(null)} />
      )}

      {modalData && (
        <SelectionModal
          initialData={modalData}
          onClose={() => setModalData(null)}
          onSave={(newSelection) => {
            setModalData(null);
            setSelection((prevSelection) => ({
              ...prevSelection,
              selection: newSelection,
            }));
          }}
        />
      )}
    </div>
  );
};

export default SelectionPage;
