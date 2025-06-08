import classNames from "classnames";
import FavoriteIcon from "../FavoriteIcon/FavoriteIcon";
import { useLocation } from "react-router-dom"; // Для работы с параметрами URL

const MarkerIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 7.71428C5 5.15607 7.19204 3 10 3C12.808 3 15 5.15607 15 7.71428C15 9.11527 14.179 10.8133 12.9489 12.6083C12.0915 13.8594 11.1256 15.0366 10.2524 16.1008C10.1673 16.2045 10.0831 16.3071 10 16.4086C9.91686 16.3071 9.83265 16.2045 9.74757 16.1008C8.8744 15.0366 7.9085 13.8594 7.0511 12.6083C5.82101 10.8133 5 9.11527 5 7.71428Z"
      stroke="#566171"
      strokeWidth="2"
    />
  </svg>
);

export const PropertyData = ({ feature, large = false }) => {
  const { name, address } = feature;

  const largerTextClass = large ? "text-2xl" : "text-xl";
  const smallerTextClass = large ? "text-base" : "text-sm";
  const xPaddingClass = large ? "p-0" : "p-3";

  return (
    <div className={classNames("py-1.5", xPaddingClass)}>
      <h5
        className={classNames(
          "mb-1.5 font-bold tracking-tight flex items-center gap-2",
          largerTextClass
        )}
      >
        {name}
        {feature.avitoUrl && (
          <a href={feature.avitoUrl} target="_blank" rel="noopener noreferrer">
            <img src='/img/avito.svg' alt="Авито" className="h-5" />
          </a>
        )}
      </h5>
      <div
        className={classNames(
          "flex items-center text-sm mb-3",
          smallerTextClass
        )}
      >
        <MarkerIcon />
        <p className="font-medium text-gray-500 ml-1.5">{address}</p>
      </div>
    </div>
  );
};

const Card = ({ feature, width = "auto", shortImage = false, onClick }) => {
  const { imageUrl, isFavorite, avitoUrl, address } = feature;
  const location = useLocation();
  const selectionId = new URLSearchParams(location.search).get('selectionId'); 

  const handleClick = () => {
    onClick(feature);
  };

  return (
    <div className="cursor-pointer" onClick={handleClick}>
      <div
        className="bg-white border border-gray-200 rounded-2xl relative"
        style={{
          width,
          boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div
          className={classNames("bg-cover m-1.5 relative", {
            "h-44": shortImage,
            "h-52": !shortImage,
          })}
          style={{
            backgroundImage: `url("${imageUrl}")`,
            borderRadius: 11.28,
            position: "relative",
          }}
        >
          {selectionId && (
            <FavoriteIcon
              selectionId={selectionId} 
              developmentId={feature.id}
              initialFavorite={isFavorite}
            />
          )}
        </div>
        <PropertyData feature={feature} />
      </div>
    </div>
  );
};

export default Card;
