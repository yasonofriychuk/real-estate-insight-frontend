import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSelections, deleteSelection } from "../api/api";
import {
  faMapMarkedAlt,
  faEllipsisV,
  faTrashAlt,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SelectionModal from "../component/SelectionModal/SelectionModal";

const SelectionsPage = () => {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [modalData, setModalData] = useState(null); // null | {} | {selectionId, name, comment, form}
  const navigate = useNavigate();
  const menuRef = useRef();

  useEffect(() => {
    const loadSelections = async () => {
      try {
        const data = await fetchSelections();
        setSelections(data);
      } catch (err) {
        setError("Ошибка при загрузке подборок");
      } finally {
        setLoading(false);
      }
    };

    loadSelections();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить подборку?")) return;
    try {
      await deleteSelection(id);
      setSelections((prev) => prev.filter((s) => s.selectionId !== id));
    } catch (err) {
      alert("Ошибка удаления подборки");
    }
  };

  const toggleMenu = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Подборки</h1>
        <button
          onClick={() => setModalData({})}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + Новая подборка
        </button>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selections.map((sel) => (
            <div
              key={sel.selectionId}
              className="border rounded-lg shadow p-4 relative cursor-pointer hover:border-blue-400"
              onClick={() => navigate(`/selection/${sel.selectionId}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{sel.name}</h2>
                    <span className="text-gray-400 text-xs">
                      {new Date(sel.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-3 overflow-hidden text-ellipsis">
                    {sel.comment}
                  </p>
                </div>
                <div
                  className="flex items-start gap-2 ml-4 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="text-blue-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100"
                    onClick={() =>
                      navigate(`/map?selectionId=${sel.selectionId}`)
                    }
                  >
                    <FontAwesomeIcon icon={faMapMarkedAlt} size="lg" />
                  </button>
                  <button
                    className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100"
                    onClick={() => toggleMenu(sel.selectionId)}
                  >
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </button>
                  {openMenuId === sel.selectionId && (
                    <div
                      ref={menuRef}
                      className="absolute right-4 z-10 w-40 mt-10 bg-white border rounded shadow"
                    >
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setModalData(sel)}
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-2 w-4" />{" "}
                        Редактировать
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => handleDelete(sel.selectionId)}
                      >
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          className="mr-2 w-4"
                        />{" "}
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalData && (
        <SelectionModal
          initialData={modalData}
          onClose={() => setModalData(null)}
          onSave={(newSelection) => {
            setModalData(null);
            setSelections((prev) => {
              const exists = prev.find(
                (s) => s.selectionId === newSelection.selectionId
              );
              if (exists) {
                return prev.map((s) =>
                  s.selectionId === newSelection.selectionId ? newSelection : s
                );
              } else {
                return [...prev, newSelection];
              }
            });
          }}
        />
      )}
    </div>
  );
};

export default SelectionsPage;
