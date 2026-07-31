import React, { createContext, useContext, useState, ReactNode } from "react";

interface LocationData {
  address: string;
  coords: {
    latitude: string;
    longitude: string;
  };
}

interface LocationContextType {
  location: LocationData | null;
  setLocation: (loc: LocationData | null) => void;
}

const LocationContext = createContext<LocationContextType>({
  location: null,
  setLocation: () => {},
});

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<LocationData | null>(null);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
