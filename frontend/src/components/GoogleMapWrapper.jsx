// src/components/GoogleMapWrapper.jsx
import React from 'react';
// [수정] Polyline 추가
import { 
    GoogleMap as OriginalMap, 
    Marker as OriginalMarker, 
    Polyline as OriginalPolyline, 
    useJsApiLoader as useOriginalLoader, 
    Autocomplete as OriginalAutocomplete 
} from '@react-google-maps/api';
import { GOOGLE_MAPS_LIBRARIES } from '../constants';

// 1. Loader
export const useJsApiLoader = ({ id, googleMapsApiKey, libraries }) => {
    const libs = libraries || GOOGLE_MAPS_LIBRARIES;
    return useOriginalLoader({
        id,
        googleMapsApiKey,
        libraries: libs
    });
};

// 2. Map Wrapper
export const GoogleMap = ({ mapContainerStyle, center, zoom, onLoad, onUnmount, onClick, options, children }) => {
    return (
        <OriginalMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={onClick}
            options={options}
        >
            {children}
        </OriginalMap>
    );
};

// 3. Marker Wrapper
export const Marker = (props) => <OriginalMarker {...props} />;

// 4. [신규] Polyline Wrapper (경로 그리기용)
export const Polyline = (props) => <OriginalPolyline {...props} />;

// 5. Autocomplete Wrapper
export const Autocomplete = ({ onLoad, onPlaceChanged, children }) => {
    return (
        <OriginalAutocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
            {children}
        </OriginalAutocomplete>
    );
};