"use client";

import { useState, useRef, useEffect } from "react";
import { SearchBox } from "@mapbox/search-js-react";
import { useLocation } from "react-router-dom";
import mapboxgl from "mapbox-gl";

import Map from "../component/Map/Map";
import Card from "../component/Card/Card";
import Modal from "../component/Modal/Modal";
import InfraFilters from "../component/InfraFilters/InfraFilters";
import RadiusSlider from "../component/InfraFilters/RadiusSlider";

import { accessToken } from "../const/accessToken";
import {
  searchDevelopments,
  fetchInfrastructureRadius,
  buildRouteBetweenPoints,
  fetchInfrastructureHeatmap,
} from "../api/api";
import FILTERS from "../component/InfraFilters/FiltersTypes";

import "../styles.css";

const MapPage = () => {
  const [currentViewData, setCurrentViewData] = useState([]);
  const [infrastructure, setInfrastructure] = useState([]);
  const [activeFeature, setActiveFeature] = useState();
  const [selectedDevelopment, setSelectedDevelopment] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState(FILTERS.map((f) => f.id));
  const [radius, setRadius] = useState(3000);
  const [routeData, setRouteData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [isHeatmapVisible, setHeatmapVisible] = useState(true);
  const location = useLocation();

  const mapInstanceRef = useRef();
  const selectionId = new URLSearchParams(location.search).get("selectionId");

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
        selectionId,
      });
      setCurrentViewData(result.developments);
    } catch (err) {
      console.error("Ошибка при получении ЖК:", err.message);
    }

    try {
      const rawFeatures = await fetchInfrastructureHeatmap({
        bbox: { topLeftLat, topLeftLon, bottomRightLat, bottomRightLon },
      });
      setHeatmapData({
        type: "FeatureCollection",
        features: rawFeatures.map((item) => ({
          type: "Feature",
          geometry: item.geometry,
          properties: {
            total_weight: item.total_weight,
          },
        })),
      });
    } catch (err) {
      console.error("Ошибка при получении тепловой карты:", err.message);
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
    setSelectedDevelopment(feature);
    setRouteData(null); // Сбросить маршрут при выборе нового ЖК
  };

  const handleInfraMarkerClick = async (infra) => {
    if (!selectedDevelopment) return;
    const result = await buildRouteBetweenPoints(
      selectedDevelopment.id,
      infra.id
    );
    setRouteData(result);
  };

  const handleClearSelection = () => {
    setSelectedDevelopment(null);
    setInfrastructure([]);
    setRouteData(null);
  };

  const toggleHeatmap = () => {
    setHeatmapVisible((prev) => !prev);
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
    if (!selectedDevelopment) {
      setInfrastructure([]); // Очистить инфраструктуру, если ЖК не выбран
      return;
    }
    async function loadData() {
      try {
        const data = await fetchInfrastructureRadius(
          selectedDevelopment.id,
          radius
        );
        setInfrastructure(
          data.filter((d) => activeFilters.includes(d.objType))
        );
      } catch (err) {
        console.error("Ошибка загрузки инфраструктуры:", err.message);
      }
    }
    loadData();
  }, [activeFilters, radius, selectedDevelopment]);

  return (
    <>
      {activeFeature && (
        <Modal feature={activeFeature} onClose={handleModalClose} />
      )}
      <main className="flex flex-col h-full">
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
            {/* Custom map controls */}
            <div className="absolute top-[98px] right-[10px] z-10">
              <div className="bg-white rounded shadow-md flex flex-col">
                <button
                  onClick={toggleHeatmap}
                  className={`w-[30px] h-[30px] flex items-center justify-center hover:bg-gray-100 ${
                    isHeatmapVisible ? "text-blue-600" : "text-gray-500"
                  } ${!selectedDevelopment ? "rounded" : "rounded-t"}`}
                  title="Показать/скрыть тепловую карту"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.0001 1.62329L4.16748 6.10303V15.0625L12.0001 19.5422L19.8327 15.0625V6.10303L12.0001 1.62329Z"></path>
                  </svg>
                </button>
                {selectedDevelopment && (
                  <button
                    onClick={handleClearSelection}
                    className="w-[30px] h-[30px] flex items-center justify-center rounded-b hover:bg-gray-100 text-gray-700 border-t border-gray-200"
                    title="Очистить выбор"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <Map
              data={currentViewData}
              infrastructure={infrastructure}
              routeGeoJSON={routeData}
              heatmapData={isHeatmapVisible ? heatmapData : null}
              onBoundsChange={handleMapOnBoundsChange}
              onFeatureClick={handleFeatureClick}
              onMarkerFeatureClick={handleMarkerFeatureClick}
              onInfraMarkerClick={handleInfraMarkerClick}
              selectedDevelopment={selectedDevelopment}
              radius={radius}
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

        {selectedDevelopment && (
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
        )}
      </main>
    </>
  );
};

export default MapPage;
