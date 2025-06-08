import PropTypes from "prop-types";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import StaticMapImage from "../StaticMapImage/StaticMap";
import { PropertyData } from "../Card/Card";

const Modal = ({ feature, onClose }) => {
  const { lon, lat } = feature.coords;
  const { imageUrl, description } = feature;

  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* gray out background */}
      <div className="justify-center items-start flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        {/* modal outer container */}
        <div
          className="shadow-lg absolute flex flex-col px-3"
          style={{ width: 800, maxWidth: "100%" }}
        >
          {/* modal inner container */}
          <div className="bg-white outline-none focus:outline-none overflow-scroll rounded-2xl my-12 relative">
            <div className="absolute top-0 right-0 m-6">
              <button
                className="z-50 h-8 w-8 bg-gray-100 hover:bg-gray-200 flex justify-center items-center rounded-md"
                onClick={onClose}
              >
                <FontAwesomeIcon
                  icon={faTimes}
                  size="lg"
                  className="text-gray-500"
                />
              </button>
            </div>

            <div
              className="bg-cover h-80 lg:h-80"
              style={{
                backgroundImage: `url("${imageUrl}")`,
              }}
            />

            <div className="p-6">
              <PropertyData feature={feature} large />

              <div className="mb-6">
                <div
                  className={`
                    text-gray-800
                    ${!expanded ? "line-clamp-5" : ""}
                    whitespace-pre-line
                  `}
                >
                  {description}
                </div>

                {!expanded && (
                  <button
                    className="mt-2 text-black underline font-medium"
                    onClick={() => setExpanded(true)}
                  >
                    Читать дальше
                  </button>
                )}
              </div>

              <div className="relative">
                <StaticMapImage lng={lon} lat={lat} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
};

Modal.propTypes = {
  feature: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Modal;
