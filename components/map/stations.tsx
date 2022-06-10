import { Paper, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/system/Box";
import { DivIcon, Icon, LeafletEvent } from "leaflet";
import React, { useEffect, useMemo, useState } from "react";
import { Marker, useMap } from "react-leaflet";
import { useRecoilState, useRecoilValue } from "recoil";
import selectedCompanies from "../../src/atoms/selected-companies";
import selectedStation from "../../src/atoms/selected-station";
import { Station, useStationsQuery } from "../../src/gql/types";

const canShowS = (zLevel: number) => zLevel >= 12;

const Stations: React.FC = () => {
  const companyIds = useRecoilValue(selectedCompanies);
  // const [zoomLevel, setZoomLevel] = useState<number>(1);
  const map = useMap();

  const [canShowStations, setCanShowStations] = useState(true);

  let timer: NodeJS.Timeout = setTimeout(() => {}, 1500);

  const { data, loading, refetch, previousData } = useStationsQuery({
    variables: {
      companyIds,
      // lat: map?.getCenter()?.lat,
      // lon: map?.getCenter()?.lng,
      // zoom: map?.getZoom(),
    },
  });

  // const zoomLevel = useMemo<number>(() => {
  //   return z;
  // }, [z]);

  const onMove = (event: LeafletEvent) => {
    if (timer) {
      clearTimeout(timer);
      // console.log("waiting for user to stop pls");
    }
    timer = setTimeout(() => {
      onChange(event, map.getZoom());
    }, 1000);
  };

  const onChange = (event: LeafletEvent, z: number) => {
    // const z = map.getZoom();
    //if (!canShow) return;
    const bounds = map.getBounds();
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();
    if (canShowS(z)) refetch({ north, west, south, east, companyIds });
  };

  const updateZoom = () => {
    const z = map.getZoom();

    if (!isNaN(z)) {
      setCanShowStations(canShowS(z));
    }
  };

  useEffect(() => {
    map.addEventListener("moveend", onMove);
    map.addEventListener("zoomend", updateZoom);

    return () => {
      map.removeEventListener("moveend", onMove);
      map.removeEventListener("zoomend", updateZoom);
    };
  }, []);

  const markers = useMemo<Station[]>(() => {
    if (!data || !data.stations) return [];
    // console.log("Showing", data.stations.length, "stations");
    return data.stations as Station[];
  }, [data]);

  if (loading && !previousData) {
    return <CircularProgress />;
  }

  return (
    <>
      <Fade in={!canShowStations} unmountOnExit>
        <Box
          className="zoom-in-alert"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Paper sx={{ padding: 4, opacity: 0.85 }}>
            <Typography variant="h6">Zoom in to see stations</Typography>
          </Paper>
        </Box>
      </Fade>
      {loading &&
        previousData &&
        canShowStations &&
        previousData.stations?.map((station) => (
          <StationMarker station={station as Station} key={station?.id} />
        ))}
      {canShowStations &&
        markers.map((station) => (
          <StationMarker station={station as Station} key={station?.id} />
        ))}
    </>
  );
};

interface IStationMarker {
  station: Station;
}

const getSize = (zoomLevel: number, selected: boolean): number => {
  const base = selected ? 45 : 40;

  return base;
  // TODO: FIX
  // bigger zoom level = smaller size
  //return base / Math.pow(2, zoomLevel);
};

const StationMarker: React.FC<IStationMarker> = ({ station }) => {
  const map = useMap();

  const [selected, setSelected] = useRecoilState(selectedStation);

  const select = (station: Station) => {
    setSelected(station);
    map.panTo([station.lat, station.lon], { animate: true });
  };

  const isSelected = useMemo(() => station.id === selected?.id, [selected]);

  const s = useMemo(
    () => getSize(map.getZoom(), isSelected),
    [map, isSelected]
  );

  const url = station?.company?.logo_img;
  const uri = url?.startsWith("http") ? url : `/stations/${url}`;

  return (
    <Marker
      icon={
        new Icon({
          iconUrl: uri,
          //html: `<div className="mrkr"></div>`,
          iconSize: [s, s],
          className: selected?.id == station?.id ? "selected" : "",
        })
      }
      key={station?.id}
      eventHandlers={{
        click: () => select(station),
      }}
      position={[station?.lat ?? 0, station?.lon ?? 0]}
    ></Marker>
  );
};

export default Stations;
