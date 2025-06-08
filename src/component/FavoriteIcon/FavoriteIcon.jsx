import { useState } from "react";
import { toggleFavoriteSelection } from "../../api/api";

const FavoriteIcon = ({
  selectionId,
  developmentId,
  initialFavorite = false,
  onToggle,
}) => {
  if (!selectionId) return;

  const [favorite, setFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (loading) return;

    const newFavoriteState = !favorite;
    setFavorite(newFavoriteState);
    setLoading(true);

    try {
      const response = await toggleFavoriteSelection(
        selectionId,
        developmentId,
        newFavoriteState,
      );
      if (response && onToggle) {
        onToggle(newFavoriteState);
      }
    } catch (err) {
      console.error("Ошибка при обновлении избранного", err);
      setFavorite(!newFavoriteState); // Откат в случае ошибки
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={favorite ? "Удалить из избранного" : "Добавить в избранное"}
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        background: "transparent",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        padding: 0,
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={favorite ? "red" : "gray"}
        stroke={favorite ? "red" : "gray"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.72-7.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  );
};

export default FavoriteIcon;
