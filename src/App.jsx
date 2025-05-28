"use client";

import { useState, useRef, useEffect } from "react";
import { SearchBox } from "@mapbox/search-js-react";
import mapboxgl from "mapbox-gl";

import { useSearchParams } from "react-router-dom";

import Map from "./component/Map/Map";
import Card from "./component/Card/Card";
import Modal from "./component/Modal/Modal";
import InfraFilters from "./component/InfraFilters/InfraFilters";
import RadiusSlider from "./component/InfraFilters/RadiusSlider";

import housebuyLogo from "./img/housebuy-logo.svg";
import { accessToken } from "./const/accessToken";
import {
  searchDevelopments,
  fetchInfrastructureRadius,
  buildRouteBetweenPoints,
} from "./api/api";
import FILTERS from "./component/InfraFilters/FiltersTypes";

import "./styles.css";

export default function Home() {
  const [currentViewData, setCurrentViewData] = useState([]);
  const [infrastructure, setInfrastructure] = useState([]);
  const [activeFeature, setActiveFeature] = useState();
  const [developmentId, setDevelopmentId] = useState();
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState(FILTERS.map((f) => f.id));
  const [radius, setRadius] = useState(3000);
  const [routeData, setRouteData] = useState(null);

  // a ref to hold the Mapbox GL JS Map instance
  const mapInstanceRef = useRef();

  const [searchParams] = useSearchParams();
  const hideHeaders = searchParams.get("hideHeaders");

  // when the map loads
  const handleMapOnBoundsChange = async (map) => {
    mapInstanceRef.current = map;

    const bounds = map.getBounds();

    const topLeftLat = bounds.getNorthEast().lat;
    const topLeftLon = bounds.getSouthWest().lng;
    const bottomRightLat = bounds.getSouthWest().lat;
    const bottomRightLon = bounds.getNorthEast().lng;

    try {
      const result = await searchDevelopments({
        board: {
          topLeftLat,
          topLeftLon,
          bottomRightLat,
          bottomRightLon,
        },
      });
      setCurrentViewData(result.developments);
    } catch (err) {
      console.error("Ошибка при получении ЖК:", err.message);
    }
  };

  const toggleFilter = (filterId) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleFeatureClick = (feature) => {
    setActiveFeature(feature);
  };

  const handleMarkerFeatureClick = (feature) => {
    setDevelopmentId(feature.id);
  };

  const handleInfraMarkerClick = async (infra) => {
    if (!developmentId) return;
    const result = await buildRouteBetweenPoints(developmentId, infra.id);
    setRouteData(result);
  };

  // when the modal is closed, clear the active feature
  const handleModalClose = () => {
    setActiveFeature(undefined);
  };

  // set the search value as the user types
  const handleSearchChange = (newValue) => {
    setSearchValue(newValue);
  };

  useEffect(() => {
    if (!developmentId) return;
    async function loadData() {
      try {
        const data = await fetchInfrastructureRadius(developmentId, radius);
        setInfrastructure(
          data.filter((d) => activeFilters.includes(d.objType))
        );
      } catch (err) {
        console.error("Ошибка загрузки инфраструктуры:", err.message);
      }
    }
    loadData();
  }, [activeFilters, radius, developmentId]);

  return (
    <>
      {activeFeature && (
        <Modal feature={activeFeature} onClose={handleModalClose} />
      )}
      <main className="flex flex-col h-full">
        {!hideHeaders && (
          <>
            <div className="flex shrink-0 justify-center h-16 items-center border-b border-gray-200 ">
              <div
                className="bg-contain bg-center bg-no-repeat"
                style={{
                  height: 30,
                  width: 165,
                  backgroundImage: `url(${housebuyLogo})`,
                }}
              ></div>
            </div>
          </>
        )}
        <div className="relative lg:flex grow shrink min-h-0">
          <div className="grow shrink-0 relative h-full lg:h-auto">
            <div className="absolute top-3 left-3 z-10">
              <SearchBox
                className="w-32"
                options={{
                  proximity: [-75.16805, 39.93298],
                  types: [
                    "postcode",
                    "place",
                    "locality",
                    "neighborhood",
                    "street",
                    "address",
                  ],
                  language: "ru",
                  country: "RU",
                }}
                value={searchValue}
                onChange={handleSearchChange}
                accessToken={accessToken}
                mapboxgl={mapboxgl}
                placeholder="Поиск по адресу, городу, почтовому индексу и т.д."
                map={mapInstanceRef.current}
                theme={{
                  variables: {
                    fontFamily: '"Open Sans", sans-serif',
                    fontWeight: 300,
                    unit: "16px",
                    borderRadius: "8px",
                    boxShadow: "0px 2.44px 9.75px 0px rgba(95, 126, 155, 0.2)",
                  },
                }}
              />
            </div>
            <Map
              data={currentViewData}
              infrastructure={infrastructure}
              routeGeoJSON={routeData}
              onBoundsChange={handleMapOnBoundsChange}
              onFeatureClick={handleFeatureClick}
              onMarkerFeatureClick={handleMarkerFeatureClick}
              onInfraMarkerClick={handleInfraMarkerClick}
            ></Map>
          </div>

          {/* sidebar */}
          <div className="relative lg:static p-4 w-full max-w-full lg:max-w-96 shadow-xl z-10 overflow-y-auto h-full lg:h-auto bg-white">
            <div className="text-2xl text-black font-semibold w-full mb-1.5">
              Жилые комплексы в этой области
            </div>
            <div className="mb-4">
              <div className="font-medium text-gray-500">
                {currentViewData.length} ЖК
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {currentViewData.map((feature, i) => (
                <div key={i} className="mb-1.5">
                  <Card feature={feature} onClick={handleFeatureClick} />
                </div>
              ))}
            </div>
          </div>
          {/* end sidebar */}
        </div>

        <div
          className="absolute bottom-4 z-40 flex items-center gap-6 p-3 rounded shadow-md"
          style={{
            left: "calc(50% - 650px)",
            maxWidth: "100%",
          }}
        >
          <InfraFilters
            filters={FILTERS}
            activeFilters={activeFilters}
            onToggle={toggleFilter}
          />
          <RadiusSlider radius={radius} onChange={setRadius} />
        </div>
      </main>
    </>
  );
}
