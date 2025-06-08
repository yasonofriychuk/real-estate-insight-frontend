import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import { accessToken } from "../../const/accessToken";

const StaticMapImage = ({ lng, lat }) => {
  const [width, setWidth] = useState(0);
  const [height] = useState(160);
  const ref = useRef(null);

  useEffect(() => {
    setWidth(ref.current.clientWidth);
  }, []);

  const staticImageUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+ea580b(${lng},${lat})/${lng},${lat},15,0,0/${width}x${height}@2x?access_token=${accessToken}`;

  const zoom = 15; // Используемое значение зума

  return (
    <div className="relative" ref={ref}>
      <div
        className="bg-cover rounded-lg h-40 lg:h-40"
        style={{
          backgroundImage: width && `url("${staticImageUrl}")`,
        }}
      />
      {lat && lng && (
        <div className="absolute bottom-2 right-2 flex gap-2 bg-white/80 rounded-md p-1">
          <a
            href={`https://2gis.ru/?m=${lng}%2C${lat}%2F${zoom}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/2gis.png" alt="2ГИС" className="h-6" />
          </a>
          <a
            href={`https://yandex.ru/maps/?ll=${lng}%2C${lat}&z=${zoom}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/yandex.svg" alt="Яндекс.Карты" className="h-6" />
          </a>
        </div>
      )}
    </div>
  );
};

StaticMapImage.propTypes = {
  lat: PropTypes.any,
  lng: PropTypes.any,
};

export default StaticMapImage;
