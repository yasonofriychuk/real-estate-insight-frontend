import { useEffect, useState } from "react";
import { createSelection, editSelection, fetchLocationList } from "../../api/api";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const defaultWeights = {
  w_hospital: 5,
  w_sport: 5,
  w_shop: 5,
  w_kindergarten: 5,
  w_bus_stop: 5,
  w_school: 5,
};

const SelectionModal = ({ initialData, onClose, onSave }) => {
  const [name, setName] = useState(initialData.name || "");
  const [comment, setComment] = useState(initialData.comment || "");
  const [locationId, setLocationId] = useState(
    initialData.form?.location_id || ""
  );
  const [weights, setWeights] = useState({
    ...defaultWeights,
    ...(initialData.form || {}),
  });
  const [locations, setLocations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchLocationList()
      .then((data) => {
        setLocations(data);
        if (!initialData.form?.location_id && data.length > 0) {
          setLocationId(data[0].locationId);
        }
      })
      .catch(console.error);
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (name.length < 2 || name.length > 40) {
      newErrors.name = "Название должно быть от 2 до 40 символов";
    }
    if (comment.length > 500) {
      newErrors.comment = "Комментарий не должен превышать 500 символов";
    }
    if (!locationId) {
      newErrors.locationId = "Выберите локацию";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const form = {
      location_id: Number(locationId),
      ...weights,
    };
    try {
      let newSelection;
      if (initialData.selectionId) {
        await editSelection({
          selectionId: initialData.selectionId,
          name,
          comment,
          form,
        });
        newSelection = {
          ...initialData,
          name,
          comment,
          form,
          updatedAt: new Date().toISOString(),
        };
      } else {
        const selectionId = await createSelection({ name, comment, form });
        newSelection = {
          selectionId,
          name,
          comment,
          form,
          updatedAt: new Date().toISOString(),
        };
      }
      onSave(newSelection);
    } catch (err) {
      alert("Ошибка сохранения: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-semibold mb-4">
          {initialData.selectionId
            ? "Редактировать подборку"
            : "Новая подборка"}
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">Название</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">Комментарий</label>
          <textarea
            className="w-full border rounded p-2"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
          {errors.comment && (
            <p className="text-red-500 text-xs mt-1">{errors.comment}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">Локация</label>
          <select
            className="w-full border rounded p-2"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            <option value="" disabled>
              Выберите локацию
            </option>
            {locations.map((loc) => (
              <option key={loc.locationId} value={loc.locationId}>
                {loc.name}
              </option>
            ))}
          </select>
          {errors.locationId && (
            <p className="text-red-500 text-xs mt-1">{errors.locationId}</p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-bold">
              Значимость объектов
            </label>
            <div className="group relative">
              <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400" />
              <div className="absolute left-5 top-0 w-52 text-xs bg-black text-white px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Эти значения будут использоваться для построения тепловой карты
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["w_bus_stop", "Остановки"],
              ["w_hospital", "Больницы"],
              ["w_kindergarten", "Дет. сады"],
              ["w_school", "Школы"],
              ["w_shop", "Магазины"],
              ["w_sport", "Спорт"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-sm block mb-1">{label}</label>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border ${
                        weights[key] >= v
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100"
                      }`}
                      onClick={() =>
                        setWeights((prev) => ({ ...prev, [key]: v }))
                      }
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectionModal;
