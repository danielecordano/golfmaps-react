import React, { useState, useEffect } from "react";
import { GoogleMap, InfoWindow, Polyline } from "@react-google-maps/api";
import "./styles.css";
/* global google */

function Course({
  holes,
  selected,
  handleClick,
  handleCloseClick,
  handleEdit,
  handleLoad,
  handleUnmount,
  polylinesRef,
  isImperial
}) {
  const [map, setMap] = useState(null);
  useEffect(() => {
    if (map) {
      const newCenter = {
        lat: (holes[selected][0].lat + holes[selected][1].lat) / 2,
        lng: (holes[selected][0].lng + holes[selected][1].lng) / 2
      };
      map.panTo(newCenter);
    }
  }, [map, holes, selected]);
  const mapOptions = {
    keyboardShortcuts: false,
    panControl: false,
    zoomControl: false,
    rotateControl: true,
    rotateControlOptions: {
      position: google.maps.ControlPosition.LEFT_BOTTOM
    },
    streetViewControl: false,
    mapTypeControl: false,
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    fullscreenControl: false,
    zoom: 18,
    heading: 0,
    tilt: 45
  };
  const polyOptions = {
    strokeColor: "white",
    strokeOpacity: 1,
    strokeWeight: 4,
    editable: false
  };
  const polyOptionsSelected = {
    strokeColor: "orange",
    strokeOpacity: 1,
    strokeWeight: 4,
    editable: true
  };
  const rad = (x) => {
    return (x * Math.PI) / 180;
  };
  const fastHaversine = (p1, p2) => {
    const lat = rad(p1.lat);
    const cLat = Math.cos(lat);
    const dLat = rad(p2.lat - p1.lat);
    const dLong = rad(p2.lng - p1.lng);
    const sdLat = dLat / 2;
    const sdLong = dLong / 2;
    const a = sdLat * sdLat + cLat * cLat * sdLong * sdLong;
    const c = (2 + a) * Math.sqrt(a);
    const radius = isImperial ? 6975220 : 6378137;
    const r = radius * c;
    return r;
  };
  return (
    <GoogleMap
      id="map"
      mapContainerStyle={{ width: "100%", height: "100%" }}
      options={mapOptions}
      mapTypeId={"satellite"}
      onLoad={(loadedMap) => setMap(loadedMap)}
    >
      {holes.map((hole, index) => (
        <React.Fragment key={index}>
          <Polyline
            ref={polylinesRef[index]}
            path={hole}
            options={selected === index ? polyOptionsSelected : polyOptions}
            onClick={handleClick(index)}
            onMouseUp={handleEdit(index)}
            onLoad={handleLoad(index)}
            onUnmount={handleUnmount(index)}
          />
          {selected === index &&
            hole.map((vertex, vindex, vertices) => {
              if (vindex > 0)
                return (
                  <InfoWindow
                    key={vindex}
                    position={vertex}
                    onCloseClick={handleCloseClick(index, vindex)}
                  >
                    <p>
                      {fastHaversine(vertex, vertices[vindex - 1]).toFixed(0) +
                        (isImperial ? " yd" : " mt")}
                    </p>
                  </InfoWindow>
                );
              else
                return (
                  <InfoWindow key={vindex} position={vertex}>
                    <p>{"hole " + (index + 1).toFixed(0)}</p>
                  </InfoWindow>
                );
            })}
        </React.Fragment>
      ))}
    </GoogleMap>
  );
}

export default Course;
